import { IsEmail, IsInt, IsOptional, IsUUID, Matches, Max, Min } from "class-validator";
import { OptionalText, RequiredText, UpdatableText } from "@/shared/http/text-fields";

/**
 * Request bodies of the sourcing API. Optional fields accept `null` (or "") to clear them.
 * Each "…Fields" base holds the optional fields once; create / update add the required ones.
 */

const LONG_TEXT = 5000;

class SupplierFieldsDto {
  @OptionalText(200) nameLocal?: string | null;
  @OptionalText(100) country?: string | null;
  @OptionalText(100) city?: string | null;
  @OptionalText() address?: string | null;
  @OptionalText(300) website?: string | null;
  @OptionalText(200) @IsEmail() email?: string | null;
  @OptionalText(50) phone?: string | null;
  @OptionalText(LONG_TEXT) notes?: string | null;
}

export class CreateSupplierDto extends SupplierFieldsDto {
  @RequiredText() name!: string;
}

export class UpdateSupplierDto extends SupplierFieldsDto {
  @UpdatableText() name?: string;
}

class ContactFieldsDto {
  @OptionalText(100) role?: string | null;
  @OptionalText(200) @IsEmail() email?: string | null;
  @OptionalText(50) phone?: string | null;
  @OptionalText(50) whatsapp?: string | null;
  @OptionalText(100) wechat?: string | null;
  @OptionalText(LONG_TEXT) notes?: string | null;
}

export class CreateContactDto extends ContactFieldsDto {
  @RequiredText() name!: string;
}

export class UpdateContactDto extends ContactFieldsDto {
  @UpdatableText() name?: string;
}

/** Price is sent as two fields; both or neither (checked by the use case). */
class OfferFieldsDto {
  /** Smallest currency unit (cents). */
  @IsOptional() @IsInt() @Min(0) @Max(2_000_000_000) priceAmount?: number | null;
  /** ISO 4217, e.g. "USD". */
  @IsOptional() @Matches(/^[A-Z]{3}$/) priceCurrency?: string | null;
  @IsOptional() @IsInt() @Min(1) @Max(10_000) catalogPage?: number | null;
}

export class CreateOfferDto extends OfferFieldsDto {
  @IsUUID() supplierId!: string;
  @IsUUID() productId!: string;
  @RequiredText(100) supplierModel!: string;
}

export class UpdateOfferDto extends OfferFieldsDto {
  @UpdatableText(100) supplierModel?: string;
}

export class SearchQueryDto {
  @OptionalText(100) q?: string;
}
