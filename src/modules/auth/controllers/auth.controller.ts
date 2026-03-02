import { AuthService } from '../services/auth.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/local.auth.guard';
import { LoginDto } from '../dtos/auth.dto';
import { ReqUser } from '../decorators/user-request.decorator';
import type { User } from 'src/generated/prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    login(@ReqUser() user: User) {
        return this.authService.createToken(user.id);
    }
}
