import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../user/user.repository';
import * as jwt from 'jsonwebtoken';
import { UserDocument } from '../user/user.model.js';
import { AuthenticationException } from '../utils/exceptions';

interface TypingPayload {
  userId: string;
}

const connectedUsers = new Map<string, Set<string>>(); // supports multiple sockets per user

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {}

  private async getAuthUser(client: Socket): Promise<UserDocument | null> {
    const token = client.handshake.auth?.token;
    if (!token) return null;

    try {
      const secret = this.configService.get<string>('config.jwt.secret') || 'SUPER_SECRET_KEY';
      const payload = jwt.verify(token, secret) as { id: string; username: string };
      const user = await this.userRepository.findById(payload.id);

      if (!user || !user.isVerified) {
        throw new AuthenticationException('User not authenticated or unverified.');
      }

      (client as any).user = user;
      return user;
    } catch (err) {
      console.error('Socket Authentication Error:', err.message);
      return null;
    }
  }

  async handleConnection(client: Socket): Promise<void> {
    const user = await this.getAuthUser(client);
    if (!user) return client.disconnect(true);

    const userId = user._id.toString();
    if (!connectedUsers.has(userId)) connectedUsers.set(userId, new Set());
    connectedUsers.get(userId)?.add(client.id);

    this.server.emit('user_status_update', {
      id: userId,
      username: user.username,
      isOnline: true,
    });

    console.log(`User connected: ${user.username} (${client.id})`);
  }

  handleDisconnect(client: Socket): void {
    const user: UserDocument = (client as any).user;
    if (!user) return;

    const userId = user._id.toString();
    connectedUsers.get(userId)?.delete(client.id);

    if (!connectedUsers.get(userId)?.size) {
      connectedUsers.delete(userId);
      this.server.emit('user_status_update', {
        id: userId,
        username: user.username,
        isOnline: false,
      });
    }

    console.log(`User disconnected: ${user.username} (${client.id})`);
  }

}
