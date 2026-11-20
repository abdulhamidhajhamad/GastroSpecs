import { getTranslations } from "next-intl/server";
import { QUOTE_HASH, siteConfig } from "@/shared/config/site";
import { emailHref, whatsappHref } from "@/shared/lib/contact";
import { Section } from "@/shared/ui/Section";
import { QuoteButton } from "./QuoteButton";

/**
 * Closing call to action, used at the end of every page. "Request a quote" opens the booking popup
 * (mounted once in the layout). Direct channels stay "coming soon" until set in shared/config/site.ts.
 */
export async function ContactCta() {
  const [t, tf] = await Promise.all([getTranslations("contact"), getTranslations("contact.form")]);

  const channels = [
    { key: "whatsapp", value: siteConfig.contact.whatsapp, href: whatsappHref(t("whatsappMessage")) },
    { key: "email", value: siteConfig.contact.email, href: emailHref() },
  ] as const;

  return (
    <Section id={QUOTE_HASH}>
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="eyebrow text-muted">{t("eyebrow")}</p>
          <h2 className="mt-5 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{t("title")}</h2>
          <p className="text-muted mt-6 max-w-xl text-base sm:text-lg">{t("text")}</p>
          <QuoteButton className="mt-10 w-full sm:w-auto">{tf("open")}</QuoteButton>
        </div>

        <dl className="border-t border-ink lg:col-span-5 lg:self-end">
          {channels.map((c) => (
            <div key={c.key} className="border-line flex items-baseline justify-between gap-6 border-b py-5">
              <dt className="mono-label text-muted text-xs">{t(`channels.${c.key}`)}</dt>
              <dd className="text-end">
                {c.href ? (
                  <a href={c.href} dir="ltr" className="font-medium transition-colors hover:text-signal">
                    {c.value}
                  </a>
                ) : (
                  <span className="text-muted">{t("comingSoon")}</span>
                )}
              </dd>
            </div>
          ))}
          <div className="border-line flex items-baseline justify-between gap-6 border-b py-5">
            <dt className="mono-label text-muted text-xs">{t("channels.markets")}</dt>
            <dd className="text-end font-medium">{t("marketsValue")}</dd>
          </div>
        </dl>
      </div>
    </Section>
  );
}
