import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('AITA')
    .setDescription('AITA API doc')
    .setVersion('0.1')
    .addTag('aitagame')
    .addTag('users')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'Authorization' }, 'Authorization')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  if (!process.env['JWT_SECRET'] || !process.env['PASSWORD_HASH_SALT'])
    throw new Error('Shit happened, cannot find jwt secret or salt in environment');

  await app.listen(process.env['AITA_API_PORT'], 'localhost');
}
bootstrap();
