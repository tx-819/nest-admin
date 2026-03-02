import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    imports: [CommonModule, UserModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
