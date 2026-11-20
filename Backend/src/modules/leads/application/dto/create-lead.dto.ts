import { IsEmail, IsIn, IsOptional, IsString, Matches } from "class-validator";
import { LEAD_SOURCES, type LeadSource } from "../../domain/lead";

export class CreateLeadDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  /** International format, digits with an optional leading "+", e.g. +9665XXXXXXXX. */
  @IsOptional()
  @Matches(/^\+?[0-9]{7,15}$/)
  phone?: string;

  @IsIn(LEAD_SOURCES)
  source!: LeadSource;

  @IsOptional()
  @IsString()
  businessTypeSlug?: string;
}
