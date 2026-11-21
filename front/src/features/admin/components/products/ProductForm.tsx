"use client";

import { useState, type FormEvent } from "react";
import { failureMessage, type ApiResult } from "../../api";
import { ENERGY_TYPES, GAS_TYPES, type AdminCategoryNode, type AdminProduct, type SpecRow } from "../../types";
import { buttonStyles, Field, SelectField, TextArea } from "../Field";

/** Number inputs, in display order. One list drives both the inputs and the request body. */
const NUMBER_FIELDS = [
  { name: "widthMm", label: "Width (mm)", step: "1" },
  { name: "depthMm", label: "Depth (mm)", step: "1" },
  { name: "heightMm", label: "Height (mm)", step: "1" },
  { name: "weightKg", label: "Net weight (kg)", step: "0.1" },
  { name: "powerKw", label: "Power / heat input (kW)", step: "0.01" },
  { name: "voltage", label: "Voltage (V)", step: "1" },
] as const;

type NumberField = (typeof NUMBER_FIELDS)[number]["name"];

const LABELS: Record<string, string> = { electric: "Electric", gas: "Gas", dual: "Gas + electric", lpg: "LPG", natural_gas: "Natural gas" };

const text = (value: number | string | null | undefined) => (value == null ? "" : String(value));
const numberOrNull = (value: string) => (value.trim() === "" ? null : Number(value));

type ProductFormProps = {
  product?: AdminProduct;
  categories: AdminCategoryNode[];
  onSubmit: (body: Record<string, unknown>) => Promise<ApiResult<unknown>>;
  onSaved?: () => void;
};

