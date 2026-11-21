import type { ImportResult, ItemResult } from "./import-plan.executor";

const codes = (items: ItemResult[]) => items.map((i) => i.code ?? i.supplierModel).join("، ");

/** The chat message after an import, in Arabic: what was added, what was skipped, what needs a look. */
export function importReport({ supplier, contactsAdded, items }: ImportResult): string {
  const by = (status: ItemResult["status"]) => items.filter((i) => i.status === status);
  const created = by("created");
  const linked = by("linked");
  const skipped = by("skipped");
  const failed = by("failed");
  const attention = items.filter((i) => i.status !== "failed" && i.warnings.length);

  const lines = [
    "**تم تنفيذ الخطة**",
    `- المورد: ${supplier.name} (${supplier.created ? "جديد" : "موجود مسبقاً"})`,
    `- أشخاص أُضيفوا: ${contactsAdded}`,
    `- منتجات جديدة (مسودات، غير منشورة): ${created.length}${created.length ? ` — ${codes(created)}` : ""}`,
    `- رُبطت بمنتجات موجودة: ${linked.length}${linked.length ? ` — ${codes(linked)}` : ""}`,
    `- تخطّيتها لأنها موجودة عند المورد: ${skipped.length}`,
    `- فشلت: ${failed.length}`,
    ...failed.map((i) => `  - ${i.supplierModel} (ص ${i.catalogPage}): ${i.message}`),
  ];
  if (attention.length) {
    lines.push("", "**تحتاج نظرة منك:**", ...attention.map((i) => `- ${i.code ?? i.supplierModel}: ${i.warnings.join("؛ ")}`));
  }
  lines.push("", "راجع المنتجات من صفحة **Products** وانشرها لما تكون جاهزة.");
  return lines.join("\n");
}
