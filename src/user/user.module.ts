import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from './user.repository';
import { UserService } from '../user/user.service.js';
import { User, UserSchema } from './user.model';

@Module({
  imports: [
    // تسجيل نموذج المستخدم (User Model) في Mongoose
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    // توفير طبقة Repository Pattern
    UserRepository,
    // توفير طبقة الخدمة (Business Logic)
    UserService,
  ],
  exports: [
    // جعل UserService متاحًا للوحدات التي تستورد UserModule (مثل AuthModule و ChatModule)
    UserService,
    UserRepository // يمكن تصدير الـ Repository مباشرة لوحدات أخرى متقدمة
  ],
})
export class UserModule {}