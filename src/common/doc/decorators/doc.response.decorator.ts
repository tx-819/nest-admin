import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

import { ApiSuccessResponseDto } from 'src/common/response/dtos/response.success.dto';
import { IResponseDocOptions } from 'src/common/response/interfaces/response.interface';

export function DocResponse<T>(
    options: IResponseDocOptions<T>
): MethodDecorator {
    const { serialization } = options;

    const schema: Record<string, any> = {
        allOf: [
            { $ref: getSchemaPath(ApiSuccessResponseDto) },
            {
                properties: {
                    statusCode: { type: 'number', example: 200 },
                    message: {
                        type: 'string',
                        example: 'Success',
                    },
                    timestamp: {
                        type: 'string',
                        example: new Date().toISOString(),
                    },
                    data: serialization
                        ? { $ref: getSchemaPath(serialization) }
                        : { type: 'object', example: {} },
                },
            },
        ],
    };

    const decorators = [
        ApiExtraModels(ApiSuccessResponseDto),
        ApiResponse({
            status: 200,
            description: 'Success',
            schema,
        }),
    ];

    if (serialization) {
        decorators.push(ApiExtraModels(serialization));
    }

    return applyDecorators(...decorators);
}
