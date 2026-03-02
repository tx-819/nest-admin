import { faker } from '@faker-js/faker';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User } from 'src/generated/prisma/client';
import { Exclude } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseResponseDto } from 'src/common/dtos';

export class UserDto extends BaseResponseDto implements User {
    @ApiProperty({
        example: faker.internet.email(),
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: faker.image.avatar(),
        required: false,
        nullable: true,
    })
    @IsString()
    @IsOptional()
    avatar: string | null;

    @ApiProperty({
        example: faker.internet.username(),
    })
    @IsString()
    username: string;

    @ApiProperty({
        example: faker.helpers.arrayElement(Object.values(['admin', 'user'])),
    })
    @IsEnum(['admin', 'user'])
    roles: string[];

    @ApiHideProperty()
    @Exclude()
    password: string;
}
