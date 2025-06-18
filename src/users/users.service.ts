/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository, LessThan, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  // *********************************************************************************************
  // * Função para listar todos os usuários.                                                    *
  // * Apenas administradores podem acessar essa função.                                        *
  // *********************************************************************************************
  async findAll(requestingUser: { id: number; role: string }) {
    if (requestingUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can list all users');
    }
    return this.usersRepository.find();
  }

  // *********************************************************************************************
  // * Função para atualizar a data/hora do último login do usuário.                            *
  // *********************************************************************************************
  async updateLastLogin(userId: number, date: Date): Promise<void> {
    await this.usersRepository.update(userId, { lastLoginAt: date });
  }

  // *********************************************************************************************
  // * Função para buscar um usuário pelo email.                                               *
  // *********************************************************************************************
  async findByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  // *********************************************************************************************
  // * Função para buscar um usuário pelo ID.                                                  *
  // * Apenas admin ou o próprio usuário podem acessar.                                        *
  // *********************************************************************************************
  async findOne(id: number, requestingUser: { id: number, role: string }) {
    if (requestingUser.id !== id) {
      throw new ForbiddenException('You can only view your own data');
    }
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }



  // *********************************************************************************************
  // * Função para buscar usuário pelo ID (lança erro se não encontrado).                      *
  // *********************************************************************************************
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    delete (user as any).password;
    return user;
  }


  // *********************************************************************************************
  // * Função para remover um usuário (somente admins).                                        *
  // *********************************************************************************************
  async remove(id: number, requestingUser: { id: number; role: string }) {
    if (requestingUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete users');
    }

    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.remove(user);
    return { message: 'User removed successfully' };
  }

  // *********************************************************************************************
  // * Função para filtrar usuários por critérios (role, ordenação).                          *
  // * Apenas administradores podem acessar essa função.                                       *
  // *********************************************************************************************
  async findAllFiltered(
    query: ListUsersQueryDto,
    requestingUser: { id: number; role: string },
  ): Promise<User[]> {
    if (requestingUser.role !== 'admin') {
      throw new ForbiddenException('Apenas administradores podem acessar esta informação');
    }

    const { role, sortBy = 'createdAt', order = 'asc' } = query;

    const where: any = {};
    if (role) where.role = role;

    const sortColumn = ['name', 'createdAt'].includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const options: FindManyOptions<User> = {
      where,
      order: {
        [sortColumn]: sortOrder,
      },
    };

    return this.usersRepository.find(options);
  }
  // *********************************************************************************************
  // * Função para atualizar usuario                                                         *
  // * Bloqueia alteração de senha por terceiros                                      *
  // *********************************************************************************************

  async updateUser(
    userId: number,
    dto: UpdateUserDto,
    requester: { id: number; role: 'admin' | 'user' },
  ) {

    if (dto.password && requester.id !== userId) {
      throw new ForbiddenException('Você não pode alterar a senha de outro usuário.');
    }


    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }


    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = Object.assign(user, dto);
    return await this.usersRepository.save(updatedUser);
  }
  // *********************************************************************************************
  // * Função para listar usuários que não fizeram login há X dias (padrão 30).                *
  // * Apenas administradores podem acessar essa função.                                       *
  // *********************************************************************************************
  async findInactiveUsers(params: {
    days: number;
    requester: {
      userId: number;
      role: string;
      email?: string;
    };
  }): Promise<User[]> {

    if (params.requester.role !== 'admin') {
      throw new ForbiddenException('Apenas administradores podem acessar esta informação');
    }

    const limitDate = new Date(Date.now() - params.days * 24 * 60 * 60 * 1000);
    return this.usersRepository.find({
      where: [
        { lastLoginAt: IsNull() },
        { lastLoginAt: LessThan(limitDate) },
      ],
      order: { lastLoginAt: 'ASC' },
      select: ['id', 'email', 'name', 'lastLoginAt', 'createdAt'],
    });
  }
}
