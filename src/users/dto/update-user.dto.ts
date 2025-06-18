/* eslint-disable prettier/prettier */
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';


export class UpdateUserDto extends OmitType(PartialType(CreateUserDto), ['role'] as const) { }
