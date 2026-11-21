import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type Email, Mailer } from "./mailer";

const RESEND_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "GastroSpecs Website <website@gastrospecs.com>";

/**
 * Sends through Resend's HTTP API (free up to 3,000 emails a month). The sender address must be on a
 * domain verified in Resend. Without RESEND_API_KEY nothing is sent and a warning is logged.
 */
@Injectable()
export class ResendMailer implements Mailer {
  private readonly logger = new Logger(ResendMailer.name);

  constructor(private readonly config: ConfigService) {}

  async send(email: Email): Promise<boolean> {
    const key = this.config.get<string>("RESEND_API_KEY");
    if (!key) {
      this.logger.warn(`Email not sent (RESEND_API_KEY is not set): "${email.subject}"`);
      return false;
    }
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: this.config.get<string>("MAIL_FROM") || DEFAULT_FROM,
        to: [email.to],
        reply_to: email.replyTo,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Resend refused the email (${res.status}): ${(await res.text()).slice(0, 300)}`);
    return true;
  }
}
