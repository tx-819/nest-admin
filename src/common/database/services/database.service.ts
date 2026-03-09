import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from 'src/generated/prisma/client';

const DEFAULT_RETRY_ATTEMPTS = 10;
const RETRY_DELAY_MS = 2000;

function parseDatabaseUrl(url: string) {
    const u = new URL(url);
    const database = u.pathname.replace(/^\//, '') || undefined;
    return {
        host: u.hostname,
        port: u.port ? parseInt(u.port, 10) : 3306,
        user: u.username || undefined,
        password: u.password || undefined,
        database: database || undefined,
        connectTimeout: 15000,
        acquireTimeout: 30000,
        connectionLimit: 10,
    };
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor(private readonly configService: ConfigService) {
        const url = configService.get<string>('database.url')!;
        console.log('url', url);
        const poolConfig = parseDatabaseUrl(url);
        const adapter = new PrismaMariaDb(poolConfig, {
            onConnectionError: err => {
                console.error(
                    '[PrismaService] Database connection error:',
                    err.message
                );
            },
        });
        super({ adapter });
    }

    async onModuleInit() {
        const maxAttempts =
            Number(process.env.DB_CONNECT_RETRY_ATTEMPTS) ||
            DEFAULT_RETRY_ATTEMPTS;
        const delayMs =
            Number(process.env.DB_CONNECT_RETRY_DELAY_MS) || RETRY_DELAY_MS;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await this.$connect();
                return;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : String(err);
                console.warn(
                    `[PrismaService] Database connection attempt ${attempt}/${maxAttempts} failed:`,
                    message
                );
                if (attempt === maxAttempts) {
                    throw err;
                }
                await sleep(delayMs);
            }
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
