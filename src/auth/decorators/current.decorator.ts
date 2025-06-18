/* eslint-disable prettier/prettier */

// *********************************************************************************************
// * Custom Decorator para extrair o usuário atual do request                                  *
// *                                                                                           *
// * Utiliza o ExecutionContext do NestJS para acessar a requisição HTTP atual e retornar      *
// * o payload do JWT, previamente anexado ao objeto request pelo guard de autenticação JWT.   *
// *                                                                                           *
// * Permite injetar diretamente os dados do usuário autenticado nos handlers dos controllers. *
// *********************************************************************************************

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): JwtPayloadDto => {
        // Pega o objeto request do contexto HTTP
        const req = ctx
            .switchToHttp()
            .getRequest<{ user: JwtPayloadDto }>();

        // Retorna o objeto user (payload JWT) anexado no request pelo guard
        return req.user;
    },
);
