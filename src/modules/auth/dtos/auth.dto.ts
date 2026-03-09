import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserDto } from 'src/modules/user/dtos/user.dto';
import { Type } from 'class-transformer';

export class LoginDto {
    @ApiProperty({ description: '用户名', example: 'admin' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: '密码', example: '123456' })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class AuthResponseDto {
    @ApiProperty({ description: '访问令牌' })
    @IsString()
    @IsNotEmpty()
    accessToken: string;

    @ApiProperty({ description: '用户信息' })
    @Type(() => UserDto)
    user: UserDto;
}

export class SendLoginEmailDto {
    @ApiProperty({ description: '邮箱', example: 'test@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
