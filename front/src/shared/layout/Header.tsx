import NextLink from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/shared/brand/Logo";
import { ContactButton, QuoteButton } from "@/shared/sections/QuoteButton";
import { Container } from "@/shared/ui/Container";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu } from "./MobileMenu";
import { buildNav } from "./nav";
import { SoonTag } from "./SoonTag";

/** Solid black bar: the brand guide asks for a black panel behind the logo, never a busy photo. */
export async function Header() {
  const [t, locale] = await Promise.all([getTranslations("nav"), getLocale()]);

  const links = buildNav(locale, (key) => t(key));

  return (
    <header className="sticky top-0 z-50 border-b border-graphite bg-ink text-paper">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label={t("home")} className="shrink-0">
          <Wordmark className="h-[17px] w-auto sm:h-[19px]" />
        </Link>

        <nav aria-label={t("label")} className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-9">
            {links.map((link) => (
              <li key={link.href}>
                <NextLink
                  href={link.href}
                  className="mono-label inline-flex items-center gap-2 text-xs text-steel transition-colors hover:text-paper"
                >
                  {link.label}
                  {link.soon && <SoonTag label={t("soon")} />}
                </NextLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <LocaleSwitcher label={t("switchLanguage")} />
          <ContactButton variant="outline" size="sm" className="hidden lg:inline-flex">
            {t("contact")}
          </ContactButton>
          <QuoteButton size="sm" className="hidden sm:inline-flex">
            {t("quote")}
          </QuoteButton>
          <MobileMenu
            links={links}
            quoteLabel={t("quote")}
            contactLabel={t("contact")}
            labels={{ open: t("menu"), close: t("close"), soon: t("soon") }}
          />
        </div>
      </Container>
    </header>
  );
}
