import NextLink from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { siteConfig } from "@/shared/config/site";
import { Wordmark } from "@/shared/brand/Logo";
import { emailHref, whatsappHref } from "@/shared/lib/contact";
import { Container } from "@/shared/ui/Container";
import { buildNav } from "./nav";
import { SoonTag } from "./SoonTag";

export async function Footer() {
  const [t, tNav, locale] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
    getLocale(),
  ]);

  const contacts = [
    { label: t("whatsapp"), value: siteConfig.contact.whatsapp, href: whatsappHref(t("whatsappMessage")) },
    { label: t("email"), value: siteConfig.contact.email, href: emailHref() },
  ];

  return (
    <footer data-tone="dark" className="bg-ink text-paper">
      <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Wordmark className="h-6 w-auto" />
          <p className="mono-label mt-6 text-xs text-steel">{t("tagline")}</p>
          <p className="text-muted mt-6 max-w-sm text-sm">{t("summary")}</p>
        </div>

        <nav aria-label={t("explore")} className="lg:col-span-3">
          <h2 className="mono-label text-xs font-medium text-steel [font-stretch:100%]">{t("explore")}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {buildNav(locale, (key) => tNav(key)).map((link) => (
              <li key={link.href}>
                <NextLink href={link.href} className="inline-flex items-center gap-2 transition-colors hover:text-signal">
                  {link.label}
                  {link.soon && <SoonTag label={tNav("soon")} />}
                </NextLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <h2 className="mono-label text-xs font-medium text-steel [font-stretch:100%]">{t("contact")}</h2>
          <dl className="mt-5 space-y-3 text-sm">
            {contacts.map((c) => (
              <div key={c.label} className="flex gap-3">
                <dt className="text-steel">{c.label}</dt>
                <dd>
                  {c.href ? (
                    <a href={c.href} dir="ltr" className="hover:text-signal transition-colors">
                      {c.value}
                    </a>
                  ) : (
                    <span className="text-steel">{t("comingSoon")}</span>
                  )}
                </dd>
              </div>
            ))}
            <div className="flex gap-3">
              <dt className="text-steel">{t("markets")}</dt>
              <dd>{t("marketsValue")}</dd>
            </div>
          </dl>
        </div>
      </Container>

      <Container className="flex flex-col gap-2 border-t border-graphite py-6 text-xs text-steel sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. {t("rights")}
        </p>
        <p className="mono-label">{t("signature")}</p>
      </Container>
    </footer>
  );
}
