import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/modules/auth/presentation/jwt-auth.guard";
import {
  CreateContactDto,
  CreateOfferDto,
  CreateSupplierDto,
  SearchQueryDto,
  UpdateContactDto,
  UpdateOfferDto,
  UpdateSupplierDto,
} from "../application/dto/sourcing.dto";
import { OfferUseCases } from "../application/offer.use-cases";
import { SupplierUseCases } from "../application/supplier.use-cases";

const Id = () => Param("id", ParseUUIDPipe);

/** Dashboard API for suppliers, their contacts and what they make. Every route requires a signed-in admin. */
@Controller("admin/sourcing")
@UseGuards(JwtAuthGuard)
export class SourcingController {
  constructor(
    private readonly suppliers: SupplierUseCases,
    private readonly offers: OfferUseCases,
  ) {}

  // --- Suppliers -------------------------------------------------------------------------------------

  @Get("suppliers")
  listSuppliers(@Query() { q }: SearchQueryDto) {
    return this.suppliers.list(q);
  }

  @Get("suppliers/:id")
  getSupplier(@Id() id: string) {
    return this.suppliers.get(id);
  }

  @Post("suppliers")
  createSupplier(@Body() body: CreateSupplierDto) {
    return this.suppliers.create(body);
  }

  @Patch("suppliers/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateSupplier(@Id() id: string, @Body() body: UpdateSupplierDto) {
    return this.suppliers.update(id, body);
  }

  @Delete("suppliers/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSupplier(@Id() id: string) {
    return this.suppliers.delete(id);
  }

  // --- Contacts --------------------------------------------------------------------------------------

  @Post("suppliers/:id/contacts")
  addContact(@Id() supplierId: string, @Body() body: CreateContactDto) {
    return this.suppliers.addContact(supplierId, body);
  }

  @Patch("contacts/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateContact(@Id() id: string, @Body() body: UpdateContactDto) {
    return this.suppliers.updateContact(id, body);
  }

  @Delete("contacts/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteContact(@Id() id: string) {
    return this.suppliers.deleteContact(id);
  }

  // --- Offers ----------------------------------------------------------------------------------------

  /** `?q=GS-FRY-0001` (or a name, or a supplier's model) → matching products with all their suppliers. */
  @Get("products")
  searchProducts(@Query() { q }: SearchQueryDto) {
    return this.offers.search(q);
  }

  @Get("products/:id/offers")
  productOffers(@Id() productId: string) {
    return this.offers.listForProduct(productId);
  }

  @Post("offers")
  addOffer(@Body() body: CreateOfferDto) {
    return this.offers.add(body);
  }

  @Patch("offers/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateOffer(@Id() id: string, @Body() body: UpdateOfferDto) {
    return this.offers.update(id, body);
  }

  @Delete("offers/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteOffer(@Id() id: string) {
    return this.offers.delete(id);
  }
}
