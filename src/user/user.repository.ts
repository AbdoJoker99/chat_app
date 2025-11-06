import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';
import { RegisterDto } from '../common/dto/auth.dto.js';

@Injectable()
export class UserRepository {
  create(registerDto: RegisterDto): any {
    throw new Error('Method not implemented.');
  }
  update(id: string, updateData: Document): any {
    throw new Error('Method not implemented.');
  }
  findOneByToken(token: string): any {
    throw new Error('Method not implemented.');
  }
  findOrCreateByGoogleId(googleId: string, email: string, username: string): any {
    throw new Error('Method not implemented.');
  }
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec(); // ✅ full user doc including isVerified
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async createUser(data: Partial<User>): Promise<User> {
    const newUser = new this.userModel(data);
    return newUser.save();
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }
}
