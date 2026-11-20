import { NotFoundException } from "@nestjs/common";

/** Returns the value, or answers 404 when a lookup by slug found nothing. */
export function orNotFound<T>(value: T | null, what: string): T {
  if (value === null) throw new NotFoundException(`${what} not found`);
  return value;
}
