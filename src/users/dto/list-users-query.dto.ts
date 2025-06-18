/* eslint-disable prettier/prettier */
import { IsOptional, IsIn } from 'class-validator';


// *********************************************************************************************
// * Dto para a ordenação e filtro de usuarios                                                 *
// *********************************************************************************************
export class ListUsersQueryDto {
    @IsOptional()
    @IsIn(['admin', 'user'], { message: 'Role must be either admin or user' })
    role?: 'admin' | 'user';

    @IsOptional()
    @IsIn(['name', 'createdAt'], { message: 'Sort by name or createdAt only' })
    sortBy?: 'name' | 'createdAt';

    @IsOptional()
    @IsIn(['asc', 'desc'], { message: 'Order must be asc or desc' })
    order?: 'asc' | 'desc';
}
