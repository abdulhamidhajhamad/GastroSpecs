# The plan and the report

## Building the plan

Call `propose_import_plan` once with the **complete** plan for the catalog:

- `supplier`: `existingSupplierId` if found, otherwise the supplier's details from the catalog (cover, back
  page, header: company name in English and in its own language, city, country, website, phone, email).
- `contacts`: only real people with a way to reach them.
- `products`: every product in the catalog, in catalog order. Each has `supplierModel`, `catalogPage`,
  `action` ("create" or "link"), and for "create" the full `product` data and its `image`.
- `report`: your report to the admin, in Arabic (format below). It is shown at the top of the plan card,
  so it's the only place you write it.

Do not split a catalog into several plans. Before calling the tool, check that no `supplierModel` appears
twice and that every `categorySlug` came from `list_categories`.

## Report format (Arabic, short)

```
**المورد:** <name> — <جديد / موجود مسبقاً>
**الأشخاص:** <count or "لا يوجد في الكتالوج">

**المنتجات:** <total>
- جديد: <n> (<category>: <n>, …)
- ربط بمنتج موجود: <n> (<model> → <our code>)
- بدون صورة صالحة: <n>
- شعارات المورد اللي رح تنمسح من الصور: <n>

**ملاحظات تحتاج انتباهك:**
- <page n>: <what and why>
```

Then one line asking: "إذا موافق اضغط **موافقة** تحت الخطة، أو قلي شو بدك أعدّل."

Keep the report factual: numbers, decisions you made, and anything uncertain. Don't repeat every product;
the admin sees the full list in the plan card.
