/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule,
        UsersModule,
        ConfigModule.forRoot(),

        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' }
        }),
    ],
    providers: [

        JwtStrategy,
        AuthService,
        JwtAuthGuard,

    ],
    exports: [
        PassportModule,
        JwtStrategy,
        AuthService,
        JwtAuthGuard,
    ],
    controllers: [AuthController],
})
export class AuthModule { }
