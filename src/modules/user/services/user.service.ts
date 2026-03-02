import { PrismaService } from 'src/common/database/services/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/generated/prisma/client';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';
import { UserResponseDto } from '../dtos/user.dto';
import { HelperPaginationService } from 'src/common/helper/services/helper.pagination.service';
import { PaginationParamsDto } from 'src/common/helper/dtos';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private helperPaginationService: HelperPaginationService
    ) {}

    async getUsers(
        query: PaginationParamsDto
    ): Promise<ApiPaginatedDataDto<UserResponseDto>> {
        return await this.helperPaginationService.paginate(
            this.prisma.user,
            query
        );
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

    async findOne(username: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
}
