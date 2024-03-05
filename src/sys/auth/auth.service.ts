import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { md5 } from 'src/utils/md5';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  @Inject(PrismaService)
  private prisma: PrismaService;
  @Inject(JwtService)
  private jwtService: JwtService;
  @Inject(ConfigService)
  private configService: ConfigService;

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        userName: loginDto.userName,
      },
    });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    if (user.password !== md5(loginDto.password)) {
      throw new BadRequestException('密码错误');
    }
    if (user.status === '1') {
      throw new BadRequestException('当前用户已禁用，请联系管理员');
    }
    //TODO 查询用户的项目是否被禁用
    return this.token(user);
  }

  private async token({ id, userName }) {
    return {
      token: await this.jwtService.signAsync(
        {
          id,
          userName,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '1d',
        },
      ),
    };
  }
}
