import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../user/user.repository';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('config.jwt.secret') || 'SUPER_SECRET_KEY',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findById(payload.id);
    if (!user) throw new UnauthorizedException('User not found or token invalid.');

    if (!user.isVerified) throw new UnauthorizedException('Account not verified.');

    return user;
  }
}
