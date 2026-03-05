import { AuthService } from '../services/auth.service';
import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
import { LocalAuthGuard } from '../guards/local.auth.guard';
import { AuthResponseDto, LoginDto } from '../dtos/auth.dto';
import { ReqUser } from '../decorators/user-request.decorator';
import type { User } from 'src/generated/prisma/client';
import { DocResponse } from 'src/common/doc/decorators/doc.response.decorator';
import { CreateUserDto, UserDto } from 'src/modules/user/dtos/user.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { APP_ENVIRONMENT } from 'src/app/enums/app.enum';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private configService: ConfigService
    ) {}

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @ApiBody({ type: LoginDto })
    @DocResponse({ serialization: AuthResponseDto, isPublic: true })
    @Public()
    @ApiOperation({ summary: '用户登录' })
    async login(
        @ReqUser() user: User,
        @Res({ passthrough: true }) res: Response
    ) {
        const { accessToken, refreshToken } =
            await this.authService.createToken(user.id);
        const isProduction =
            this.configService.get<string>('app.env') ===
            APP_ENVIRONMENT.PRODUCTION;
        const ttl = this.configService.get<number>('auth.refreshToken.ttl');
        if (!ttl) {
            throw new Error('Refresh token TTL is not set');
        }
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: ttl * 1000,
            path: '/',
        });
        return { accessToken };
    }

    @Get('/me')
    @ApiOperation({ summary: '获取当前用户' })
    @DocResponse({ serialization: UserDto })
    async me(@ReqUser() user: User): Promise<UserDto> {
        return await this.authService.me(user.id);
    }

    @Post('register')
    @ApiOperation({ summary: '用户注册' })
    @DocResponse({ serialization: UserDto, isPublic: true })
    @Public()
    async register(@Body() registerDto: CreateUserDto): Promise<UserDto> {
        return await this.authService.register(registerDto);
    }

    @Post('refreshToken')
    @ApiOperation({ summary: '刷新令牌' })
    @DocResponse({ serialization: AuthResponseDto, isPublic: true })
    @Public()
    async refreshToken(@Req() request: Request) {
        const _refreshToken = request.cookies?.refreshToken;
        if (!_refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }
        const accessToken = await this.authService.refreshToken(_refreshToken);
        return { accessToken };
    }
}
