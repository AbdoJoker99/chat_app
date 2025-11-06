import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { ChatResolver, MessageSchema, MessageRepository } from './chat.resolver';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // 1. Mongoose: تسجيل نموذج الرسائل
    MongooseModule.forFeature([{ name: 'MessageModel', schema: MessageSchema }]),
    
    // 2. Modules المطلوبة للاستخدام (UserModule لتوفير UserRepository)
    UserModule,
    
    // 3. Passport/JWT Configuration (لأغراض المصادقة داخل الـ Guard)
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('config.jwt.secret') || 'SUPER_SECRET_KEY',
      }),
    }),
  ],
  providers: [
    // 1. GraphQL Resolver (A18/A19)
    ChatResolver,
    
    // 2. Socket.IO Gateway (A18)
    ChatGateway,
    
    // 3. Repository (للوصول للرسائل)
    MessageRepository,
  ],
  // لا يحتاج لتصدير لأن الـ Gateway والـ Resolver يتم استدعاؤهما داخلياً أو عبر GraphQL
})
export class ChatModule {}