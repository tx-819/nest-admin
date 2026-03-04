import { faker } from '@faker-js/faker';
import { ApiHideProperty, ApiProperty, PartialType } from '@nestjs/swagger';
import { User } from 'src/generated/prisma/client';
import { Exclude } from 'class-transformer';
import {
    IsEmail,
    IsBoolean,
    IsOptional,
    IsString,
    IsNotEmpty,
} from 'class-validator';
import { BaseDto } from 'src/common/helper/dtos';
import { PickType } from '@nestjs/swagger';

export class UserDto extends BaseDto implements User {
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
        example: faker.person.fullName(),
    })
    @IsString()
    @IsOptional()
    nickname: string | null;

    @ApiProperty({
        example: faker.helpers.arrayElement([true, false]),
    })
    @IsBoolean()
    @IsOptional()
    status: boolean;

    @ApiHideProperty()
    @Exclude()
    password: string;
}

export class CreateUserDto extends PickType(UserDto, [
    'username',
    'nickname',
    'email',
    'avatar',
]) {
    @ApiProperty({
        example: faker.internet.password(),
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class UpdateUserDto extends PickType(UserDto, [
    'nickname',
    'email',
    'avatar',
    'status',
]) {}
