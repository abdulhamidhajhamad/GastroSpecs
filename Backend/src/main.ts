import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

/**
 * Bootstraps the HTTP server.
 * - Global prefix: every route is served under /api (e.g. POST /api/auth/sign-in).
 * - Cookies are parsed so the auth guard can read the admin session cookie.
 * - ValidationPipe: enforces DTOs from class-validator; strips unknown fields.
 * - CORS: only origins in CORS_ORIGINS, with credentials so the session cookie is sent.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["error", "warn", "log"] });

  app.setGlobalPrefix("api");
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Credentialed CORS must name its origins: with an empty list, no other site may call the API with cookies.
  const corsOrigins = (process.env.CORS_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  app.enableCors({ origin: corsOrigins, credentials: true });

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  Logger.log(`API listening on http://localhost:${port}/api`, "Bootstrap");
}

bootstrap();
