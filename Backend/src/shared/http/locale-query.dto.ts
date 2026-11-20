import { IsIn, IsOptional } from "class-validator";
import { LOCALES, type Locale } from "../i18n/localized";

/** `?locale=en|ar` on public read endpoints. Defaults to English. */
export class LocaleQueryDto {
  @IsOptional()
  @IsIn(LOCALES)
  locale: Locale = "en";
}
