import { Controller, Get } from "@nestjs/common";

/**
 * Liveness check for the host and the keep-alive pinger. It must never touch the database:
 * a ping every few minutes would keep Neon awake around the clock and use up its free compute hours.
 */
@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { status: "ok" };
  }
}
