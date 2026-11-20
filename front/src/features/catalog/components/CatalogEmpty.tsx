type CatalogEmptyProps = {
  title: string;
  text: string;
};

/** Shown while the backend is not connected or returns no products. */
export function CatalogEmpty({ title, text }: CatalogEmptyProps) {
  return (
    <div className="border border-dashed border-ink/20 px-6 py-16 text-center sm:py-20">
      <h2 className="text-2xl leading-snug sm:text-3xl">{title}</h2>
      <p className="mt-4 text-base text-muted sm:text-lg">{text}</p>
    </div>
  );
}
