import { SupplierPage } from "@/features/admin";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <SupplierPage id={(await params).id} />;
}
