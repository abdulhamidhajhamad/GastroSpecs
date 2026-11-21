import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { OptionalText, RequiredText, UpdatableText } from "@/shared/http/text-fields";
import { ENERGY_TYPES, GAS_TYPES, type EnergyType, type GasType } from "../../../domain/product-specs";

class SpecRowDto {
  @RequiredText(100) labelEn!: string;
  @RequiredText(100) labelAr!: string;
  @RequiredText(200) value!: string;
}

/** "ce, CE , iso" → ["CE", "ISO"]. */
const Certifications = () =>
  Transform(({ value }) =>
    Array.isArray(value) ? [...new Set(value.filter((v) => typeof v === "string" && v.trim()).map((v: string) => v.trim().toUpperCase()))] : value,
  );

/**
 * Fields shared by create and update, all optional. `null` clears a value.
 * Units are fixed so numbers stay comparable: millimetres, kilograms, kilowatts, volts, hertz, amps.
 */
class ProductFieldsDto {
  @OptionalText(1000) summaryEn?: string | null;
  @OptionalText(1000) summaryAr?: string | null;

  @IsOptional() @IsInt() @Min(1) @Max(100_000) widthMm?: number | null;
  @IsOptional() @IsInt() @Min(1) @Max(100_000) depthMm?: number | null;
  @IsOptional() @IsInt() @Min(1) @Max(100_000) heightMm?: number | null;
  @IsOptional() @IsNumber() @Min(0) @Max(100_000) weightKg?: number | null;

  @IsOptional() @IsIn(ENERGY_TYPES) energyType?: EnergyType | null;
  @IsOptional() @IsArray() @IsIn(GAS_TYPES, { each: true }) gasTypes?: GasType[];
  @IsOptional() @IsNumber() @Min(0) @Max(10_000) powerKw?: number | null;
  @IsOptional() @IsInt() @Min(12) @Max(1000) voltage?: number | null;
  @IsOptional() @IsIn([1, 3]) phases?: number | null;
  @IsOptional() @IsIn([50, 60]) frequencyHz?: number | null;
  /** Leave empty to have it calculated from power, voltage and phases. */
  @IsOptional() @IsNumber() @Min(0) @Max(10_000) currentAmps?: number | null;

  @IsOptional() @Certifications() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) @MaxLength(20, { each: true }) certifications?: string[];

  @IsOptional() @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => SpecRowDto) specs?: SpecRowDto[];

  @IsOptional() @IsBoolean() published?: boolean;
}

export class CreateProductDto extends ProductFieldsDto {
  @RequiredText() nameEn!: string;
  @RequiredText() nameAr!: string;
  /** A subcategory: products never attach to a main category. */
  @IsUUID() categoryId!: string;
}

export class UpdateProductDto extends ProductFieldsDto {
  @UpdatableText() nameEn?: string;
  @UpdatableText() nameAr?: string;
  @ValidateIf((_, v) => v !== undefined) @IsUUID() categoryId?: string;
}
