import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../user/user.repository';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, ConfirmEmailDto, ForgotPasswordDto, ResetPasswordDto } from '../common/dto/auth.dto';
import { User } from '../user/user.model.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 🔹 Register new user
  async register(registerDto: RegisterDto) {
    const existing = await this.userRepository.findByEmail(registerDto.email);
    if (existing) throw new BadRequestException('Email already registered.');

    const hashed = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userRepository.createUser({
      ...registerDto,
      password: hashed,
      isVerified: false, // ✅ initially false
    });

    const accessToken = await this.getAuthToken(user);
    return { user, accessToken };
  }

  // 🔹 Validate login credentials
  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials.');

    if (!user.isVerified) throw new UnauthorizedException('Please verify your email before login.');

    return user;
  }

  // 🔹 Generate JWT token
  async getAuthToken(user: User) {
    const payload = { id: user._id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('config.jwt.secret') || 'SUPER_SECRET_KEY',
      expiresIn: '7d',
    });
    return { user, accessToken };
  }

  // 🔹 Confirm email
  async confirmEmail({ token }: ConfirmEmailDto) {
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('config.jwt.secret') || 'SUPER_SECRET_KEY',
    });

    const user = await this.userRepository.findById(decoded.id);
    if (!user) throw new UnauthorizedException('Invalid or expired token.');

    user.isVerified = true;
    await user.save();

    return { message: 'Email verified successfully.' };
  }

  // 🔹 Forgot password
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new BadRequestException('Email not found.');

    // generate and send reset token logic here...
    return { message: 'Password reset link sent to email.' };
  }

  // 🔹 Reset password
  async resetPassword(dto: ResetPasswordDto) {
    // verify token and reset logic...
    return { message: 'Password successfully reset.' };
  }

  // 🔹 Google login (placeholder)
  async googleLogin(req: any) {
    if (!req.user) throw new UnauthorizedException('No user from Google.');
    const user = req.user;
    const { accessToken } = await this.getAuthToken(user);
    return { user, accessToken };
  }
}
