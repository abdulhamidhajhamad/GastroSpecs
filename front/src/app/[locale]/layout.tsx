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
import { LeadDialogs } from "@/shared/sections/LeadDialogs";
import { type LeadDialogsConfig, projectTypes } from "@/shared/sections/quote";
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

  const [t, tc] = await Promise.all([getTranslations("nav"), getTranslations("contact")]);

  // The quote and "Contact us" popups, mounted once; every button opens them in place.
  const dialogs: LeadDialogsConfig = {
    locale,
    close: tc("form.close"),
    status: {
      sending: tc("status.sending"),
      sentTitle: tc("status.sentTitle"),
      sentText: tc("status.sentText"),
      error: tc("status.error"),
      done: tc("status.done"),
    },
    quote: {
      title: tc("form.title"),
      intro: tc("form.intro"),
      email: tc("form.email"),
      phone: tc("form.phone"),
      type: tc("form.type"),
      typePlaceholder: tc("form.typePlaceholder"),
      types: projectTypes.map((key) => ({ value: key, label: tc(`form.types.${key}`) })),
      business: tc("form.business"),
      submit: tc("form.submit"),
    },
    contact: {
      title: tc("message.title"),
      intro: tc("message.intro"),
      name: tc("message.name"),
      phone: tc("message.phone"),
      message: tc("message.message"),
      submit: tc("message.submit"),
    },
  };

  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"} className={fontVariables}>
      <body>
        {/* messages={null}: client components get their strings as props, so no dictionary is shipped to the browser. */}
        <NextIntlClientProvider messages={null}>
          <LeadDialogs config={dialogs}>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:bg-paper focus:px-4 focus:py-2 focus:text-ink"
            >
              {t("skip")}
            </a>
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </LeadDialogs>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
