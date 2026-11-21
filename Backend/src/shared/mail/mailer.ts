export type Email = {
  to: string;
  /** Where "Reply" goes, e.g. the customer who filled the form. */
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
};

/** Port: sends email. The abstract class doubles as the DI token. */
export abstract class Mailer {
  /** Resolves false when sending is not set up (no key); throws when the provider refuses the email. */
  abstract send(email: Email): Promise<boolean>;
}
