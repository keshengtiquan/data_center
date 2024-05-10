import { Controller, Get, Post, Body, HttpCode, Req, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Result } from 'src/common/result';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from './decorators/auth.decorators';
import { AccessLog } from 'src/common/decorators/recordLog.dectorator';
import { Request } from 'express';

@ApiTags('用户认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  @Post('/login')
  @HttpCode(200)
  @AccessLog({ category: 'login', name: '用户登录' })
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return Result.success(data, '登录成功');
  }

  @Post('/login/sso')
  @HttpCode(200)
  async ssoLogin(@Body() loginDto: LoginDto){
    const data = await this.authService.login(loginDto);
    return Result.success(data, '登录成功');
  }

  @ApiOperation({ summary: '验证用户' })
  @Post('/verify')
  async verifyLogin(@Body('token') token: string,@Body('url') url: string ) {
    const res = await this.authService.verifyLogin(token);
    const urlArr = url.split('?');
    const paramsArr = urlArr[1].split('=');
    if(res){
      return {
        isLogin: true,
        url: paramsArr[1] + `?token=${token}`
      }
    }else {
      return {
        isLogin: false,
      }
    }
  }

  @ApiOperation({ summary: '用户登出' })
  @ApiBearerAuth()
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @Auth()
  @AccessLog({ category: 'logout', name: '用户登出' })
  async logout(@Req() req:  Request){
    // TODO 维护一个表， 用户ID 和 token， 登录前根据header上的token查询表，存在禁止登录。同样踢人下线也可用此方法，前提是登录时存入用户ID token
    const data = await this.authService.logout(req.user);
    return Result.success(data, '用户登出成功');
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户信息' })
  @Get('/userInfo')
  @HttpCode(200)
  @Auth()
  getUserInfo(@Req() req) {
    return Result.success(req.user);
  }
}
