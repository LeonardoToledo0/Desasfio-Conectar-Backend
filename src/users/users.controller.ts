/* eslint-disable prettier/prettier */
import {
  Controller, Get, Body, Patch, Param, Delete,
  UseGuards, Request, Query, BadRequestException,
  ForbiddenException,


} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery
} from '@nestjs/swagger';
import { UsersService } from './users.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { CurrentUser } from 'src/auth/decorators/current.decorator';


@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // ***********************************************************************************************
  // * GET /users                                                                                  *
  // * Lista todos os usuários, acesso restrito a admin                                            *
  // * Requer token JWT com role 'admin'                                                          *
  // ***********************************************************************************************
  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários (somente admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada.' })
  async findAll(@Request() req) {
    return this.usersService.findAll(req.user);
  }
  // ***********************************************************************************************
  // * GET /users/profile                                                                         *
  // * Retorna os dados do usuário logado                                                        *
  // * Requer token JWT                                                                          *
  // ***********************************************************************************************
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Obtém o usuário conectado' })
  async getProfile(@Request() req) {
    const id = Number(req.user.userId);
    return this.usersService.findById(id);
  }

  // ***********************************************************************************************
  // * GET /users/inactive                                                                        *
  // * Lista usuários inativos baseado no parâmetro opcional ?days (padrão 30 dias)              *
  // * Somente admins podem acessar                                                              *
  // ***********************************************************************************************
  @Get('inactive')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lista usuários inativos (somente admin)' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  @ApiResponse({ status: 200, description: 'Lista de usuários inativos retornada.' })
  async findInactive(
    @CurrentUser() user: JwtPayloadDto,
    @Query('days') days?: string,
  ) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Apenas administradores podem acessar esta rota.');
    }

    const daysNumber = days ? parseInt(days, 10) : 30;
    if (isNaN(daysNumber) || daysNumber < 0) {
      throw new BadRequestException('O parâmetro "days" deve ser um número válido e positivo.');
    }

    const requester = {
      userId: user.userId,
      role: user.role,
      email: user.email,
    };

    return this.usersService.findInactiveUsers({
      days: daysNumber,
      requester,
    });
  }
  // ***********************************************************************************************
  // * GET /users/:id                                                                            *
  // * Retorna um usuário pelo ID fornecido                                                      *
  // * Permitido para admin ou para o próprio usuário                                           *
  // * Valida se o ID é numérico e maior que zero                                              *
  // ***********************************************************************************************
  @Get(':id')
  @ApiOperation({ summary: 'Retorna um usuário pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiResponse({ status: 400, description: 'ID inválido.' })
  async findOne(@Param('id') idParam: string) {
    const id = Number(idParam);
    if (isNaN(id) || id <= 0) {
      throw new BadRequestException('ID inválido.');
    }

    const user = await this.usersService.findById(id);
    return user;
  }





  // ***********************************************************************************************
  // * GET /users/filter                                                                          *
  // * Lista usuários com filtros de role, ordenação e direção definidos via query params          *
  // * Apenas admin                                                                              *
  // ***********************************************************************************************
  @Get('filter')
  @ApiOperation({ summary: 'Listar usuários com filtro (apenas admin)' })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'user'] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'createdAt'] })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  async findFilteredUsers(
    @Query() query: ListUsersQueryDto,
    @Request() req,
  ) {
    return this.usersService.findAllFiltered(query, {
      id: req.user.userId,
      role: req.user.role,
    });
  }


  // ***********************************************************************************************
  // * PATCH /users/:id                                                                         *
  // * Atualiza dados de um usuário pelo ID                                                    *
  // * Permitido para admin ou para o próprio usuário                                         *
  // ***********************************************************************************************
  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um usuário pelo ID' })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const userIdParam = Number(id);

    return this.usersService.updateUser(userIdParam, updateUserDto, {
      id: req.user.userId,
      role: req.user.role,
    });
  }
  // ***********************************************************************************************
  // * DELETE /users/:id                                                                        *
  // * Remove um usuário pelo ID                                                               *
  // * Acesso restrito a administradores                                                       *
  // ***********************************************************************************************
  @Delete(':id')
  @ApiOperation({ summary: 'Remove um usuário pelo ID (somente admin)' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string, @Request() req) {
    return this.usersService.remove(+id, req.user);
  }
}
