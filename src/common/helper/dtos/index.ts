import { Transform } from 'class-transformer';
import { IsInt, Min, IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { faker } from '@faker-js/faker';
import { IPaginationParams } from '../interfaces/pagination.interface';

export class PaginationParamsDto implements IPaginationParams {
    @ApiProperty({
        example: 1,
    })
    @IsInt()
    @Min(1)
    @Transform(({ value }) => Number(value))
    current: number;

    @ApiProperty({
        example: 10,
    })
    @IsInt()
    @Min(1)
    @Transform(({ value }) => Number(value))
    pageSize: number;
}

export class BaseResponseDto {
    @ApiProperty({
        example: 1,
    })
    @IsNumber()
    id: number;

    @ApiProperty({
        example: faker.date.past().toISOString(),
    })
    @IsDate()
    createdAt: Date;

    @ApiProperty({
        example: faker.date.recent().toISOString(),
    })
    @IsDate()
    updatedAt: Date;
}
