import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma1/prisma.service';
import {USER_TYPE} from "../../../common/enum";

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
    const user = await this.prisma.user.findFirst({
      where: {
        id: id,
      },
      include: {
        CompanyDept: { where: { deleteflag: 0 } },
        tenants: true,
      },
    });
    if(!user.defaultProjectId && user.userType === USER_TYPE.SYSTEM_USER) {
      const tenant = await this.prisma.tenant.findFirst({
        where: {
          deleteflag: 0
        }
      })
      user.defaultProjectId = tenant.id
    }

    delete user.password;
    return user;
  }
}
