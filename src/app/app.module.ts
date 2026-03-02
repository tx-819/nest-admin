import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/modules/user/user.module';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
    imports: [CommonModule, UserModule, AuthModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
