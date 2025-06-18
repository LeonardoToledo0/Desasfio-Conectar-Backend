// *********************************************************************************************
// * Testes E2E (end-to-end) para a aplicação NestJS                                          *
// *                                                                                           *
// * Realiza testes integrados, verificando o fluxo completo da API: login e acesso ao perfil. *
// * Usa Supertest para fazer requisições HTTP e validar respostas reais da aplicação.         *
// *********************************************************************************************

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  // Configuração do app Nest antes de todos os testes
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule], // importa o módulo raiz da aplicação
    }).compile();

    app = moduleFixture.createNestApplication();

    // Habilita pipes globais de validação, com whitelist para remover propriedades não definidas no DTO
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
  });

  // Teste do endpoint POST /auth/login, deve retornar status 201 e um token de acesso válido
  it('/auth/login (POST) should return 201 and token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'jondoe@example.com', password: 'strongPassword123' });

    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
  });

  // Teste do endpoint GET /users/profile, que exige autenticação via token Bearer
  // Deve retornar status 200 e o perfil do usuário autenticado
  it('/users/profile (GET) should return 200 with own profile', async () => {
    // Primeiro, faz login para obter o token
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'jondoe@example.com', password: 'strongPassword123' });

    const token = login.body.access_token;

    // Depois, usa o token para acessar o perfil do usuário
    const res = await request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('jondoe@example.com');
  });

  // Fecha a aplicação Nest após todos os testes para liberar recursos
  afterAll(async () => {
    await app.close();
  });
});
