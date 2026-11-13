import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  bodyParser: false,
});

  app.useBodyParser("json", {
    limit: "4mb",
  });

  app.enableCors({
    origin: [
      "http://localhost:5173",
      "http://172.16.78.105:5173",
      "https://event-pulse-lovat.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;

  await app.listen(port, "0.0.0.0");

  console.log(`EventPulse backend running on port ${port}`);
}

bootstrap();
