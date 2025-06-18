/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';


// ***********************************************************************************************
// * Definindo DTO para login do usuario                                                         *
// ***********************************************************************************************
export class LoginDto {
    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ example: 'strongPassword123' })
    password: string;
}
