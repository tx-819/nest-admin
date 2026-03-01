import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from './configs';
import { CustomLoggerModule } from './logger/logger.module';
import { ResponseModule } from './response/response.module';

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
    ],
})
export class CommonModule {}
