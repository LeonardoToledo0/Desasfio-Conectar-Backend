/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable prettier/prettier */

import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';

import { User } from './entities/user.entity'

// *********************************************************************************************
// * Testes unitários para o serviço de usuários (UsersService)                               *
// *                                                                                           *
// * Mockamos o repositório TypeORM para isolar o comportamento do UsersService.               *
// * Validamos busca por ID e atualização com hash da senha.                                  *
// *********************************************************************************************

const mockUser: Partial<User> = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  role: 'user',
  password: 'hashed_password',
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  // Antes de cada teste, configura o módulo e injeta mocks
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            // Mock dos métodos do repositório usados pelo serviço
            findOne: jest.fn().mockResolvedValue(mockUser),
            findOneBy: jest.fn().mockResolvedValue(mockUser),
            findBy: jest.fn(),
            update: jest.fn(),
            save: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  // Testa busca de usuário pelo ID - deve retornar o mock
  it('should find user by id', async () => {
    const result = await service.findById(1);
    expect(result).toEqual(mockUser);

    expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
  });

  // Testa que ao atualizar usuário com senha, a senha é hasheada antes de salvar
  it('should hash password on update', async () => {
    const saveSpy = jest.spyOn(repo, 'save');

    await service.updateUser(1, { password: '123456' }, { id: 1, role: 'user' });

    expect(saveSpy).toHaveBeenCalled();

    const savedUser = saveSpy.mock.calls[0][0] as User;
    expect(savedUser.password).not.toBe('123456');
  });
});
