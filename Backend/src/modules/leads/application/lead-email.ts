import type { Email } from "@/shared/mail/mailer";
import type { Lead } from "../domain/lead";

const PROJECT_TYPE_LABELS: Record<string, string> = {
  trader: "Equipment trader / distributor",
  fastFood: "Fast food restaurant",
  central: "Central / production kitchen",
  hotel: "Hotel or large kitchen",
  other: "Other",
};

const KIND: Record<Lead["source"], string> = {
  quote: "Quote request",
  contact: "Contact message",
  catalog_download: "Catalog download",
};

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The subject tells at a glance what came in and from whom, e.g. "New quote request — Al Baik · Fast food restaurant". */
function subjectOf(lead: Lead): string {
  const who = lead.company ?? lead.name ?? lead.email ?? lead.phone ?? "website visitor";
  const type = lead.projectType ? ` · ${PROJECT_TYPE_LABELS[lead.projectType] ?? lead.projectType}` : "";
  return `New ${KIND[lead.source].toLowerCase()} — ${who}${type}`;
}

/** The email the sales inbox gets for a new lead: every detail the visitor typed, with Reply going to them. */
export function leadEmail(lead: Lead, to: string, context: { page?: string; locale?: string }): Email {
  const rows: [string, string | null | undefined][] = [
    ["Type", KIND[lead.source]],
    ["Name", lead.name],
    ["Business", lead.company],
    ["Project", lead.projectType && (PROJECT_TYPE_LABELS[lead.projectType] ?? lead.projectType)],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Message", lead.message],
    ["Sent from", context.page],
    ["Site language", context.locale === "ar" ? "Arabic" : context.locale === "en" ? "English" : undefined],
    ["Received", `${lead.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC`],
  ];
  const filled = rows.filter((row): row is [string, string] => Boolean(row[1]));
  const hint = lead.email ? "Reply to this email to answer the customer directly." : "No email given: contact the customer by phone.";

  const text = [...filled.map(([label, value]) => `${label}: ${value}`), "", hint].join("\n");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111">
<h2 style="margin:0 0 16px">${escape(KIND[lead.source])}</h2>
<table cellpadding="8" style="border-collapse:collapse">${filled
    .map(([label, value]) => `<tr><td style="color:#666;vertical-align:top;white-space:nowrap">${escape(label)}</td><td style="white-space:pre-wrap">${escape(value)}</td></tr>`)
    .join("")}</table>
<p style="color:#666;margin-top:16px">${escape(hint)}</p></div>`;

  return { to, replyTo: lead.email ?? undefined, subject: subjectOf(lead), text, html };
}
