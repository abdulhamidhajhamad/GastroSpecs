"use client";

import { useRouter } from "next/navigation";
import { apiDelete, apiPatch, apiPost, failureMessage } from "../../api";
import { useApiData } from "../../lib/useApiData";
import type { AdminCategoryNode, AdminProduct } from "../../types";
import { AdminPage, LoadState, Panel } from "../AdminPage";
import { buttonStyles } from "../Field";
import { ProductForm } from "./ProductForm";
import { ProductImages } from "./ProductImages";
import { ProductOffers } from "./ProductOffers";

const BACK = { href: "/admin/dashboard/products", label: "Products" };

/** A new product (no id), or an existing one with its photos and suppliers. */
export function ProductEditor({ id }: { id?: string }) {
  const router = useRouter();
  const categories = useApiData<AdminCategoryNode[]>("/admin/catalog/categories");
  const product = useApiData<AdminProduct>(id ? `/admin/catalog/products/${id}` : null);

  const loading = !categories.data || (id && !product.data);
  if (loading) {
    return (
      <AdminPage title={id ? "Product" : "New product"} back={BACK} wide>
        <LoadState error={categories.error ?? product.error} />
      </AdminPage>
    );
  }

  if (!id) {
    const create = async (body: Record<string, unknown>) => {
      const result = await apiPost<{ id: string }>("/admin/catalog/products", body);
      // Photos and suppliers need the product to exist, so continue on its own page.
      if (result.ok) router.replace(`/admin/dashboard/products/${result.data.id}`);
      return result;
    };
    return (
      <AdminPage title="New product" description="Our code (GS-…) is given automatically from the category." back={BACK} wide>
        <Panel title="Product">
          <ProductForm categories={categories.data!} onSubmit={create} />
        </Panel>
      </AdminPage>
    );
  }

  const current = product.data!;

  async function remove() {
    if (!confirm(`Delete ${current.code}? Its photos and supplier links are deleted too.`)) return;
    const result = await apiDelete(`/admin/catalog/products/${id}`);
    if (result.ok) router.push(BACK.href);
    else alert(failureMessage(result));
  }

  return (
    <AdminPage
      title={current.nameEn}
      description={
        <>
          <span className="font-mono">{current.code}</span> · {current.published ? "Published" : "Draft (hidden from the site)"} · display rank {current.displayRank}
        </>
      }
      back={BACK}
      wide
      actions={
        <button type="button" onClick={remove} className={buttonStyles.danger}>
          Delete product
        </button>
      }
    >
      <div className="grid gap-8">
        <ProductOffers productId={id} />
        <ProductImages productId={id} images={current.images} onChange={product.reload} />
        <Panel title="Product">
          <ProductForm product={current} categories={categories.data!} onSubmit={(body) => apiPatch(`/admin/catalog/products/${id}`, body)} onSaved={product.reload} />
        </Panel>
      </div>
    </AdminPage>
  );
}
