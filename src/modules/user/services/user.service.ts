import { PrismaService } from 'src/common/database/services/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User, Role } from 'src/generated/prisma/client';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';
import {
    CreateUserDto,
    UpdateUserDto,
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
        console.log('result===', result);
        return {
            ...result,
            list: result.list.map(({ roles, ...user }) => ({
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
        return this.prisma.user.findUnique({
            where: { username },
        });
    }

    async create(createDto: CreateUserDto): Promise<void> {
        const { rolesIds, ...data } = createDto;
        const dataToCreate: Prisma.UserCreateInput = {
            ...data,
            ...(rolesIds?.length
                ? {
                      roles: {
                          create: rolesIds.map(roleId => ({
                              role: { connect: { id: roleId } },
                          })),
                      },
                  }
                : {}),
        };
        await this.prisma.user.create({ data: dataToCreate });
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
        await this.detail(id);
        await this.prisma.user.delete({ where: { id } });
    }

    async detailWithRoles(id: number): Promise<UserWithRolesDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { roles: { include: { role: true } } },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            ...user,
            roles: user.roles.map(r => r.role),
        };
    }
}
