import { PrismaService } from 'src/common/database/services/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from 'src/generated/prisma/client';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';
import { CreateRoleDto, UpdateRoleDto, RoleDto } from '../dtos/role.dto';
import { HelperPaginationService } from 'src/common/helper/services/helper.pagination.service';
import { PaginationParamsDto } from 'src/common/helper/dtos';

@Injectable()
export class RoleService {
    constructor(
        private prisma: PrismaService,
        private helperPaginationService: HelperPaginationService
    ) {}

    async getRoles(
        query: PaginationParamsDto
    ): Promise<ApiPaginatedDataDto<RoleDto>> {
        return await this.helperPaginationService.paginate(
            this.prisma.role,
            query
        );
    }

    async detail(id: number): Promise<Role> {
        const role = await this.prisma.role.findUnique({
            where: { id },
        });
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        return role;
    }

    async create(createDto: CreateRoleDto): Promise<RoleDto> {
        const role = await this.prisma.role.create({
            data: createDto,
        });
        return role;
    }

    async update(id: number, updateDto: UpdateRoleDto): Promise<void> {
        await this.prisma.role.update({
            where: { id },
            data: updateDto,
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.role.delete({
            where: { id },
        });
    }
}
