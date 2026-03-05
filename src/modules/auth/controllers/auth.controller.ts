import { AuthService } from '../services/auth.service';
import {
    BadRequestException,
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
import { MenuTreeDto } from 'src/modules/permission/dtos/menu.dto';

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
            throw new BadRequestException('Refresh token TTL is not set');
        }
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: ttl * 1000,
            path: '/',
        });
        return { accessToken, user };
    }

    @Get('/me')
    @ApiOperation({ summary: '获取当前用户' })
    @DocResponse({ serialization: UserDto })
    me(@ReqUser() user: User): Promise<UserDto> {
        return this.authService.me(user.id);
    }

    @Get('menus')
    @ApiOperation({ summary: '获取当前用户拥有的菜单' })
    @DocResponse({ serialization: MenuTreeDto })
    getMenus(@ReqUser() user: User): Promise<MenuTreeDto[]> {
        return this.authService.getMenuTreeByUser(user);
    }

    @Post('register')
    @ApiOperation({ summary: '用户注册' })
    @DocResponse({ serialization: UserDto, isPublic: true })
    @Public()
    register(@Body() registerDto: CreateUserDto): Promise<UserDto> {
        return this.authService.register(registerDto);
    }

    @Post('refreshToken')
    @ApiOperation({ summary: '刷新令牌' })
    @DocResponse({ serialization: AuthResponseDto, isPublic: true })
    @Public()
    async refreshToken(@Req() request: Request) {
        const refreshToken = request.cookies?.refreshToken;
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }
        return this.authService.refreshToken(refreshToken);
    }
}
