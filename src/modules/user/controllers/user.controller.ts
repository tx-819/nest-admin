import {
    Body,
    Controller,
    Post,
    HttpCode,
    HttpStatus,
    Get,
    Query,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { BasePaginationQueryDto } from 'src/common/dtos';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get()
    getUsers(@Query() query: BasePaginationQueryDto) {
        return this.userService.getUsers(query);
    }
}
