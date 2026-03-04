import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from './configs';
import { CustomLoggerModule } from './logger/logger.module';
import { ResponseModule } from './response/response.module';
import { DatabaseModule } from './database/database.module';
import { RequestModule } from './request/request.module';
import { CacheModule } from './cache/cache.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: configs,
            envFilePath: ['.env'],
            cache: true,
        }),
        CustomLoggerModule,
        ResponseModule,
        RequestModule,
        CacheModule,
        DatabaseModule,
    ],
    exports: [DatabaseModule],
})
export class CommonModule {}
