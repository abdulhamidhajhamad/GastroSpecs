/** Project type options for the quote form, in order (trader first). Labels live in contact.form.types. */
export const projectTypes = ["trader", "fastFood", "central", "hotel", "other"] as const;

/** The strings the two popup forms need, built on the server so no dictionary ships to the browser. */
export type LeadDialogsConfig = {
  locale: string;
  close: string;
  status: { sending: string; sentTitle: string; sentText: string; error: string; done: string };
  quote: {
    title: string;
    intro: string;
    email: string;
    phone: string;
    type: string;
    typePlaceholder: string;
    types: { value: string; label: string }[];
    business: string;
    submit: string;
  };
  contact: { title: string; intro: string; name: string; phone: string; message: string; submit: string };
};
