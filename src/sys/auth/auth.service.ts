import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { md5 } from 'src/utils/md5';
import { ConfigService } from '@nestjs/config';
import { USER_TYPE } from 'src/common/enum';
import { ClsService } from 'nestjs-cls';
import { excludeFun } from 'src/utils/prisma';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {

  @Inject(PrismaService)
  private prisma: PrismaService;
  @Inject(JwtService)
  private jwtService: JwtService;
  @Inject(ConfigService)
  private configService: ConfigService;
  @Inject(ClsService)
  private cls: ClsService;
  @Inject(RedisService)
  private redisService: RedisService;

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        userName: loginDto.userName,
      },
      include: { tenants: { include: { tenant: true } }, roles: {include: {role: true}},CompanyDept: { where: { deleteflag: 0 } } },
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
    if(user.userType === USER_TYPE.GENERAL_USER && user.roles.length === 0) {
      throw new BadRequestException('当前用户未关联角色，请联系管理员');
    }

    //查询用户的项目是否被禁用
    if (user.userType !== USER_TYPE.SYSTEM_USER) {
      if (user.tenants.length === 0) {
        throw new BadRequestException('当前用户未关联项目，请联系管理员');
      }
      const isAllTenantForbidden = user.tenants.every((tenant) => {
        return tenant.tenant.status === '1';
      });
      if (isAllTenantForbidden) throw new BadRequestException('当前用户所属项目已禁用，请联系管理员');
    }
    
    const token = await this.jwtService.signAsync(
      {
        id: user.id,
        userName: user.userName,
        nickName: user.nickName,
        tenants: user.tenants,
        defaultProjectId: user.defaultProjectId,
      },
      {
        expiresIn: this.configService.get('jwt_access_token_expires_time') || '1d',
      },
    );
    if (token) {
      this.redisService.set(`user_${user.id}`, token);
    }

    return {
      token: token,
      userInfo: excludeFun(user, ['password']),
    };
  }

  private async token({ id, userName }) {
    return {
      token: await this.jwtService.signAsync(
        {
          id,
          userName,
        },
        {
          expiresIn: this.configService.get('jwt_access_token_expires_time') || '1d',
        },
      ),
    };
  }

  /**
   * 验证用户
   */
  async verifyLogin(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('jwt_secret'),
      });
      const loginUserToken = await this.redisService.get(`user_${payload.id}`)
      if(loginUserToken === token){
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * 登出
   * @param user
   */
  async logout(user: any) {
    const { id } = user;
    await this.redisService.del(`user_${id}`);
    return { userInfo: user };
  }
}
