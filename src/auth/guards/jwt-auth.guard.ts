/* eslint-disable prettier/prettier */

// *********************************************************************************************
// * JwtAuthGuard: guarda de autenticação JWT para proteger rotas                              *
// *                                                                                           *
// * Extende o AuthGuard do Passport para usar a estratégia 'jwt'                             *
// *                                                                                           *
// * Método canActivate: delega a validação para o método da superclasse                      *
// *                                                                                           *
// * Método handleRequest:                                                                    *
// * - lança UnauthorizedException se houver erro ou usuário não autenticado                  *
// * - injeta o payload JWT no request para uso nos handlers abaixo                            *
// *                                                                                           *
// * Esse guard deve ser usado em rotas protegidas para garantir que só usuários autenticados *
// * com token JWT válido tenham acesso.                                                      *
// *********************************************************************************************

import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest(
        err: Error | null,
        user: any,
        _info: unknown,
        context: ExecutionContext,
    ): any {
        if (err || !user) {
            throw new UnauthorizedException('Não autorizado');
        }

        const req = context.switchToHttp().getRequest<{ user: JwtPayloadDto }>();
        req.user = user as JwtPayloadDto;
        return req.user;
    }
}
