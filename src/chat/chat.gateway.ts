import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../user/user.repository';
import * as jwt from 'jsonwebtoken';
import { UserDocument } from '../user/user.model.js';
import { AuthenticationException } from '../utils/exceptions.js';

// Map to store connected users { userId: { username, socketId } }
const connectedUsers = new Map<string, { username: string, socketId: string }>();

@Injectable()
@WebSocketGateway({ 
    cors: { origin: '*' }, 
    // This allows passing token during connection handshake
    namespace: '/chat', 
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {}

  // --- Auth Middleware for Socket Connection ---
  private async getAuthUser(client: Socket): Promise<UserDocument | null> {
    try {
      const token = client.handshake.auth.token as string;
      if (!token) return null;
      
      const secret = this.configService.get('config.jwt.secret');
      const payload = jwt.verify(token, secret) as { id: string, username: string };
      
      const user = await this.userRepository.findById(payload.id);
      if (!user || !user.isVerified) {
        throw new AuthenticationException('User not authenticated or unverified.');
      }
      
      // Attach user object to socket data for easy access later
      (client as any).user = user;
      return user;
      
    } catch (e) {
      console.error('Socket Authentication Error:', e.message);
      return null;
    }
  }

  // --- Socket.IO Lifecycle Hooks ---

  async handleConnection(client: Socket): Promise<void> {
    const user = await this.getAuthUser(client);

    if (user) {
      const userId = user._id.toString();
      connectedUsers.set(userId, { username: user.username, socketId: client.id });
      
      // A18 Live Status: Broadcast user online status to all others
      this.server.emit('user_status_update', { 
          id: userId, 
          username: user.username, 
          isOnline: true 
      });
      console.log(`User connected: ${user.username} (${client.id})`);
    } else {
        // Disconnect unauthorized user
        client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    const user: UserDocument = (client as any).user;
    if (user) {
      const userId = user._id.toString();
      connectedUsers.delete(userId);
      
      // A18 Live Status: Broadcast user offline status
      this.server.emit('user_status_update', { 
          id: userId, 
          username: user.username, 
          isOnline: false 
      });
      console.log(`User disconnected: ${user.username} (${client.id})`);
    }
  }

  // --- Real-time Events (A18 Requirements) ---
  
  @SubscribeMessage('typing_start')
  handleTypingStart(client: Socket, payload: { userId: string }): void {
    const user: UserDocument = (client as any).user;
    if (user) {
      // Broadcast to all other clients that this user is typing
      client.broadcast.emit('typing_status', { 
          userId: user._id.toString(), 
          username: user.username, 
          isTyping: true 
      });
    }
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(client: Socket, payload: { userId: string }): void {
    const user: UserDocument = (client as any).user;
    if (user) {
      // Broadcast to all other clients that this user stopped typing
      client.broadcast.emit('typing_status', { 
          userId: user._id.toString(), 
          username: user.username, 
          isOnline: false 
      });
    }
  }
}