/* eslint-disable prettier/prettier */


// *********************************************************************************************
// * Definindo o DTO para o cadastro do usuarios                                               *
// *********************************************************************************************
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, ValidateIf, IsOptional, IsBoolean, Matches } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'Jon Doe' })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'jondoe@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'strongPassword123' })
    @Matches(/^\d{6}$/, { message: 'Password must be exactly 6 digits' })
    @ValidateIf(o => !o.isOAuth)
    @IsNotEmpty({ message: 'Password is required if not OAuth user' })
    password: string | undefined;

    @ApiPropertyOptional({ example: 'user', enum: ['admin', 'user'] })
    @IsOptional()
    role?: 'admin' | 'user';

    @ApiProperty({ required: false })
    @IsOptional()
    picture?: string;

    @IsOptional()
    isOAuth?: boolean;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    status?: boolean = true;
}

