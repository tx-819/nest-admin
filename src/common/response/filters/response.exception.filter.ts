import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    BadRequestException,
    Logger,
} from '@nestjs/common';

@Catch()
export class ResponseExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(ResponseExceptionFilter.name);
    constructor() {}

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message = '';

        if (exception instanceof BadRequestException) {
            const exceptionResponse = exception.getResponse() as any;
            const exceptionMessage = exceptionResponse.message;

            if (Array.isArray(exceptionMessage)) {
                message = exceptionMessage.join(', ');
            } else {
                message = exceptionMessage || 'Bad Request';
            }
        } else if (exception instanceof HttpException) {
            message = exception.message;
        } else {
            message = 'Internal Server Error';
        }

        // Log errors
        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `${request.method} ${request.url} - ${status}: ${message}`,
                exception instanceof Error ? exception.stack : undefined
            );
        } else if (status >= HttpStatus.BAD_REQUEST) {
            this.logger.warn(
                `${request.method} ${request.url} - ${status}: ${message}`
            );
        }

        const responseBody = {
            code: status,
            message,
        };

        response.status(status).json(responseBody);
    }
}
