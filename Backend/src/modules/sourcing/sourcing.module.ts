import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OfferUseCases } from "./application/offer.use-cases";
import { SupplierUseCases } from "./application/supplier.use-cases";
import { SourcingRepository } from "./domain/sourcing.repository";
import { PrismaSourcingRepository } from "./infrastructure/prisma-sourcing.repository";
import { SourcingController } from "./presentation/sourcing.controller";

/** Suppliers, contacts and supplier ↔ product offers. Admin-only. */
@Module({
  imports: [AuthModule],
  controllers: [SourcingController],
  providers: [SupplierUseCases, OfferUseCases, { provide: SourcingRepository, useClass: PrismaSourcingRepository }],
  // For the agents slice, which works through these use cases like an admin does.
  exports: [SupplierUseCases, OfferUseCases],
})
export class SourcingModule {}
