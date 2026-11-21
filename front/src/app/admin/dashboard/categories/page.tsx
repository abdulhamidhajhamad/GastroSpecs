import { AdminPage, CategoryImages } from "@/features/admin";

export default function CategoriesPage() {
  return (
    <AdminPage title="Categories" description="JPEG, PNG, WebP or AVIF, up to 10 MB. A square photo works best.">
      <CategoryImages />
    </AdminPage>
  );
}
