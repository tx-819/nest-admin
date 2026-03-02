import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { IApiErrorResponse } from '../interfaces/response.interface';

export class ApiErrorResponseDto implements IApiErrorResponse {
    @ApiProperty({ description: 'HTTP status code', example: 200 })
    @Expose()
    @IsNumber()
    statusCode: number;

    @ApiProperty({
        description: 'Response message',
        example: 'Operation successful',
    })
    @Expose()
    @IsString()
    message: string;

    @ApiProperty({
        description: 'Timestamp of the response',
        example: new Date().toISOString(),
    })
    @Expose()
    @Type(() => Date)
    timestamp: string;

    constructor(statusCode: number, message: string, timestamp: string) {
        this.statusCode = statusCode;
        this.message = message;
        this.timestamp = timestamp;
    }
}
