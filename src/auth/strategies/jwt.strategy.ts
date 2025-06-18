/* eslint-disable prettier/prettier */

// *********************************************************************************************
// * JwtStrategy: Estratégia para validação de JWT no NestJS com Passport                      *
// *                                                                                           *
// * Extende PassportStrategy utilizando passport-jwt                                          *
// *                                                                                           *
// * Configura extração do token JWT do header Authorization Bearer                           *
// *                                                                                           *
// * Usa a chave secreta JWT_SECRET definida nas variáveis de ambiente                         *
// *                                                                                           *
// * Ignora tokens expirados é false (não permite token expirado)                             *
// *                                                                                           *
// * Método validate: recebe o payload decodificado do JWT                                     *
// * - Verifica se o userId está presente no payload                                           *
// * - Lança UnauthorizedException se inválido                                                *
// * - Retorna um objeto JwtPayloadDto com userId, email e role                               *
// *********************************************************************************************

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET não definido nas variáveis de ambiente');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
            ignoreExpiration: false,
        });
    }

    validate(payload: JwtPayloadDto): JwtPayloadDto {
        if (!payload.userId) {
            throw new UnauthorizedException('Token inválido - userId não encontrado');
        }
        return {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        };
    }
}
