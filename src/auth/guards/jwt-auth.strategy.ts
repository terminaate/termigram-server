import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject } from '@nestjs/common';
import { UsersService } from '@/users/users.service';

export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(UsersService) private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: { id: string }) {
    return await this.usersService.getUserById(payload.id);
  }
}
