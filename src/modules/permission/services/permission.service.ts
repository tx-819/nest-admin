import { PrismaService } from 'src/common/database/services/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Permission } from 'src/generated/prisma/client';
import {
    CreatePermissionDto,
    PermissionTreeDto,
    UpdatePermissionDto,
} from '../dtos/permission.dto';
import { Prisma } from 'src/generated/prisma/client';
import {
    PERMISSION_TYPE_ACTION,
    PERMISSION_TYPE_MENU,
} from '../dtos/permission.dto';

@Injectable()
export class PermissionService {
    constructor(private prisma: PrismaService) {}

    /** 获取权限树（不分页） */
    async getTree(): Promise<PermissionTreeDto[]> {
        const list = await this.prisma.permission.findMany({
            orderBy: [{ orderNo: 'asc' }, { id: 'asc' }],
        });
        return this.buildTree(list, null);
    }

    private buildTree(
        list: Permission[],
        parentId: number | null
    ): PermissionTreeDto[] {
        return list
            .filter(p => p.parentId === parentId)
            .map(item => ({
                ...item,
                children: this.buildTree(list, item.id),
            }));
    }

    async detail(id: number): Promise<Permission> {
        const permission = await this.prisma.permission.findUnique({
            where: { id },
        });
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }
        return permission;
    }

    async create(createDto: CreatePermissionDto): Promise<void> {
        const data = this.toCreateInput(createDto);
        await this.prisma.permission.create({ data });
    }

    async update(id: number, updateDto: UpdatePermissionDto): Promise<void> {
        await this.detail(id);
        const data = this.toUpdateInput(updateDto);
        await this.prisma.permission.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<void> {
        await this.detail(id);
        await this.prisma.permission.delete({ where: { id } });
    }

    private toCreateInput(
        dto: CreatePermissionDto
    ): Prisma.PermissionCreateInput {
        const isAction = dto.permissionType === PERMISSION_TYPE_ACTION;
        return {
            name: dto.name,
            code: isAction ? (dto.code ?? null) : null,
            remark: dto.remark ?? undefined,
            status: dto.status ?? true,
            permissionType: dto.permissionType,
            path: dto.path ?? undefined,
            icon: dto.icon ?? undefined,
            component: dto.component ?? undefined,
            orderNo: dto.orderNo ?? 0,
            parent:
                dto.parentId != null
                    ? { connect: { id: dto.parentId } }
                    : undefined,
        };
    }

    private toUpdateInput(
        dto: UpdatePermissionDto
    ): Prisma.PermissionUpdateInput {
        const data: Prisma.PermissionUpdateInput = {};
        if (dto.name !== undefined) data.name = dto.name;
        if (dto.remark !== undefined) data.remark = dto.remark;
        if (dto.status !== undefined) data.status = dto.status;
        if (dto.permissionType !== undefined)
            data.permissionType = dto.permissionType;
        if (dto.path !== undefined) data.path = dto.path;
        if (dto.icon !== undefined) data.icon = dto.icon;
        if (dto.component !== undefined) data.component = dto.component;
        if (dto.orderNo !== undefined) data.orderNo = dto.orderNo;
        if (dto.permissionType === PERMISSION_TYPE_ACTION && dto.code !== undefined) {
            data.code = dto.code;
        } else if (dto.permissionType === PERMISSION_TYPE_MENU) {
            data.code = null;
        }
        if (dto.parentId !== undefined) {
            data.parent =
                dto.parentId != null
                    ? { connect: { id: dto.parentId } }
                    : { disconnect: true };
        }
        return data;
    }
}
