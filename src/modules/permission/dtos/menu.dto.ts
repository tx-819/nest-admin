import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionDto } from './permission.dto';
import { Exclude } from 'class-transformer';

export class AuthListDto {
    @ApiProperty({ description: '权限标识' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ description: '权限名称' })
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class MenuTreeDto extends PermissionDto {
    @ApiHideProperty()
    @Exclude()
    declare code: string | null;

    @ApiProperty({ type: [() => AuthListDto] })
    @Type(() => AuthListDto)
    authList: AuthListDto[] | null;

    @ApiProperty({ type: [() => MenuTreeDto] })
    @Type(() => MenuTreeDto)
    children: MenuTreeDto[] | null;
}
