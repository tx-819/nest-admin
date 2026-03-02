import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/services/user.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private tokenService: TokenService
    ) {}

    async createToken(userId: number) {
        const user = await this.userService.detail(userId);
        if (!user) {
            throw new ForbiddenException('User not found');
        }
        const { accessToken } = await this.tokenService.generateToken(user);
        return {
            accessToken,
        };
    }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userService.findOne(username);
        if (user && user.password === password) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
}
