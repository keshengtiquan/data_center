import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      //解析用户提交的bearer token header数据
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      //加密的 secret
      secretOrKey: configService.get('jwt_secret'),
    });
  }

  async validate({ id: id }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    delete user.password;
    return user;
  }
}
