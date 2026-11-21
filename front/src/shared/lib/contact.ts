import { siteConfig } from "@/shared/config/site";

export function emailHref(): string | null {
  const email = siteConfig.contact.email;
  return email ? `mailto:${email}` : null;
}
