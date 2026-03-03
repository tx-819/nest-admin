import { AuthService } from '../services/auth.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local.auth.guard';
import { LoginResponseDto, LoginDto } from '../dtos/auth.dto';
import { ReqUser } from '../decorators/user-request.decorator';
import type { User } from 'src/generated/prisma/client';
import { DocResponse } from 'src/common/doc/decorators/doc.response.decorator';
import { CreateUserDto, UserDto } from 'src/modules/user/dtos/user.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiBody({ type: LoginDto })
    @DocResponse({ serialization: LoginResponseDto, isPublic: true })
    @Public()
    @ApiOperation({ summary: '用户登录', description: '用户登录' })
    async login(@ReqUser() user: User) {
        return await this.authService.createToken(user.id);
    }

    @Post('register')
    @ApiOperation({ summary: '用户注册', description: '用户注册' })
    @DocResponse({ serialization: UserDto, isPublic: true })
    @Public()
    async register(@Body() registerDto: CreateUserDto): Promise<UserDto> {
        return await this.authService.register(registerDto);
    }
}
