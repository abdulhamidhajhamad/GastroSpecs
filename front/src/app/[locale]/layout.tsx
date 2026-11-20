import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { assertLocale } from "@/i18n/locale";
import { isRtl, routing } from "@/i18n/routing";
import { fontVariables } from "@/shared/config/fonts";
import { siteConfig } from "@/shared/config/site";
import { Footer } from "@/shared/layout/Footer";
import { Header } from "@/shared/layout/Header";
import { QuoteProvider } from "@/shared/sections/QuoteProvider";
import { projectTypes } from "@/shared/sections/quote";
import "../globals.css";

type LayoutProps = { children: ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0e0e0e",
};

export async function generateMetadata({ params }: Omit<LayoutProps, "children">): Promise<Metadata> {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t("title"), template: `%s | ${siteConfig.name}` },
    description: t("description"),
    applicationName: siteConfig.name,
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const locale = assertLocale((await params).locale);
  setRequestLocale(locale);

  const [t, tf] = await Promise.all([getTranslations("nav"), getTranslations("contact.form")]);

  // One quote dialog for the whole app; every "Request a quote" button opens it in place.
  const quoteConfig = {
    email: siteConfig.contact.bookingEmail,
    subject: tf("subject"),
    types: projectTypes.map((key) => ({ value: key, label: tf(`types.${key}`) })),
    labels: {
      title: tf("title"),
      intro: tf("intro"),
      email: tf("email"),
      phone: tf("phone"),
      type: tf("type"),
      typePlaceholder: tf("typePlaceholder"),
      business: tf("business"),
      submit: tf("submit"),
      close: tf("close"),
    },
  };

  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"} className={fontVariables}>
      <body>
        {/* messages={null}: client components get their strings as props, so no dictionary is shipped to the browser. */}
        <NextIntlClientProvider messages={null}>
          <QuoteProvider config={quoteConfig}>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
            >
              {t("skip")}
            </a>
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </QuoteProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
