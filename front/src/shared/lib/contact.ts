import { siteConfig } from "@/shared/config/site";

/** WhatsApp deep link with a pre-filled message, or null while no number is configured. */
export function whatsappHref(message: string): string | null {
  const number = siteConfig.contact.whatsapp;
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function emailHref(): string | null {
  const email = siteConfig.contact.email;
  return email ? `mailto:${email}` : null;
}
