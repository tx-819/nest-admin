import { AuthService } from '../services/auth.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local.auth.guard';
import { LoginDto, LoginResponseDto } from '../dtos/auth.dto';
import { ReqUser } from '../decorators/user-request.decorator';
import type { User } from 'src/generated/prisma/client';
import { DocResponse } from 'src/common/doc/decorators/doc.response.decorator';
import { CreateUserDto, UserDto } from 'src/modules/user/dtos/user.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @DocResponse({ serialization: LoginResponseDto })
    async login(@ReqUser() user: User) {
        return await this.authService.createToken(user.id);
    }

    @Post('register')
    @DocResponse({ serialization: UserDto })
    async register(@Body() registerDto: CreateUserDto): Promise<UserDto> {
        return await this.authService.register(registerDto);
    }
}
