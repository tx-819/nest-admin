import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';

export class ApiPaginationMetadataDto {
    @ApiProperty({ description: 'Current page number', example: 1 })
    @Expose()
    @IsNumber()
    current: number;

    @ApiProperty({ description: 'Number of items per page', example: 10 })
    @Expose()
    @IsNumber()
    pageSize: number;

    @ApiProperty({ description: 'Total number of items', example: 100 })
    @Expose()
    @IsNumber()
    total: number;

    @ApiProperty({ description: 'Total number of pages', example: 10 })
    @Expose()
    @IsNumber()
    totalPages: number;
}

export class ApiPaginatedDataDto<T> {
    @ApiProperty({ description: 'Array of data items', isArray: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Object)
    items: T[];

    @ApiProperty({ description: 'Pagination metadata' })
    @ValidateNested()
    @Type(() => ApiPaginationMetadataDto)
    metadata: ApiPaginationMetadataDto;
}
