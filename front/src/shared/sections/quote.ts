/** Project type options for the quote form, in order (trader first). Labels live in contact.form.types. */
export const projectTypes = ["trader", "fastFood", "central", "hotel", "other"] as const;

export type QuoteConfig = {
  /** Where quote requests are sent. The form stays usable before it is set. */
  email: string;
  subject: string;
  types: { value: string; label: string }[];
  labels: {
    title: string;
    intro: string;
    email: string;
    phone: string;
    type: string;
    typePlaceholder: string;
    business: string;
    submit: string;
    close: string;
  };
};
