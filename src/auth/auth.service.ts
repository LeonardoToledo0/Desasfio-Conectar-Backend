/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    // *********************************************************************************************
    // * createUser: Cria um usuário normal com senha                                            *
    // *                                                                                           *
    // * Recebe um DTO com os dados do usuário, verifica se a senha foi fornecida, e faz hash da   *
    // * senha antes de salvar.                                                                    *
    // *                                                                                           *
    // * Caso isOAuth seja true, a senha não é obrigatória (para OAuth).                          *
    // *********************************************************************************************
    async createUser(dto: CreateUserDto): Promise<User> {
        if (!dto.isOAuth && !dto.password) {
            throw new BadRequestException('Password is required for normal users');
        }

        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 10);
        }

        dto.isOAuth = false;
        dto.role = 'user'
        dto.status = true

        const user = this.usersRepository.create(dto);
        return this.usersRepository.save(user);
    }


    // *********************************************************************************************
    // * validateUser: Valida credenciais do usuário                                              *
    // *                                                                                           *
    // * Recebe email e senha, busca usuário pelo email, e compara senha com hash armazenado.     *
    // * Caso válido, atualiza último login e retorna usuário sem a senha.                        *
    // *********************************************************************************************
    async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.usersService.findByEmail(email);

        if (user?.password && (await bcrypt.compare(pass, user.password))) {
            await this.usersService.updateLastLogin(user.id, new Date());

            const { password, ...rest } = user;
            return rest;
        }

        return null;
    }

    // *********************************************************************************************
    // * login: Gera o token JWT para o usuário autenticado                                       *
    // *                                                                                           *
    // * Recebe o objeto user (com id, email e role) e retorna um JWT com payload contendo esses  *
    // * dados, com expiração de 1 hora.                                                          *
    // *********************************************************************************************
    async login(
        p0: string,
        p1: string,
        user: Pick<User, 'id' | 'email' | 'role' | 'name' | 'status'>
    ): Promise<{
        access_token: string,
        name: string,
        role: string,
        status: boolean,
        email: string,
        userId: number
    }> {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const access_token = await this.jwtService.signAsync(payload, { expiresIn: '1h' });
        console.log(user.name, user.role, user.status, user.email, access_token)
        return {
            access_token,
            name: user.name,
            role: user.role,
            status: user.status,
            email: user.email,
            userId: user.id,
        };
    }
}
