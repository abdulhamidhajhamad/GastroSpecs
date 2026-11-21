import { ConflictException, Injectable } from "@nestjs/common";
import { orNotFound } from "@/shared/http/or-not-found";
import { normalizeSupplierName } from "../domain/normalize-supplier-name";
import { SourcingRepository } from "../domain/sourcing.repository";
import type { CreateContactDto, CreateSupplierDto, UpdateContactDto, UpdateSupplierDto } from "./dto/sourcing.dto";

/**
 * Suppliers and their contacts. Most of this is passing data through; the rule that matters is that the
 * same company is never stored twice, whatever way its name is written.
 */
@Injectable()
export class SupplierUseCases {
  constructor(private readonly sourcing: SourcingRepository) {}

  list(search?: string) {
    return this.sourcing.listSuppliers(search);
  }

  async get(id: string) {
    return orNotFound(await this.sourcing.findSupplier(id), "Supplier");
  }

  /** 409 with the existing supplier's id when the company is already there, so a caller can use it instead. */
  async create(input: CreateSupplierDto) {
    const key = normalizeSupplierName(input.name);
    try {
      return await this.sourcing.createSupplier(input, key);
    } catch (error) {
      if (!(error instanceof ConflictException)) throw error;
      const supplierId = await this.sourcing.findSupplierIdByKey(key);
      throw new ConflictException({ message: "This supplier already exists", supplierId });
    }
  }

  update(id: string, input: UpdateSupplierDto) {
    const key = input.name === undefined ? undefined : normalizeSupplierName(input.name);
    return this.sourcing.updateSupplier(id, input, key);
  }

  delete(id: string) {
    return this.sourcing.deleteSupplier(id);
  }

  addContact(supplierId: string, input: CreateContactDto) {
    return this.sourcing.addContact(supplierId, input);
  }

  updateContact(id: string, input: UpdateContactDto) {
    return this.sourcing.updateContact(id, input);
  }

  deleteContact(id: string) {
    return this.sourcing.deleteContact(id);
  }
}
