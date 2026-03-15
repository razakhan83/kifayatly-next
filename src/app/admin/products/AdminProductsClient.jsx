"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useMemo, useState } from "react";
import { Check, ImageIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteProductAction, toggleProductLiveAction } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPrimaryProductImage } from "@/lib/productImages";
import { getBlurPlaceholderProps } from "@/lib/imagePlaceholder";

export default function AdminProductsClient({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.Name?.toLowerCase().includes(query) ||
        product.Category.some((category) => category.toLowerCase().includes(query)),
    );
  }, [products, searchQuery]);

  async function handleDelete() {
    if (!deleteModal.product) return;
    setDeleting(true);
    startTransition(async () => {
      try {
        await deleteProductAction(deleteModal.product._id);
        setProducts((previous) => previous.filter((product) => product._id !== deleteModal.product._id));
        toast.error(`Product "${deleteModal.product.Name}" deleted.`);
        setDeleteModal({ open: false, product: null });
      } catch (error) {
        toast.error(error.message || "Failed to delete product");
      } finally {
        setDeleting(false);
      }
    });
  }

  async function handleToggleLive(product) {
    setTogglingId(product._id);
    startTransition(async () => {
      try {
        const result = await toggleProductLiveAction(product._id, !product.isLive);
        setProducts((previous) =>
          previous.map((entry) => (entry._id === product._id ? { ...entry, isLive: result.isLive } : entry)),
        );
        toast.success(`"${product.Name}" is now ${result.isLive ? "Live" : "Draft"}.`);
      } catch (error) {
        toast.error(error.message || "Toggle failed");
      } finally {
        setTogglingId(null);
      }
    });
  }

  const formatPrice = (price) => `PKR ${Number(price).toLocaleString("en-PK")}`;

  return (
    <div className="pb-24 md:pb-0">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage inventory ({products.length} total, {products.filter((product) => product.isLive).length} live)
          </p>
        </div>
        <Link href="/admin/products/add">
          <Button>
            <Plus data-icon="inline-start" />
            Add New Product
          </Button>
        </Link>
      </div>

      <div className="mb-5 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products or categories"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4 md:hidden">
        {filteredProducts.length === 0 ? (
          <div className="surface-card rounded-xl p-10 text-center">
            <p className="font-medium text-muted-foreground">No products found.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className="surface-card rounded-xl p-4">
              <div className="flex gap-4">
                <div className="relative size-20 overflow-hidden rounded-lg border border-border bg-muted">
                  {getPrimaryProductImage(product)?.url ? (
                    <Image
                      src={getPrimaryProductImage(product).url}
                      alt={product.Name}
                      fill
                      className="object-cover"
                      {...getBlurPlaceholderProps(getPrimaryProductImage(product).blurDataURL)}
                      unoptimized
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="size-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-base font-semibold text-foreground">{product.Name}</h3>
                  <p className="mt-1 text-lg font-bold text-primary">{formatPrice(product.Price)}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {product.Category.filter(Boolean).map((category) => (
                      <Badge key={category} variant="secondary">{category}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleToggleLive(product)}
                  disabled={togglingId === product._id}
                  className={`inline-flex min-w-24 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    product.isLive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {product.isLive ? "Live" : "Draft"}
                </button>
                <div className="flex gap-2">
                  <Link href={`/admin/products/edit/${product._id}`}>
                    <Button variant="outline" size="icon">
                      <Pencil />
                    </Button>
                  </Link>
                  <Button variant="destructive" size="icon" onClick={() => setDeleteModal({ open: true, product })}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-center">Live</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="transition-colors hover:bg-muted/35">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative size-12 overflow-hidden rounded-lg border border-border bg-muted">
                        {getPrimaryProductImage(product)?.url ? (
                          <Image
                            src={getPrimaryProductImage(product).url}
                            alt={product.Name}
                            fill
                            className="object-cover"
                            {...getBlurPlaceholderProps(getPrimaryProductImage(product).blurDataURL)}
                            unoptimized
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <ImageIcon className="size-4" />
                          </div>
                        )}
                      </div>
                      <span className="max-w-[220px] line-clamp-2 text-sm font-semibold text-foreground">{product.Name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary">{formatPrice(product.Price)}</td>
                  <td className="px-6 py-4">
                    <div className="flex max-w-[180px] flex-wrap gap-1.5">
                      {product.Category.filter(Boolean).map((category) => (
                        <Badge key={category} variant="secondary">{category}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={product.StockStatus === "In Stock" ? "emerald" : "destructive"}>
                      {product.StockStatus === "In Stock" ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleLive(product)}
                      disabled={togglingId === product._id}
                      className={`inline-flex min-w-24 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        product.isLive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {product.isLive ? (
                        <>
                          <Check className="mr-2 size-4" />
                          Live
                        </>
                      ) : (
                        "Draft"
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/products/edit/${product._id}`}>
                        <Button variant="outline">
                          <Pencil data-icon="inline-start" />
                          Edit
                        </Button>
                      </Link>
                      <Button variant="destructive" onClick={() => setDeleteModal({ open: true, product })}>
                        <Trash2 data-icon="inline-start" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={deleteModal.open} onOpenChange={(open) => setDeleteModal((previous) => ({ ...previous, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-semibold text-foreground">{deleteModal.product?.Name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, product: null })}>Cancel</Button>
            </AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Product"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
