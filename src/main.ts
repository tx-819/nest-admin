import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
        bufferLogs: true,
    });
    const configService = app.get(ConfigService);
    const logger = app.get(Logger);
    const port = configService.get('app.port');
    const host = configService.get('app.host');
    app.useLogger(logger);

    await app.listen(port, host);
    logger.log(`Server running on: http://${host}:${port}`);
}

void bootstrap();
