import { Module } from '@nestjs/common';
import { ResponseExceptionFilter } from './filters/response.exception.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
    providers: [
        {
            provide: APP_FILTER,
            useClass: ResponseExceptionFilter,
        },
    ],
})
export class ResponseModule {}
