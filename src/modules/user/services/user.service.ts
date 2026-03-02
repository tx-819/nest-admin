import { BasePaginationQueryDto } from 'src/common/dtos';
import { PrismaService } from 'src/common/database/services/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async getUsers(query: BasePaginationQueryDto) {
        const { current, pageSize } = query;
        const skip = (current - 1) * pageSize;
        const take = pageSize;
        return this.prisma.user.findMany({
            skip,
            take,
        });
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
