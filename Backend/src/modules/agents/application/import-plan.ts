import { plainToInstance, Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
  validate,
  ValidateIf,
  ValidateNested,
  type ValidationError,
} from "class-validator";
import { CreateProductDto } from "@/modules/catalog/application/admin/dto/product.dto";
import { CreateContactDto, CreateSupplierDto } from "@/modules/sourcing/application/dto/sourcing.dto";
import { OptionalText, RequiredText } from "@/shared/http/text-fields";

/**
 * The plan ahmadprod proposes, and the checks it must pass. Supplier, contact and product fields are
 * checked with the very same DTOs as the dashboard's own forms, so an agent can't save anything an admin
 * couldn't. The plan is checked when the agent proposes it and again right before it is carried out.
 */

class PhotoBoxDto {
  @IsNumber() @Min(0) @Max(1) left!: number;
  @IsNumber() @Min(0) @Max(1) top!: number;
  @IsNumber() @Min(0) @Max(1) right!: number;
  @IsNumber() @Min(0) @Max(1) bottom!: number;
}

class PlanImageDto {
  @IsInt() @Min(1) page!: number;
  @ValidateNested() @Type(() => PhotoBoxDto) box!: PhotoBoxDto;
}

class PlanSupplierDto extends CreateSupplierDto {
  /** Set when search_suppliers found it: nothing about the supplier is changed then. */
  @IsOptional() @IsUUID() existingSupplierId?: string;
}

class PlanProductDto {
  @RequiredText(100) supplierModel!: string;
  @IsInt() @Min(1) catalogPage!: number;
  @IsIn(["create", "link"]) action!: "create" | "link";
  @ValidateIf((o: PlanProductDto) => o.action === "link") @IsUUID() existingProductId?: string;
  @ValidateIf((o: PlanProductDto) => o.action === "create") @RequiredText(100) categorySlug?: string;
  /** Checked separately against CreateProductDto, once the category slug is turned into an id. */
  @ValidateIf((o: PlanProductDto) => o.action === "create") @IsObject() product?: Record<string, unknown>;
  @IsOptional() @ValidateNested() @Type(() => PlanImageDto) image?: PlanImageDto;
  @IsOptional() @IsInt() @Min(0) priceAmount?: number;
  @IsOptional() @Matches(/^[A-Z]{3}$/) priceCurrency?: string;
  @OptionalText(1000) notes?: string;
}

export class ImportPlanDto {
  @ValidateNested() @Type(() => PlanSupplierDto) supplier!: PlanSupplierDto;
  @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => CreateContactDto) contacts!: CreateContactDto[];
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(400) @ValidateNested({ each: true }) @Type(() => PlanProductDto) products!: PlanProductDto[];
  @RequiredText(10_000) report!: string;
}

/** A plan item ready to carry out: for "create", the product is a validated CreateProductDto. */
export type CheckedItem = Omit<PlanProductDto, "product"> & { product?: CreateProductDto };
export type CheckedPlan = Omit<ImportPlanDto, "products"> & { products: CheckedItem[] };

/** Subcategories by slug (products only attach to subcategories). */
export type SubcategoryIds = Map<string, string>;

const OPTIONS = { whitelist: true, forbidNonWhitelisted: true } as const;

/** "products.3.product.widthMm: widthMm must not be less than 1", one line per failed rule. */
function messages(errors: ValidationError[], path = ""): string[] {
  return errors.flatMap((error) => {
    const at = path ? `${path}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((text) => `${at}: ${text}`);
    return [...own, ...messages(error.children ?? [], at)];
  });
}

/** Validates a proposed plan. Returns the checked plan, or every problem found so the agent can fix them all at once. */
export async function checkPlan(input: unknown, subcategories: SubcategoryIds): Promise<{ plan: CheckedPlan } | { errors: string[] }> {
  const plan = plainToInstance(ImportPlanDto, input ?? {});
  const errors = messages(await validate(plan, OPTIONS));
  if (errors.length) return { errors };

  const seen = new Set<string>();
  const items: CheckedItem[] = [];
  for (const [i, item] of plan.products.entries()) {
    const at = `products.${i}`;
    const model = item.supplierModel.toUpperCase();
    if (seen.has(model)) errors.push(`${at}.supplierModel: "${item.supplierModel}" appears twice in the plan`);
    seen.add(model);

    const box = item.image?.box;
    if (box && (box.right <= box.left || box.bottom <= box.top)) errors.push(`${at}.image.box: right must be > left and bottom > top`);

    if (item.action === "link") {
      items.push({ ...item, product: undefined });
      continue;
    }

    const categoryId = subcategories.get(item.categorySlug!);
    if (!categoryId) {
      errors.push(`${at}.categorySlug: "${item.categorySlug}" is not a subcategory; use one from list_categories`);
      continue;
    }
    // Drafts always: whatever the plan says, the admin publishes.
    const product = plainToInstance(CreateProductDto, { ...item.product, categoryId, published: false });
    const productErrors = messages(await validate(product, OPTIONS), `${at}.product`);
    errors.push(...productErrors);
    items.push({ ...item, product });
  }

  return errors.length ? { errors } : { plan: { ...plan, products: items } };
}
