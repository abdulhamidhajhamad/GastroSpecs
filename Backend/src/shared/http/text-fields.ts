import { applyDecorators } from "@nestjs/common";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";

/** Trims text; an empty string becomes null, so clearing a form field clears the column. */
const TrimToNull = () => Transform(({ value }) => (typeof value === "string" ? value.trim() || null : value));

/** Optional text. `null` (or "") clears it. */
export const OptionalText = (max = 500) => applyDecorators(TrimToNull(), IsOptional(), IsString(), MaxLength(max));

/** Text that must be present. */
export const RequiredText = (max = 200) => applyDecorators(TrimToNull(), IsString(), IsNotEmpty(), MaxLength(max));

/** In an update: may be left out, but never cleared (the column is required). */
export const UpdatableText = (max = 200) =>
  applyDecorators(TrimToNull(), ValidateIf((_, value) => value !== undefined), IsString(), IsNotEmpty(), MaxLength(max));
