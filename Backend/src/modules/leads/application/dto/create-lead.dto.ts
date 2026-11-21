import { Transform } from "class-transformer";
import { IsEmail, IsIn, IsOptional, Matches, MaxLength } from "class-validator";
import { OptionalText } from "@/shared/http/text-fields";
import { LEAD_SOURCES, type LeadSource, PROJECT_TYPES, type ProjectType } from "../../domain/lead";

/** "+966 50-123 4567" → "+966501234567": people type numbers with spaces, dashes and brackets. */
const PhoneDigits = () => Transform(({ value }) => (typeof value === "string" ? value.replace(/[\s\-().]/g, "") || undefined : value));

export class CreateLeadDto {
  @IsIn(LEAD_SOURCES)
  source!: LeadSource;

  @IsOptional() @IsEmail() @MaxLength(200)
  email?: string;

  /** International format, digits with an optional leading "+". */
  @IsOptional() @PhoneDigits() @Matches(/^\+?[0-9]{7,15}$/, { message: "phone must be a valid phone number" })
  phone?: string;

  @OptionalText(100) name?: string;
  /** Quote requests: the business name. */
  @OptionalText(200) company?: string;
  @IsOptional() @IsIn(PROJECT_TYPES) projectType?: ProjectType;
  @OptionalText(3000) message?: string;
  @OptionalText(100) businessTypeSlug?: string;

  /** The page the form was sent from and its language: only for the email, not stored. */
  @OptionalText(300) page?: string;
  @IsOptional() @IsIn(["en", "ar"]) locale?: "en" | "ar";

  /** Honeypot: hidden from people, filled by bots. Anything here means spam. */
  @OptionalText(200) website?: string;
}