/** Creates or edits a product. Code and display order are worked out by the API. */
export function ProductForm({ product, categories, onSubmit, onSaved }: ProductFormProps) {
  const [values, setValues] = useState(() => ({
    nameEn: text(product?.nameEn),
    nameAr: text(product?.nameAr),
    summaryEn: text(product?.summaryEn),
    summaryAr: text(product?.summaryAr),
    categoryId: text(product?.categoryId),
    energyType: text(product?.energyType),
    phases: text(product?.phases),
    frequencyHz: text(product?.frequencyHz),
    // A calculated figure is shown as a hint, not as a value: leaving the field empty keeps it calculated.
    currentAmps: product?.currentAmpsCalculated ? "" : text(product?.currentAmps),
    certifications: (product?.certifications ?? ["CE"]).join(", "),
    ...(Object.fromEntries(NUMBER_FIELDS.map((f) => [f.name, text(product?.[f.name])])) as Record<NumberField, string>),
  }));
  const [gasTypes, setGasTypes] = useState<string[]>(product?.gasTypes ?? []);
  const [specs, setSpecs] = useState<SpecRow[]>(product?.specs ?? []);
  const [published, setPublished] = useState(product?.published ?? false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null);

  const bind = (name: keyof typeof values) => ({
    value: values[name],
    onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [name]: e.target.value })),
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await onSubmit({
      nameEn: values.nameEn,
      nameAr: values.nameAr,
      summaryEn: values.summaryEn,
      summaryAr: values.summaryAr,
      categoryId: values.categoryId,
      ...Object.fromEntries(NUMBER_FIELDS.map((f) => [f.name, numberOrNull(values[f.name])])),
      energyType: values.energyType || null,
      gasTypes: values.energyType === "electric" ? [] : gasTypes,
      phases: numberOrNull(values.phases),
      frequencyHz: numberOrNull(values.frequencyHz),
      currentAmps: numberOrNull(values.currentAmps),
      certifications: values.certifications.split(/[,\s]+/).filter(Boolean),
      specs: specs.filter((s) => s.labelEn.trim() && s.labelAr.trim() && s.value.trim()),
      published,
    });
    setBusy(false);
    if (!result.ok) return setMessage({ error: true, text: failureMessage(result) });
    setMessage({ error: false, text: "Saved." });
    onSaved?.();
  }

  const setSpec = (index: number, key: keyof SpecRow, value: string) =>
    setSpecs((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  return (
    <form onSubmit={handleSubmit} className="grid gap-8">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <Field label="Name (English)" required {...bind("nameEn")} />
        <Field label="Name (Arabic)" required dir="rtl" {...bind("nameAr")} />
        <div className="sm:col-span-2">
          <SelectField label="Category" required {...bind("categoryId")}>
            <option value="">Pick a subcategory…</option>
            {categories.map((main) => (
              <optgroup key={main.id} label={main.nameEn}>
                {main.children.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nameEn}
                  </option>
                ))}
              </optgroup>
            ))}
          </SelectField>
        </div>
        <TextArea label="Short description (English)" rows={3} {...bind("summaryEn")} />
        <TextArea label="Short description (Arabic)" rows={3} dir="rtl" {...bind("summaryAr")} />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mono-label mb-2 text-xs text-steel">Technical specs</legend>
        {NUMBER_FIELDS.map((f) => (
          <Field key={f.name} label={f.label} type="number" min="0" step={f.step} {...bind(f.name)} />
        ))}
        <SelectField label="Energy" {...bind("energyType")}>
          <option value="">—</option>
          {ENERGY_TYPES.map((type) => (
            <option key={type} value={type}>
              {LABELS[type]}
            </option>
          ))}
        </SelectField>
        <SelectField label="Phases" {...bind("phases")}>
          <option value="">—</option>
          <option value="1">Single phase</option>
          <option value="3">Three phase</option>
        </SelectField>
        <SelectField label="Frequency" {...bind("frequencyHz")}>
          <option value="">—</option>
          <option value="50">50 Hz</option>
          <option value="60">60 Hz</option>
        </SelectField>
        <Field
          label="Current (A)"
          type="number"
          min="0"
          step="0.1"
          placeholder={product?.currentAmpsCalculated ? `≈ ${product.currentAmps} (calculated)` : "Empty = calculate"}
          {...bind("currentAmps")}
        />
        <Field label="Certifications (comma separated)" {...bind("certifications")} />
        {values.energyType && values.energyType !== "electric" && (
          <div className="grid gap-1 text-sm">
            <span>Gas types</span>
            <div className="flex gap-4 py-2">
              {GAS_TYPES.map((gas) => (
                <label key={gas} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={gasTypes.includes(gas)}
                    onChange={(e) => setGasTypes((list) => (e.target.checked ? [...list, gas] : list.filter((g) => g !== gas)))}
                  />
                  {LABELS[gas]}
                </label>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mono-label mb-2 text-xs text-steel">Other specs (oil capacity, tray size, temperature range…)</legend>
        {specs.map((row, i) => (
          <div key={i} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <Field label="Label (English)" value={row.labelEn} onChange={(e) => setSpec(i, "labelEn", e.target.value)} />
            <Field label="Label (Arabic)" dir="rtl" value={row.labelAr} onChange={(e) => setSpec(i, "labelAr", e.target.value)} />
            <Field label="Value" value={row.value} onChange={(e) => setSpec(i, "value", e.target.value)} />
            <button type="button" onClick={() => setSpecs((rows) => rows.filter((_, j) => j !== i))} className={`pb-2 ${buttonStyles.danger}`}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setSpecs((rows) => [...rows, { labelEn: "", labelAr: "", value: "" }])} className={`justify-self-start ${buttonStyles.outline}`}>
          Add spec
        </button>
      </fieldset>

      <div className="flex flex-wrap items-center gap-6 border-t border-ink/10 pt-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published on the site
        </label>
        <button type="submit" disabled={busy} className={buttonStyles.primary}>
          {busy ? "Saving…" : product ? "Save product" : "Create product"}
        </button>
        {message && <p className={`text-sm ${message.error ? "text-signal" : "text-muted"}`}>{message.text}</p>}
      </div>
    </form>
  );
}
