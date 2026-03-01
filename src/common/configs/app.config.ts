import { registerAs } from '@nestjs/config';
import { APP_ENVIRONMENT } from 'src/app/enums/app.enum';

export default registerAs('app', () => ({
    port: process.env.APP_PORT || 3000,
    host: process.env.APP_HOST || 'localhost',
    name: process.env.APP_NAME || 'app',
    version: process.env.APP_VERSION || '1.0.0',
    logLevel: process.env.APP_LOG_LEVEL || 'info',
    env: process.env.APP_ENV || APP_ENVIRONMENT.LOCAL,
}));
