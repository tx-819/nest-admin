import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { PaginationParamsDto } from 'src/common/helper/dtos';
import { ApiOperation } from '@nestjs/swagger';
import { DocPaginatedResponse } from 'src/common/doc/decorators/doc.paginated.decorator';
import { UpdateRoleDto, RoleDto } from '../dtos/role.dto';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';
import { CreateRoleDto } from '../dtos/role.dto';
import { DocResponse } from 'src/common/doc/decorators/doc.response.decorator';

@Controller('role')
export class RoleController {
    constructor(private roleService: RoleService) {}

    @Get()
    @ApiOperation({ summary: '获取角色列表' })
    @DocPaginatedResponse({ serialization: RoleDto })
    async getRoles(
        @Query() query: PaginationParamsDto
    ): Promise<ApiPaginatedDataDto<RoleDto>> {
        return await this.roleService.getRoles(query);
    }

    @Get(':id')
    @ApiOperation({ summary: '获取角色详情' })
    @DocResponse()
    async getRoleDetail(@Param('id', ParseIntPipe) id: number) {
        return await this.roleService.detail(id);
    }

    @Post()
    @ApiOperation({ summary: '创建角色' })
    @DocResponse()
    async createRole(@Body() createRoleDto: CreateRoleDto): Promise<void> {
        await this.roleService.create(createRoleDto);
    }

    @Put(':id')
    @ApiOperation({ summary: '更新角色' })
    @DocResponse()
    async updateRole(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRoleDto: UpdateRoleDto
    ): Promise<void> {
        await this.roleService.update(id, updateRoleDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: '删除角色' })
    @DocResponse()
    async deleteRole(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.roleService.delete(id);
    }
}
