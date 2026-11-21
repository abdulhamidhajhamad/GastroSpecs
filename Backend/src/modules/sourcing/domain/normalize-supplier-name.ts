/** Legal-form words that vary between documents of the same company. */
const COMPANY_SUFFIXES = new Set(["co", "company", "ltd", "limited", "inc", "llc", "corp", "corporation", "gmbh", "srl", "spa"]);

/**
 * The key that spots the same supplier written differently:
 * "Shanghai Yixi Food Machinery Co., Ltd." and "shanghai yixi food machinery" → "shanghai yixi food machinery".
 * Stored in a unique column, so the database itself refuses a duplicate supplier.
 */
export function normalizeSupplierName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // accents: "Société" → "societe"
    .replace(/[^\p{L}\p{N}]+/gu, " ") // punctuation → space, keeps any script (Chinese, Arabic…)
    .split(" ")
    .filter((word) => word && !COMPANY_SUFFIXES.has(word))
    .join(" ");
}
