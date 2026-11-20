import { Global, Module } from "@nestjs/common";
import { ObjectStorage } from "./object-storage";
import { R2ObjectStorage } from "./r2-object-storage";

/** Global, like PrismaModule: any slice can inject ObjectStorage. Swap the adapter here to change provider. */
@Global()
@Module({
  providers: [{ provide: ObjectStorage, useClass: R2ObjectStorage }],
  exports: [ObjectStorage],
})
export class StorageModule {}
