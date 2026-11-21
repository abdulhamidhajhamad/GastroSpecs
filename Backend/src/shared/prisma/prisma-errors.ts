import { ConflictException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

/**
 * Turns the database's own constraint errors into HTTP answers. Letting the constraint decide (instead of
 * checking first with an extra query) is one round trip and stays correct when two requests race.
 */
const isPrismaError = (error: unknown, code: string): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;

type Messages = {
  /** Unique constraint (P2002) → 409. */
  duplicate?: string;
  /** Foreign key points nowhere (P2003) → 404. */
  missingRelation?: string;
  /** Updated or deleted row does not exist (P2025) → 404. */
  missing?: string;
};

/** Runs a write and answers 409 / 404 for the errors given a message; anything else is rethrown. */
export async function mapPrismaErrors<T>(write: Promise<T>, messages: Messages): Promise<T> {
  try {
    return await write;
  } catch (error) {
    if (messages.duplicate && isPrismaError(error, "P2002")) throw new ConflictException(messages.duplicate);
    if (messages.missingRelation && isPrismaError(error, "P2003")) throw new NotFoundException(messages.missingRelation);
    if (messages.missing && isPrismaError(error, "P2025")) throw new NotFoundException(messages.missing);
    throw error;
  }
}
