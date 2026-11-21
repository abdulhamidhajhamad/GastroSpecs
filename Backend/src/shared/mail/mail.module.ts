import { Global, Module } from "@nestjs/common";
import { Mailer } from "./mailer";
import { ResendMailer } from "./resend-mailer";

/** Global, like StorageModule: any slice can inject Mailer. Swap the adapter here to change provider. */
@Global()
@Module({
  providers: [{ provide: Mailer, useClass: ResendMailer }],
  exports: [Mailer],
})
export class MailModule {}
