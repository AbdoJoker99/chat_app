import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserDocument } from './user.model.js';
import { RegisterDto } from '../common/dto/auth.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  // 🔹 Find user by email (includes password hash for login)
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  // 🔹 Find user by ID (excludes password)
  async findById(id: string): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
  }

  // 🔹 Create new user
  async create(registerDto: RegisterDto): Promise<UserDocument> {
    try {
      return await this.userRepository.create(registerDto);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  // 🔹 Update user by ID
  async update(id: string, updateData: Partial<UserDocument>): Promise<UserDocument | null> {
    return this.userRepository.update(id, updateData);
  }

  // 🔹 Google OAuth helper
  async findOrCreateByGoogleId(googleId: string, email: string, username: string): Promise<UserDocument> {
    return this.userRepository.findOrCreateByGoogleId(googleId, email, username);
  }

  // 🔹 For email verification or password reset tokens
  async findByVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userRepository.findOneByToken(token);
  }
}
