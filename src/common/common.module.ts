import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configs from './configs';
import { CustomLoggerModule } from './logger/logger.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: configs,
            envFilePath: ['.env'],
            cache: true,
        }),
        CustomLoggerModule,
    ],
})
export class CommonModule {}
