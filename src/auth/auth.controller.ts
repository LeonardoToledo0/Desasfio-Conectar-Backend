/* eslint-disable prettier/prettier */
import { Controller, Post, Body, UnauthorizedException, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { LoginDto } from './dto/create-login-dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
// import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
// import * as jwt from 'jsonwebtoken';



// interface JwtPayload {
//     userId: string | number;
//     email: string;
//     name: string;
//     role: string;
//     picture?: string;
// }


@ApiTags('auth')
@Controller('auth')
export class AuthController {
    jwtService: any;
    constructor(private readonly authService: AuthService, private readonly configService: ConfigService,) { }

    // ***********************************************************************************************
    // * POST /auth/register                                                                         *
    // * Cria um novo usuário                                                                       *
    // * Endpoint público (sem autenticação)                                                       *
    // *                                                                                             *
    // * Recebe CreateUserDto no corpo da requisição                                               *
    // * Chama authService.createUser para criar o usuário                                         *
    // * Retorna o usuário criado com sucesso                                                     *
    // ***********************************************************************************************
    @Post('register')
    @ApiOperation({ summary: 'Cria um novo usuário' })
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.authService.createUser(createUserDto);
    }

    // ***********************************************************************************************
    // * POST /auth/login                                                                           *
    // * Realiza o login do usuário, validando as credenciais e retornando um token JWT            *
    // *                                                                                             *
    // * Recebe LoginDto com email e senha no corpo da requisição                                  *
    // * Chama authService.validateUser para validar credenciais                                  *
    // * Se inválido, lança UnauthorizedException (401)                                           *
    // * Se válido, chama authService.login para gerar o token JWT                                *
    // * Retorna o token JWT com status 201                                                        *
    // ***********************************************************************************************
    @Post('login')
    @ApiOperation({ summary: 'Realizar login e obter JWT' })
    @ApiResponse({ status: 201, description: 'Login realizado com sucesso' })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }


        return this.authService.login(loginDto.email, loginDto.password, user);
    }


    // ***********************************************************************************************
    // * GET /auth/google                                                                          *
    // * Redireciona para autenticação via Google OAuth2                                           *
    // *                                                                                             *
    // * Usa AuthGuard com estratégia 'google' do Passport                                         *
    // * Rota sem implementação: apenas para disparar o redirecionamento                           *
    // ***********************************************************************************************
    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Redireciona para login com Google' })
    @ApiExcludeEndpoint()
    async googleAuth() {

    }

}
