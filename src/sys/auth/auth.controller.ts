import { Controller, Get, Post, Body, HttpCode, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Result } from 'src/common/result';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from './decorators/auth.decorators';

@ApiTags('用户认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);
    return Result.success(data);
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
