import { registerAs } from '@nestjs/config';
import { parseCorsOrigins } from './parse-cors-origins';

export default registerAs('app', () => ({
    port: process.env.APP_PORT || 3000,
    host: process.env.APP_HOST || 'localhost',
    name: process.env.APP_NAME || 'app',
    version: process.env.APP_VERSION || '1.0.0',
    logLevel: process.env.APP_LOG_LEVEL || 'info',
    frontendUrl: process.env.APP_FRONTEND_URL || 'http://localhost:3000',
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
}));
