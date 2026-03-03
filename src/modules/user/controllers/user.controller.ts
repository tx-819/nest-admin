import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { PaginationParamsDto } from 'src/common/helper/dtos';
import { ApiOperation } from '@nestjs/swagger';
import { DocPaginatedResponse } from 'src/common/doc/decorators/doc.paginated.decorator';
import { UserDto } from '../dtos/user.dto';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';

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
}
