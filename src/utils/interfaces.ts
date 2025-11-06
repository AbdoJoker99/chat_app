import { Document } from 'mongoose';
import { User } from '../user/user.model';
import { LoginDto } from '../common/dto/auth.dto';

// Abstract Interface for Repository Pattern (A19)
export interface IUserRepository {
  findOneByEmail(email: string): Promise<Document | null>;
  findOneByToken(token: string): Promise<Document | null>;
  create(userData: Partial<User>): Promise<Document>;
  update(id: string, updateData: Partial<User>): Promise<Document | null>;
  findOrCreateByGoogleId(googleId: string, email: string, username: string): Promise<Document>;
}

// Abstract Interface for Factory Pattern (A19 Requirement)
export interface IDatabaseConfig {
    getUri(): string;
}