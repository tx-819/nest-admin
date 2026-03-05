import { PrismaService } from 'src/common/database/services/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User, Role } from 'src/generated/prisma/client';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';
import {
    CreateUserDto,
    UpdateUserDto,
    UserDto,
    UserWithRolesDto,
} from '../dtos/user.dto';
import { HelperPaginationService } from 'src/common/helper/services/helper.pagination.service';
import { PaginationParamsDto } from 'src/common/helper/dtos';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private helperPaginationService: HelperPaginationService
    ) {}

    async getUsers(
        query: PaginationParamsDto
    ): Promise<ApiPaginatedDataDto<UserWithRolesDto>> {
        const result = await this.helperPaginationService.paginate<
            User & { roles: { role: Role }[] }
        >(this.prisma.user, query, {
            include: {
                roles: { include: { role: true } },
            },
        });
        return {
            ...result,
            items: result.items.map(({ roles, ...user }) => ({
                ...user,
                roles: roles.map(r => r.role),
            })),
        };
    }

    async detail(id: number): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findOne(username: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { username },
        });
        return user ?? null;
    }

    async create(createDto: CreateUserDto): Promise<UserDto> {
        const { rolesIds, ...data } = createDto;
        let dataToCreate: Prisma.UserCreateInput = data;
        if (rolesIds !== undefined) {
            dataToCreate.roles = {
                create: rolesIds.map(roleId => ({
                    role: { connect: { id: roleId } },
                })),
            };
        }
        return await this.prisma.user.create({
            data: dataToCreate,
        });
    }

    async update(id: number, updateDto: UpdateUserDto): Promise<void> {
        const { rolesIds, ...data } = updateDto;
        const dataToUpdate: Prisma.UserUpdateInput = { ...data };
        if (rolesIds !== undefined) {
            dataToUpdate.roles = {
                deleteMany: {},
                ...(rolesIds.length > 0
                    ? {
                          create: rolesIds.map(roleId => ({
                              role: { connect: { id: roleId } },
                          })),
                      }
                    : {}),
            };
        }
        await this.prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }

    async detailWithRoles(id: number): Promise<UserWithRolesDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { roles: true },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const roleIds = user.roles.map(role => role.roleId);
        if (roleIds.length === 0) {
            return {
                ...user,
                roles: [],
            };
        }
        const roles = await this.prisma.role.findMany({
            where: { id: { in: user.roles.map(role => role.roleId) } },
        });
        return {
            ...user,
            roles,
        };
    }
}
