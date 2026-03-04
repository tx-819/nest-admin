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
import { UserService } from '../services/user.service';
import { PaginationParamsDto } from 'src/common/helper/dtos';
import { ApiOperation } from '@nestjs/swagger';
import { DocPaginatedResponse } from 'src/common/doc/decorators/doc.paginated.decorator';
import { UpdateUserDto, UserDto } from '../dtos/user.dto';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';
import { CreateUserDto } from '../dtos/user.dto';
import { DocResponse } from 'src/common/doc/decorators/doc.response.decorator';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get()
    @ApiOperation({ summary: '获取用户列表' })
    @DocPaginatedResponse({ serialization: UserDto })
    async getUsers(
        @Query() query: PaginationParamsDto
    ): Promise<ApiPaginatedDataDto<UserDto>> {
        return await this.userService.getUsers(query);
    }

    @Post()
    @ApiOperation({ summary: '创建用户' })
    @DocResponse()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<void> {
        await this.userService.create(createUserDto);
    }

    @Put(':id')
    @ApiOperation({ summary: '更新用户' })
    @DocResponse()
    async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<void> {
        await this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: '删除用户' })
    @DocResponse()
    async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.userService.delete(id);
    }
}
