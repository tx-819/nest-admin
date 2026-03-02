import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class TokenService {
    constructor(private jwtService: JwtService) {}

    async generateToken(user: User) {
        const accessToken = this.jwtService.sign({
            sub: user.id,
        });
        return {
            accessToken,
        };
    }
}
