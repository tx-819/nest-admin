import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor
    extends ClassSerializerInterceptor
    implements NestInterceptor
{
    constructor(reflector: Reflector) {
        super(reflector);
    }

    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<unknown> {
        const contextOptions = this.getContextOptions(context);
        const options = {
            ...this.defaultOptions,
            ...contextOptions,
        };

        return next.handle().pipe(
            map(responseBody => {
                const ctx = context.switchToHttp();
                const response = ctx.getResponse();
                const statusCode: number = response.statusCode;

                const data = this.serialize(responseBody, options);

                return {
                    statusCode,
                    message: 'Success',
                    timestamp: new Date().toISOString(),
                    data,
                };
            })
        );
    }
}
