import type { ContactFields, SupplierFields } from "../../types";
import type { FieldDef } from "../RecordForm";

export const SUPPLIER_FIELDS: FieldDef<keyof SupplierFields>[] = [
  { name: "name", label: "Company name (English)", required: true },
  { name: "nameLocal", label: "Name in their language" },
  { name: "country", label: "Country" },
  { name: "city", label: "City" },
  { name: "website", label: "Website", type: "url" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "address", label: "Address", wide: true },
  { name: "notes", label: "Our notes (quality, terms, how dealing with them went…)", multiline: true },
];

export const CONTACT_FIELDS: FieldDef<keyof ContactFields>[] = [
  { name: "name", label: "Name", required: true },
  { name: "role", label: "Role" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "tel" },
  { name: "whatsapp", label: "WhatsApp", type: "tel" },
  { name: "wechat", label: "WeChat" },
  { name: "notes", label: "Notes", multiline: true },
];
