import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/modules/user/services/user.service';
import { TokenService } from './token.service';
import { CreateUserDto, UserDto } from 'src/modules/user/dtos/user.dto';
import { compare, hash } from 'bcrypt';
import { RoleService } from 'src/modules/role/services/role.service';
import { User } from 'src/generated/prisma/client';
import { MenuTreeDto } from 'src/modules/permission/dtos/menu.dto';
import { PermissionService } from 'src/modules/permission/services/permission.service';
import { uniqBy } from 'lodash';
import { SendLoginEmailDto } from '../dtos/auth.dto';
import { EmailQueueService } from 'src/common/queue/services/email-queue.service';
import { ConfigService } from '@nestjs/config';
import { renderMagicLoginEmail } from 'src/common/email/templates/magic-login.template';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
        private roleService: RoleService,
        private permissionService: PermissionService,
        private emailQueueService: EmailQueueService,
        private configService: ConfigService
    ) {}

    async createToken(userId: number): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const user = await this.userService.detail(userId);
        const { accessToken, refreshToken } =
            await this.tokenService.generateToken(user);
        return { accessToken, refreshToken };
    }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userService.findOne(username);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (!(await compare(password, user.password))) {
            return null;
        }
        const { password: _, ...result } = user;
        return result;
    }

    async register(registerDto: CreateUserDto): Promise<UserDto> {
        const user = await this.userService.findOne(registerDto.username);
        if (user) {
            throw new BadRequestException('User already exists');
        }
        const hashedPassword = await hash(registerDto.password, 12);
        await this.userService.create({
            ...registerDto,
            password: hashedPassword,
        });
        const created = await this.userService.findOne(registerDto.username);
        if (!created) {
            throw new BadRequestException('User creation failed');
        }
        const { password: _, ...result } = created;
        return result as UserDto;
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        const userId =
            await this.tokenService.getUserIdByRefreshToken(refreshToken);
        if (userId == null) {
            throw new ForbiddenException('Invalid refresh token');
        }
        await this.tokenService.verifyRefreshToken(userId, refreshToken);
        const user = await this.userService.detail(userId);
        const accessToken = await this.tokenService.createAccessToken(user);
        return { accessToken };
    }

    async me(userId: number): Promise<UserDto> {
        return this.userService.detailWithRoles(userId);
    }

    async getMenuTreeByUser(user: User): Promise<MenuTreeDto[]> {
        if (user.isSuper) {
            const permissions =
                await this.permissionService.getAllPermissions();
            return this.permissionService.buildMenuTrees(permissions);
        }
        const roles = await this.roleService.getRolesByUser(user);
        if (roles.length === 0) return [];
        const roleIds = roles.map(r => r.id);
        const permissions =
            await this.permissionService.getPermissionsByRoles(roleIds);
        const uniquePermissions = uniqBy(permissions, 'id');
        return this.permissionService.buildMenuTrees(uniquePermissions);
    }

    async sendLoginEmail(sendLoginEmailDto: SendLoginEmailDto): Promise<void> {
        const { email } = sendLoginEmailDto;
        const user = await this.userService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const token = await this.tokenService.generateLoginToken(user);
        const magicLoginTtl =
            this.configService.get<number>('auth.magicLoginToken.ttl') ??
            60 * 5;
        const appHost = this.configService.get<string>('app.host');
        const appPort = this.configService.get<number>('app.port');
        await this.emailQueueService.addMail({
            to: email,
            subject: '一键登录',
            html: renderMagicLoginEmail({
                loginUrl: `http://${appHost}:${appPort}/auth/magic-login?token=${token}`,
                expiresInMinutes: Math.floor(magicLoginTtl / 60),
            }),
        });
    }
}
