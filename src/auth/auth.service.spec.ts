/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable prettier/prettier */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

// *********************************************************************************************
// * Testes unitários para o serviço de autenticação (AuthService)                            *
// *                                                                                           *
// * Mockamos os repositórios e serviços para isolar o comportamento do AuthService.          *
// * Validamos criação de usuários, validação, login e geração de token JWT.                    *
// *********************************************************************************************
describe('AuthService', () => {
    let authService: AuthService;

    // Mock do repositório de usuário com os métodos usados
    const mockUserRepository = {
        create: jest.fn(),
        save: jest.fn(),
    };

    // Mock do UsersService com métodos chamados pelo AuthService
    const mockUsersService = {
        findByEmail: jest.fn(),
        updateLastLogin: jest.fn(),
        update: jest.fn(),
    };

    // Mock do JwtService para simular geração de token JWT
    const mockJwtService = {
        signAsync: jest.fn(),
    };

    // Antes de cada teste, configura o módulo e limpa mocks
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);

        // Limpa todos os mocks para evitar contaminação entre testes
        jest.clearAllMocks();
    });

    // Verifica se o serviço foi definido corretamente
    it('should be defined', () => {
        expect(authService).toBeDefined();
    });

    // Testa criação de usuário: deve criar, salvar e hashear a senha
    it('should hash password and save user on createUser', async () => {
        const dto: CreateUserDto = {
            email: 'test@example.com',
            password: '123456',
            isOAuth: false,
            role: 'user' as 'user' | 'admin', // tipagem literal para evitar erro
            name: 'Test User',
        };

        mockUserRepository.create.mockReturnValue(dto);
        mockUserRepository.save.mockResolvedValue({ ...dto, id: 1, password: 'hashedPassword' });

        const result = await authService.createUser(dto);

        expect(mockUserRepository.create).toHaveBeenCalledWith(dto);
        expect(mockUserRepository.save).toHaveBeenCalled();
        expect(result).toHaveProperty('id');
        expect(result.password).toBe('hashedPassword'); // validando valor mockado
    });

    // Testa validação de usuário inválido - deve retornar null
    it('should return null if user validation fails', async () => {
        mockUsersService.findByEmail.mockResolvedValue(null);

        const result = await authService.validateUser('invalid@example.com', 'wrongpass');

        expect(result).toBeNull();
    });

    // Testa validação de usuário válido - retorna dados sem a senha
    it('should return user data without password if validation succeeds', async () => {
        const user = {
            id: 1,
            email: 'valid@example.com',
            password: 'hashedPassword',
            role: 'user',
            name: 'Valid User',
        };

        mockUsersService.findByEmail.mockResolvedValue(user);
        mockUsersService.updateLastLogin.mockResolvedValue(undefined);

        // Mock bcrypt.compare para simular sucesso na comparação da senha
        jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

        const result = await authService.validateUser(user.email, 'correctPassword');

        expect(result).toEqual({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });

        expect(mockUsersService.updateLastLogin).toHaveBeenCalledWith(user.id, expect.any(Date));
    });

    // Testa geração do token JWT no login
    it('should generate JWT token on login', async () => {
        const user: Pick<User, 'id' | 'email' | 'role' | 'status' | 'name'> = {
            id: 1,
            email: 'user@example.com',
            status: true,
            role: 'user',
            name: 'John Doe',
        };

        mockJwtService.signAsync.mockResolvedValue('mocked_jwt_token');

        // chamada correta: só 3 args, o último é o user
        const result = await authService.login('email', 'password', user);

        expect(result).toEqual({
            access_token: 'mocked_jwt_token',
            name: user.name,
            role: user.role,
            status: user.status,
            email: user.email,
            userId: user.id,
        });

        expect(mockJwtService.signAsync).toHaveBeenCalledWith(
            { userId: user.id, email: user.email, role: user.role },
            { expiresIn: '1h' },
        );
    });

});
