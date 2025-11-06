import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule, // يستخدم لتطبيق JWT Strategy
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('config.jwt.secret') || 'SUPER_SECRET_KEY',
        signOptions: { expiresIn: configService.get<string>('config.jwt.expiresIn') || '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // يجب تسجيل الـ Strategy هنا
    JwtStrategy, 
  ],
  exports: [AuthService, JwtModule], // تصدير الـ Service و الـ Module للوحدات الأخرى
})
export class AuthModule {}