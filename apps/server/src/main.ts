import "dotenv/config";

import { NestFactory } from "@nestjs/core";
import { AppModule } from "@/app/app.module";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.enableShutdownHooks();
  app.setGlobalPrefix("api");

  await app.listen(process.env.PORT ?? 8080);

  const url = await app.getUrl();

  Logger.log(`Server started on ${url}`, "Bootstrap");
}

bootstrap().then(console.log).catch(console.error);
