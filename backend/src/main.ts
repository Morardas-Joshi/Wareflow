import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security
  app.use(helmet());
  app.enableCors({
    origin: '*', // For development, allow all. Restrict in production.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('FlowCore ERP API')
    .setDescription('The enterprise backend API for FlowCore ERP')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 FlowCore ERP Backend is running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
