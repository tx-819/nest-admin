import { faker } from '@faker-js/faker';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Role } from 'src/generated/prisma/client';
import {
    IsBoolean,
    IsOptional,
    IsString,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';
import { BaseDto } from 'src/common/helper/dtos';
import { PickType } from '@nestjs/swagger';

export class RoleDto extends BaseDto implements Role {
    @ApiProperty({
        example: faker.person.jobTitle(),
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'admin',
    })
    @IsString()
    code: string;

    @ApiProperty({
        example: faker.lorem.sentence(),
        required: false,
        nullable: true,
    })
    @IsString()
    @IsOptional()
    remark: string | null;

    @ApiProperty({
        example: faker.helpers.arrayElement([true, false]),
    })
    @IsBoolean()
    @IsOptional()
    status: boolean;
}

export class CreateRoleDto extends PickType(RoleDto, ['name', 'code', 'remark', 'status']) {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code: string;
}

export class UpdateRoleDto extends PartialType(PickType(RoleDto, ['name', 'code', 'remark', 'status'])) {}
