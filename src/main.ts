import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 전역 설정
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(configService.get('API_PREFIX'));

  // 보안 설정
  app.use(helmet());
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  });

  // 환경별 설정
  if (process.env.NODE_ENV !== 'production') {
    app.enableShutdownHooks();
  }

  const port = configService.get('API_PORT');
  await app.listen(port);
  console.log(
    `Application is running on: http://localhost:${port}/${configService.get('API_PREFIX')}`,
  );
}
bootstrap();
