"use client";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, CloudUpload, Layers3, Loader2, Plus, PlusCircle, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadImageDataUrl } from "@/lib/cloudinaryUpload";
import { getBlurPlaceholderProps } from "@/lib/imagePlaceholder";
import { moveProductImageToFront } from "@/lib/productImages";
import { cn } from "@/lib/utils";

const selectionChipClass = (selected) =>
  cn(
    "inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
    selected
      ? "border-primary bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(10,61,46,0.14)]"
      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
  );

const uploadActionClass =
  "relative overflow-hidden inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

export default function AddProduct() {
  const router = useRouter();
  const pathname = usePathname();
  const [Name, setName] = useState("");
  const [Description, setDescription] = useState("");
  const [Price, setPrice] = useState("");
  const [Categories, setCategories] = useState([]); // array of selected category ids
  const [images, setImages] = useState([]); // Array of { url, blurDataURL, publicId, file, isNew }
  const [saving, setSaving] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);

  const [allCategories, setAllCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) setAllCategories(data.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsAddingCat(true);
    try {
      let uploadedCategoryImage = "";
      let uploadedCategoryImagePublicId = "";
      let uploadedCategoryBlurDataURL = "";
      if (newCatImage) {
        const uploaded = await uploadImageDataUrl(newCatImage, "kifayatly_categories");
        uploadedCategoryImage = uploaded.url;
        uploadedCategoryImagePublicId = uploaded.publicId;
        uploadedCategoryBlurDataURL = uploaded.blurDataURL;
      }

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          image: uploadedCategoryImage,
          imagePublicId: uploadedCategoryImagePublicId,
          blurDataURL: uploadedCategoryBlurDataURL,
          imageDataUrl: newCatImage || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Category added!", "success");
        setNewCatName("");
        setNewCatImage("");
        setIsCategoryModalOpen(false);
        fetchCategories();
      } else {
        showToast(data.error || "Failed to add category", "error");
      }
    } catch {
      showToast("Error adding category", "error");
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleCategoryImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewCatImage(ev.target?.result || "");
    reader.readAsDataURL(file);
  };

  const toggleCategory = (categoryId) => {
    setCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const processFiles = (filesList) => {
    const validFiles = Array.from(filesList).filter((f) =>
      f.type.startsWith("image/"),
    );
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, { url: ev.target.result, file, isNew: true }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  }, []);

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
    e.target.value = null; // reset so same file can be selected again if removed
  };

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const makeImagePrimary = (indexToMove) => {
    setImages((prev) => moveProductImageToFront(prev, indexToMove));
  };

  const showToast = (message, type = "success") => {
    if (type === "error") toast.error(message);
    else toast.success(message);
  };

  const clearForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategories([]);
    setImages([]);
    setIsLive(false);
    setIsDragOver(false);
    setIsCategoryModalOpen(false);
    setNewCatName("");
    setNewCatImage("");
  };

  useEffect(() => {
    if (pathname === "/admin/products/add") {
      clearForm();
    }
  }, [pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Name || !Price || Categories.length === 0) {
      showToast("Name, Price and at least one Category are required.", "error");
      return;
    }

    setSaving(true);
    let finalImages = [];

    try {
      for (const img of images) {
        if (!img.isNew) {
          finalImages.push({
            url: img.url,
            blurDataURL: img.blurDataURL || "",
            publicId: img.publicId || "",
          });
        } else {
          const uploadedImage = await uploadImageDataUrl(img.url, "kifayatly_products");
          finalImages.push(uploadedImage);
        }
      }
    } catch (err) {
      showToast("Error uploading images: " + err.message, "error");
      setSaving(false);
      return;
    }

    const payload = {
      Name,
      Description,
      Price: Number(Price),
      Images: finalImages,
      Category: Categories,
      isLive,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Product saved!", "success");
        router.push("/admin/products");
        router.refresh();
      } else {
        showToast(
          data.message || data.error || "Failed to save product",
          "error",
        );
      }
    } catch (err) {
      showToast("Network error while saving product.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full pb-10">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
          Add New Product
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Create a new product. Toggle it Live when ready to publish.
        </p>
      </div>

      <div className="surface-card max-w-2xl rounded-[calc(var(--radius-xl)+0.5rem)] p-4 shadow-[0_24px_60px_rgba(10,61,46,0.08)] md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Product Name */}
          <div>
            <Label className="mb-2">Product Name</Label>
            <Input
              type="text"
              value={Name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 px-4"
              placeholder="e.g., Luxury Tea Set"
              required
            />
          </div>

          {/* Price */}
          <div>
            <Label className="mb-2">Price (Rs)</Label>
            <Input
              type="number"
              value={Price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-11 px-4"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          {/* Category - Multi-select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Categories</Label>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
              >
                <PlusCircle className="size-3.5" /> Manage Categories
              </button>
            </div>
            <div className="flex min-h-[52px] flex-wrap gap-2 rounded-xl border border-border bg-muted/35 p-3">
              {allCategories.length === 0 ? (
                <p className="self-center text-xs text-muted-foreground">
                  No categories yet. Click "Manage Categories" to add one.
                </p>
              ) : (
                allCategories.map((cat) => {
                  const selected = Categories.includes(cat._id);
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => toggleCategory(cat._id)}
                      className={selectionChipClass(selected)}
                    >
                      {selected && (
                        <Check className="mr-1 size-3" />
                      )}
                      {cat.name}
                    </button>
                  );
                })
              )}
            </div>
            {Categories.length === 0 && allCategories.length > 0 && (
              <p className="mt-1 text-xs text-destructive/80">
                Select at least one category above.
              </p>
            )}
          </div>

          {/* isLive Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/35 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Publish as Live
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isLive
                  ? "🟢 Will be visible to customers immediately"
                  : "🔴 Draft — hidden from store until toggled Live"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLive(!isLive)}
              className={cn(
                "relative h-6 w-12 rounded-lg transition-colors duration-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/20",
                isLive ? "bg-primary" : "bg-border",
              )}
              aria-label="Toggle Live"
            >
              <span
                className={cn(
                  "absolute left-0.5 top-0.5 h-5 w-5 rounded-md bg-background shadow transition-transform duration-300",
                  isLive ? "translate-x-6" : "translate-x-0",
                )}
              />
            </button>
          </div>

          {/* Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Product Images</Label>
              <div className={uploadActionClass}>
                <PlusCircle className="size-3.5" /> Add More Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted/40"
                >
                  <Image
                    src={img.url}
                    alt="Preview"
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                    {...getBlurPlaceholderProps(img.blurDataURL)}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background/95 text-destructive shadow-sm opacity-0 transition-all hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  {idx !== 0 ? (
                    <button
                      type="button"
                      onClick={() => makeImagePrimary(idx)}
                      className="absolute bottom-2 left-2 rounded-md border border-border bg-background/95 px-2 py-1 text-[10px] font-bold text-foreground shadow-sm opacity-0 transition-all hover:border-primary hover:text-primary group-hover:opacity-100"
                    >
                      Set Main
                    </button>
                  ) : null}
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-foreground/80 px-2 py-0.5 text-[10px] font-bold text-background shadow-sm">
                      Main Image
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200",
                isDragOver
                  ? "border-primary bg-primary/8"
                  : "border-border bg-muted/20 hover:border-primary/35 hover:bg-muted/35",
              )}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CloudUpload className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Drag & Drop Images Here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse multiple files
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    PNG, JPG up to 10MB each
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Choose "Set Main" on any preview to move it to the first slot.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="mb-2">Description</Label>
            <Textarea
              value={Description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-28 resize-none px-4 py-3"
              placeholder="Enter product description..."
              rows="4"
            />
          </div>


          {/* Buttons */}
          <div className="flex gap-4 mt-6 md:mt-8">
            <Button
              type="submit"
              disabled={saving}
              size="lg"
              className="min-w-[140px] flex-1 rounded-xl"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />Saving...
                </>
              ) : (
                "Save Product"
              )}
            </Button>
            <Button
              type="button"
              onClick={clearForm}
              variant="outline"
              size="lg"
              className="min-w-[140px] flex-1 rounded-xl"
            >
              Clear
            </Button>
          </div>
        </form>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"
            onClick={() => setIsCategoryModalOpen(false)}
          ></div>
          <div className="relative flex max-h-[85vh] w-[92%] flex-col overflow-hidden rounded-[calc(var(--radius-xl)+0.75rem)] border border-border bg-card shadow-[0_28px_80px_rgba(10,61,46,0.16)] animate-fadeInUp sm:w-[512px]">
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/35 p-5 md:p-6">
              <h2 className="truncate pr-4 text-xl font-bold text-foreground">
                Manage Categories
              </h2>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 md:p-8">
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="rounded-2xl border border-border bg-muted/25 p-4">
                  <Label className="mb-2 text-foreground">New Category Name</Label>
                  <div className="flex flex-col gap-3">
                    <Input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-4 sm:flex-1"
                      placeholder="e.g. Health & Beauty"
                      required
                    />
                    <div className="flex items-center gap-3">
                      <label className={cn(uploadActionClass, "h-12 rounded-xl px-4 text-sm")}>
                        Category Image
                        <input type="file" accept="image/*" onChange={handleCategoryImageSelect} className="hidden" />
                      </label>
                      {newCatImage ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-border">
                          <Image
                            src={newCatImage}
                            alt="Category preview"
                            fill
                            sizes="48px"
                            className="object-cover"
                            {...getBlurPlaceholderProps()}
                          />
                        </div>
                      ) : null}
                      <Button
                        type="submit"
                        disabled={isAddingCat}
                        className="w-full rounded-xl px-6 sm:w-auto"
                      >
                        {isAddingCat ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Plus className="size-4" />
                        )}{" "}
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
              <div className="mt-8">
                <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Current Catalog Categories
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {allCategories.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/25 py-10 text-center">
                      <Layers3 className="mx-auto mb-2 size-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        No categories found.
                      </p>
                    </div>
                  ) : (
                    allCategories.map((cat) => (
                      <div
                        key={cat._id}
                        className="group flex items-center justify-between overflow-hidden rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/25"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3 pr-4">
                          {cat.image ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border">
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                                {...getBlurPlaceholderProps(cat.blurDataURL)}
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {cat.name?.charAt(0) || "?"}
                            </div>
                          )}
                          <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-tight text-foreground">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          <Check className="size-3.5" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 justify-center border-t border-border bg-muted/35 p-4 md:p-6">
              <Button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                variant="outline"
                size="lg"
                className="w-full rounded-xl px-12 sm:w-auto"
              >
                Done & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
