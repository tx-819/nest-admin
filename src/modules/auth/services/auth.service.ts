import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { UserService } from 'src/modules/user/services/user.service';
import { TokenService } from './token.service';
import { CreateUserDto, UserDto } from 'src/modules/user/dtos/user.dto';
import { compare, hash } from 'bcrypt';

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
        if (user && (await compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async register(registerDto: CreateUserDto): Promise<UserDto> {
        const user = await this.userService.findOne(registerDto.username);
        if (user) {
            throw new BadRequestException('User already exists');
        }
        const hashedPassword = await hash(registerDto.password, 12);
        return await this.userService.create({
            ...registerDto,
            password: hashedPassword,
        });
    }
}
