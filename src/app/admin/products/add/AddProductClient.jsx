"use client";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { Check, CloudUpload, Layers3, Loader2, Plus, PlusCircle, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImageDataUrl } from "@/lib/cloudinaryUpload";
import { getBlurPlaceholderProps } from "@/lib/imagePlaceholder";

export default function AddProduct() {
  const [Name, setName] = useState("");
  const [Description, setDescription] = useState("");
  const [Price, setPrice] = useState("");
  const [Categories, setCategories] = useState([]); // array of selected category names
  const [stockQuantity, setStockQuantity] = useState("");
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
      if (newCatImage) {
        const uploaded = await uploadImageDataUrl(newCatImage, "kifayatly_products");
        uploadedCategoryImage = uploaded.url;
        uploadedCategoryImagePublicId = uploaded.publicId;
      }

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          image: uploadedCategoryImage,
          imagePublicId: uploadedCategoryImagePublicId,
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

  const toggleCategory = (catName) => {
    setCategories((prev) =>
      prev.includes(catName)
        ? prev.filter((c) => c !== catName)
        : [...prev, catName],
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

  const showToast = (message, type = "success") => {
    if (type === "error") toast.error(message);
    else toast.success(message);
  };

  const clearForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategories([]);
    setStockQuantity("");
    setImages([]);
    setIsLive(false);
  };

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

    const primaryImage = finalImages.length > 0 ? finalImages[0].url : "";

    const payload = {
      Name,
      Description,
      Price: Number(Price),
      ImageURL: primaryImage, // backwards compat
      Images: finalImages,
      Category: Categories,
      stockQuantity: Number(stockQuantity) || 0,
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
        showToast("Product saved! Toggle it Live when ready.", "success");
        clearForm();
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
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">
          Add New Product
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">
          Create a new product. Toggle it Live when ready to publish.
        </p>
      </div>

      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={Name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
              placeholder="e.g., Luxury Tea Set"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price (Rs)
            </label>
            <input
              type="number"
              value={Price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          {/* Category - Multi-select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Categories
              </label>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <PlusCircle className="size-3.5" /> Manage Categories
              </button>
            </div>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[52px]">
              {allCategories.length === 0 ? (
                <p className="text-xs text-gray-400 self-center">
                  No categories yet. Click "Manage Categories" to add one.
                </p>
              ) : (
                allCategories.map((cat) => {
                  const selected = Categories.includes(cat.name);
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selected ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"}`}
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
              <p className="text-xs text-orange-400 mt-1">
                Select at least one category above.
              </p>
            )}
          </div>

          {/* isLive Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Publish as Live
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isLive
                  ? "🟢 Will be visible to customers immediately"
                  : "🔴 Draft — hidden from store until toggled Live"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLive(!isLive)}
              className={`relative w-12 h-6 rounded-lg transition-colors duration-300 focus:outline-none ${isLive ? "bg-emerald-500" : "bg-gray-300"}`}
              aria-label="Toggle Live"
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-md bg-white shadow transition-transform duration-300 ${isLive ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
          </div>

          {/* Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Product Images
              </label>
              <div className="relative overflow-hidden cursor-pointer text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
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
                  className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden group bg-gray-50"
                >
                  <Image
                    src={img.url}
                    alt="Preview"
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                    {...getBlurPlaceholderProps(img.blurDataURL)}
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-red-500 shadow-md transition-colors hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${isDragOver ? "border-emerald-500 bg-emerald-50 scale-102" : "border-emerald-300 hover:border-emerald-400 hover:bg-gray-50"}`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
                  <CloudUpload className="size-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Drag & Drop Images Here
                  </p>
                  <p className="text-xs text-gray-500">
                    or click to browse multiple files
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    PNG, JPG up to 10MB each
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={Description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 resize-none"
              placeholder="Enter product description..."
              rows="4"
            ></textarea>
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
              placeholder="0"
              min="0"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6 md:mt-8">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 min-w-[140px] h-[45px] bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center hover:bg-emerald-700 shadow-sm transition-all active:scale-95 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />Saving...
                </>
              ) : (
                "Save Product"
              )}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="flex-1 min-w-[140px] h-[45px] bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center hover:bg-gray-300 shadow-sm transition-all active:scale-95"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsCategoryModalOpen(false)}
          ></div>
          <div className="relative bg-white w-[92%] sm:w-[512px] rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 md:p-6 border-b bg-gray-50/50 shrink-0">
              <h2 className="text-xl font-bold text-gray-900 truncate pr-4">
                Manage Categories
              </h2>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-gray-200 hover:text-gray-600 active:scale-90"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 md:p-8">
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50">
                  <label className="block text-sm font-bold text-emerald-900 mb-2">
                    New Category Name
                  </label>
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full sm:flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium"
                      placeholder="e.g. Health & Beauty"
                      required
                    />
                    <div className="flex items-center gap-3">
                      <label className="flex h-12 cursor-pointer items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50">
                        Category Image
                        <input type="file" accept="image/*" onChange={handleCategoryImageSelect} className="hidden" />
                      </label>
                      {newCatImage ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-emerald-100">
                          <Image
                            src={newCatImage}
                            alt="Category preview"
                            fill
                            sizes="48px"
                            className="object-cover"
                            {...getBlurPlaceholderProps()}
                            unoptimized
                          />
                        </div>
                      ) : null}
                      <button
                        type="submit"
                        disabled={isAddingCat}
                        className="w-full sm:w-auto bg-[#0EB981] text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-[#0da874] shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
                      >
                        {isAddingCat ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Plus className="size-4" />
                        )}{" "}
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              <div className="mt-8">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Current Catalog Categories
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {allCategories.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Layers3 className="mx-auto mb-2 size-8 text-gray-200" />
                      <p className="text-sm text-gray-400">
                        No categories found.
                      </p>
                    </div>
                  ) : (
                    allCategories.map((cat) => (
                      <div
                        key={cat._id}
                        className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-all group overflow-hidden"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3 pr-4">
                          {cat.image ? (
                            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-100">
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                                {...getBlurPlaceholderProps()}
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                              {cat.name?.charAt(0) || "?"}
                            </div>
                          )}
                          <span className="text-sm font-semibold text-gray-700 break-words min-w-0 flex-1 leading-tight">
                            {cat.name}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Check className="size-3.5" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6 bg-gray-50 border-t flex justify-center shrink-0">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-full sm:w-auto px-12 py-3.5 bg-black text-white text-sm font-black rounded-xl hover:bg-gray-900 transition-all shadow-xl active:scale-95"
              >
                DONE & CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
