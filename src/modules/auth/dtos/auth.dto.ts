import { ApiProperty, PickType } from '@nestjs/swagger';
import {
    IsArray,
    IsEmail,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { UserDto } from 'src/modules/user/dtos/user.dto';
import { Type } from 'class-transformer';
import { faker } from '@faker-js/faker';

export class RegisterDto extends PickType(UserDto, [
    'username',
    'nickname',
    'email',
    'avatar',
]) {
    @ApiProperty({
        example: faker.internet.password(),
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        example: [1],
    })
    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    rolesIds: number[];
}

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

export class ActionDto {
    @ApiProperty({ description: '权限标识' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ description: '权限名称' })
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class ActionListDto {
    @ApiProperty({ description: '页面路径（全路径）' })
    @IsString()
    @IsNotEmpty()
    pathname: string;

    @ApiProperty({ description: '操作列表' })
    @Type(() => ActionDto)
    actions: ActionDto[];
}
