import { Resolver, Query, Mutation, Args, ID, ObjectType, Field } from '@nestjs/graphql';
import { Injectable, UseGuards, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as z from 'zod';
import { User } from '../user/user.model';
import { ChatGateway } from './chat.gateway';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';

// --- Zod Schema for input validation (A18 requirement) ---
const SendMessageSchema = z.object({
  text: z.string().min(1, 'Message content cannot be empty.').max(500, 'Message is too long.'),
});

// --- Mongoose Model ---
@Schema({ timestamps: true })
export class MessageModel extends Document {
  @Prop({ required: true })
  text!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender!: User;
  createdAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(MessageModel);

// --- Repository Layer ---
@Injectable()
export class MessageRepository {
  constructor(@InjectModel(MessageModel.name) private messageModel: Model<MessageModel>) {}

  async findAll(): Promise<MessageModel[]> {
    return this.messageModel.find().populate('sender').limit(50).exec();
  }

  async create(message: Partial<MessageModel>): Promise<MessageModel> {
    const newMessage = new this.messageModel(message);
    return newMessage.save();
  }
}

// --- GraphQL Types ---
@ObjectType()
export class ChatUser {
  @Field(() => ID)
  id!: string;

  @Field()
  username!: string;
}

@ObjectType()
export class ChatMessage {
  @Field(() => ID)
  id!: string;

  @Field()
  text!: string;

  @Field(() => ChatUser)
  sender!: ChatUser;

  @Field()
  createdAt!: Date;
}

// --- Chat Resolver ---
@Injectable()
@Resolver(() => ChatMessage)
export class ChatResolver {
  constructor(
    private chatGateway: ChatGateway,
    private messageRepository: MessageRepository,
  ) {}

  @Query(() => [ChatMessage], { name: 'messages' })
  @UseGuards(JwtAuthGuard)
  async getMessages(): Promise<ChatMessage[]> {
    const messages = await this.messageRepository.findAll();
    return messages.map(m => ({
      id: m._id.toString(),
      text: m.text,
      sender: {
        id: (m.sender as any)._id.toString(),
        username: (m.sender as any).username,
      },
      createdAt: m.createdAt,
    }));
  }

  @Mutation(() => ChatMessage)
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Args('content') content: string,
    @CurrentUser() user: User,
  ): Promise<ChatMessage> {
    try {
      SendMessageSchema.parse({ text: content });
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new BadRequestException(e.errors[0]?.message || 'Invalid message.');
      }
      throw e;
    }

    const newMessage = await this.messageRepository.create({
      text: content,
      sender: user._id,
    });

    await newMessage.populate('sender');

    const messagePayload: ChatMessage = {
      id: newMessage._id.toString(),
      text: newMessage.text,
      sender: {
        id: (newMessage.sender as any)._id.toString(),
        username: (newMessage.sender as any).username,
      },
      createdAt: newMessage.createdAt,
    };

    // Emit via Socket.IO
    this.chatGateway.server.emit('chat_message', messagePayload);

    return messagePayload;
  }
}
