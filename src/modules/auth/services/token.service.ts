import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { User } from 'src/generated/prisma/client';
import { CacheService } from 'src/common/cache/services/cache.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
    constructor(
        private jwtService: JwtService,
        private cacheService: CacheService,
        private configService: ConfigService
    ) {}

    async generateToken(user: User) {
        const accessToken = await this.createAccessToken(user);
        const refreshToken = await this.createRefreshToken(user);
        return {
            accessToken,
            refreshToken,
        };
    }

    async createAccessToken(user: User) {
        return this.jwtService.sign({
            sub: user.id,
        });
    }

    async verifyRefreshToken(userId: number, refreshToken: string) {
        const tokenHash = createHash('sha256')
            .update(refreshToken)
            .digest('hex');
        const cachedTokenHash = await this.cacheService.get<string>(
            `refresh_token:${userId}`
        );
        if (!cachedTokenHash) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        if (cachedTokenHash !== tokenHash) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async createRefreshToken(user: User) {
        const refreshToken = randomBytes(32).toString('base64url');
        const ttl = this.configService.get<number>('auth.refreshToken.ttl');
        const tokenHash = createHash('sha256')
            .update(refreshToken)
            .digest('hex');
        await this.cacheService.set(`refresh_token:${user.id}`, tokenHash, ttl);
        await this.cacheService.set(
            `refresh_token_lookup:${tokenHash}`,
            String(user.id),
            ttl
        );
        return refreshToken;
    }

    /** 通过 refreshToken 查出 userId，用于刷新接口未带 JWT 时 */
    async getUserIdByRefreshToken(refreshToken: string): Promise<number | null> {
        const tokenHash = createHash('sha256')
            .update(refreshToken)
            .digest('hex');
        const userIdStr = await this.cacheService.get<string>(
            `refresh_token_lookup:${tokenHash}`
        );
        return userIdStr ? parseInt(userIdStr, 10) : null;
    }
}
