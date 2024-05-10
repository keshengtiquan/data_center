import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  /**
   * 旧密码
   */
  @IsNotEmpty({ message: '旧密码不能为空' })
  password: string;

  /**
   * 新密码
   */
  @IsNotEmpty({ message: '新密码不能为空' })
  newPassword: string;

  /**
   * 确认密码
   */
  @IsNotEmpty({ message: '旧密码不能为空' })
  confirmPassword: string;
}
