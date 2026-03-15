"use client";

import { useEffect, useRef, useState } from "react";
import {
  GripVertical,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, category: null });
  const [deleting, setDeleting] = useState(false);

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragNode = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setCategories(
          data.data.map((c) => ({
            _id: c._id,
            name: c.name,
            slug: c.slug,
            image: c.image,
            sortOrder: c.sortOrder ?? 0,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSortOrderChange(id, value) {
    setCategories((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, sortOrder: parseInt(value, 10) || 0 } : c
      )
    );
  }

  // --- Drag-and-Drop handlers ---
  function handleDragStart(e, index) {
    setDragIndex(index);
    dragNode.current = e.target;
    // Make the drag ghost semi-transparent
    e.dataTransfer.effectAllowed = "move";
    // Small delay so the dragged element doesn't flash
    setTimeout(() => {
      if (dragNode.current) dragNode.current.style.opacity = "0.4";
    }, 0);
  }

  function handleDragEnter(e, index) {
    e.preventDefault();
    if (index !== dragIndex) {
      setDragOverIndex(index);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e, dropIndex) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;

    setCategories((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, moved);
      // Reassign sortOrder based on new position
      return updated.map((cat, i) => ({ ...cat, sortOrder: i }));
    });

    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    if (dragNode.current) dragNode.current.style.opacity = "1";
    setDragIndex(null);
    setDragOverIndex(null);
    dragNode.current = null;
  }

  async function handleSaveOrder() {
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: categories.map((c) => ({
            _id: c._id,
            sortOrder: c.sortOrder,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category order saved — Home Page will reflect this order");
        // Use server-returned data directly to avoid cache staleness
        if (data.data) {
          setCategories(
            data.data.map((c) => ({
              _id: c._id,
              name: c.name,
              slug: c.slug,
              image: c.image,
              sortOrder: c.sortOrder ?? 0,
            }))
          );
        } else {
          fetchCategories();
        }
      } else {
        toast.error(data.error || "Failed to update order");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Category "${newName.trim()}" created`);
        setNewName("");
        fetchCategories();
      } else {
        toast.error(data.error || "Failed to create category");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal.category) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/categories?id=${deleteModal.category._id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(`Category "${deleteModal.category.name}" deleted`);
        setCategories((prev) =>
          prev.filter((c) => c._id !== deleteModal.category._id)
        );
        setDeleteModal({ open: false, category: null });
      } else {
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-3xl pb-24 md:pb-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Categories
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag to reorder or use numeric inputs. Lower numbers appear first on the Home Page.
        </p>
      </div>

      {/* Add Category */}
      <form
        onSubmit={handleAddCategory}
        className="surface-card mb-6 flex gap-3 rounded-xl p-4"
      >
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1"
        />
        <Button type="submit" disabled={adding || !newName.trim()}>
          {adding ? (
            <Loader2 className="animate-spin" data-icon="inline-start" />
          ) : (
            <Plus data-icon="inline-start" />
          )}
          Add
        </Button>
      </form>

      {/* Category List */}
      <div className="space-y-2">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="surface-card h-16 animate-pulse rounded-xl"
            />
          ))
        ) : categories.length === 0 ? (
          <div className="surface-card rounded-xl p-10 text-center">
            <p className="font-medium text-muted-foreground">
              No categories yet. Add one above.
            </p>
          </div>
        ) : (
          categories.map((cat, index) => (
            <div
              key={cat._id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`surface-card flex items-center gap-4 rounded-xl p-4 transition-all duration-200 ${
                dragOverIndex === index && dragIndex !== index
                  ? "ring-2 ring-primary/40 scale-[1.01]"
                  : ""
              } ${dragIndex === index ? "opacity-50" : ""}`}
            >
              <GripVertical className="size-5 shrink-0 cursor-grab text-muted-foreground/40 active:cursor-grabbing" />
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageIcon className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {cat.name}
                </p>
                <p className="text-xs text-muted-foreground">{cat.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Order
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={cat.sortOrder}
                    onChange={(e) =>
                      handleSortOrderChange(cat._id, e.target.value)
                    }
                    className="w-20 text-center"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() =>
                    setDeleteModal({ open: true, category: cat })
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Save Order Button */}
      {categories.length > 0 && (
        <div className="mt-6 flex items-center gap-4">
          <Button onClick={handleSaveOrder} disabled={saving}>
            {saving ? (
              <Loader2 className="animate-spin" data-icon="inline-start" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            {saving ? "Saving..." : "Save Order"}
          </Button>
          <span className="text-xs text-muted-foreground">
            Changes apply to the Home Page after saving.
          </span>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteModal.open}
        onOpenChange={(open) =>
          setDeleteModal((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold text-foreground">
                {deleteModal.category?.name}
              </span>
              . Products in this category will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteModal({ open: false, category: null })
                }
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Category"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
