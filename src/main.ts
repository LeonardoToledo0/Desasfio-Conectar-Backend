import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // ***********************************************************************************************
  // * Cria a aplicação NestJS usando o módulo raiz AppModule                                      *
  // ***********************************************************************************************
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.use(cookieParser());
  // ***********************************************************************************************
  // * Configura o Swagger para documentação da API                                               *
  // * Define título, descrição, versão e autenticação Bearer JWT                                 *
  // ***********************************************************************************************
  const config = new DocumentBuilder()
    .setTitle('API Conectar')
    .setDescription('API para gerenciamento de usuários')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // ***********************************************************************************************
  // * Cria o documento Swagger baseado na configuração e nos endpoints da aplicação              *
  // ***********************************************************************************************
  const document = SwaggerModule.createDocument(app, config);

  // ***********************************************************************************************
  // * Configura o Swagger UI no endpoint /api para facilitar testes e exploração da API          *
  // ***********************************************************************************************
  SwaggerModule.setup('api', app, document);

  // ***********************************************************************************************
  // * Inicia a aplicação escutando na porta 3000                                                 *
  // ***********************************************************************************************
  await app.listen(3000);
}
bootstrap();
