'use client';
import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Toast from '@/components/Toast';
import Link from 'next/link';

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();

  const [Name, setName] = useState('');
  const [Description, setDescription] = useState('');
  const [Price, setPrice] = useState('');
  const [Categories, setCategories] = useState([]); // array
  const [stockQuantity, setStockQuantity] = useState('');
  const [ImageURL, setImageURL] = useState('');
  const [cloudinaryId, setCloudinaryId] = useState('');
  const [isLive, setIsLive] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setAllCategories(data.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success) {
          const p = data.data;
          setName(p.Name || '');
          setDescription(p.Description || '');
          setPrice(p.Price || '');
          setCategories(Array.isArray(p.Category) ? p.Category : (p.Category ? [p.Category] : []));
          setStockQuantity(p.stockQuantity ?? '');
          setImageURL(p.ImageURL || p.Image || '');
          setImagePreview(p.ImageURL || p.Image || null);
          setCloudinaryId(p.cloudinary_id || '');
          setIsLive(p.isLive ?? false);
        } else {
          showToast('Product not found', 'error');
        }
      } catch (err) {
        showToast('Error loading product', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    fetchCategories();
  }, [id, fetchCategories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsAddingCat(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category added!', 'success');
        setNewCatName('');
        setIsCategoryModalOpen(false);
        fetchCategories();
      } else {
        showToast(data.error || 'Failed to add category', 'error');
      }
    } catch {
      showToast('Error adding category', 'error');
    } finally {
      setIsAddingCat(false);
    }
  };

  const toggleCategory = (catName) => {
    setCategories(prev =>
      prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
    );
  };

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragOver(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => { setImagePreview(ev.target.result); setImageURL(ev.target.result); };
      reader.readAsDataURL(files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => { setImagePreview(ev.target.result); setImageURL(ev.target.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Name || !Price || Categories.length === 0) {
      showToast('Name, Price and at least one Category are required.', 'error');
      return;
    }

    setSaving(true);
    let finalImageURL = ImageURL;
    let finalCloudinaryId = cloudinaryId;

    // Upload to Cloudinary if base64
    if (ImageURL && ImageURL.startsWith('data:')) {
      try {
        const signRes = await fetch('/api/cloudinary-sign');
        const signData = await signRes.json();
        if (!signRes.ok) throw new Error(signData.error || 'Failed to get signature');

        const { signature, timestamp, cloudName, apiKey } = signData;
        const uploadFormData = new FormData();
        uploadFormData.append('file', ImageURL);
        uploadFormData.append('api_key', apiKey);
        uploadFormData.append('timestamp', timestamp);
        uploadFormData.append('signature', signature);
        uploadFormData.append('folder', 'kifayatly_products');

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: uploadFormData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.secure_url) {
          finalImageURL = uploadData.secure_url;
          finalCloudinaryId = uploadData.public_id;
        } else {
          showToast('Image upload failed: ' + (uploadData.error?.message || 'Upload error'), 'error');
          setSaving(false);
          return;
        }
      } catch (err) {
        showToast('Error uploading image: ' + err.message, 'error');
        setSaving(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name,
          Description,
          Price: Number(Price),
          ImageURL: finalImageURL,
          cloudinary_id: finalCloudinaryId,
          Category: Categories,
          stockQuantity: Number(stockQuantity) || 0,
          isLive,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Product updated successfully!', 'success');
        setTimeout(() => router.push('/admin/products'), 1500);
      } else {
        showToast(data.message || data.error || 'Failed to update product', 'error');
      }
    } catch (err) {
      showToast('Network error while saving product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full pb-10 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl text-emerald-500 mb-4 block"></i>
          <p className="text-gray-500 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-10">
      <Toast isVisible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />

      {/* Page Header */}
      <div className="mb-6 md:mb-8 flex items-center gap-4">
        <Link href="/admin/products" className="flex items-center justify-center w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
          <i className="fa-solid fa-arrow-left text-gray-600"></i>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-1">Update product details.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (Rs)</label>
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
              <label className="block text-sm font-semibold text-gray-700">Categories</label>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <i className="fa-solid fa-plus-circle"></i> Manage Categories
              </button>
            </div>
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[52px]">
              {allCategories.length === 0 ? (
                <p className="text-xs text-gray-400 self-center">No categories found. Add one →</p>
              ) : (
                allCategories.map((cat) => {
                  const selected = Categories.includes(cat.name);
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selected ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'}`}
                    >
                      {selected && <i className="fa-solid fa-check mr-1 text-[10px]"></i>}
                      {cat.name}
                    </button>
                  );
                })
              )}
            </div>
            {Categories.length === 0 && (
              <p className="text-xs text-red-400 mt-1">Please select at least one category.</p>
            )}
          </div>

          {/* isLive Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-700">Visibility</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isLive ? '🟢 Live — visible to customers' : '🔴 Draft — hidden from store'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLive(!isLive)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isLive ? 'bg-emerald-500' : 'bg-gray-300'}`}
              aria-label="Toggle Live"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isLive ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${isDragOver ? 'border-emerald-500 bg-emerald-50 scale-105' : 'border-emerald-300 hover:border-emerald-400 hover:bg-gray-50'}`}
            >
              <input type="file" accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="max-w-full max-h-32 mx-auto rounded-lg object-contain border border-gray-200" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageURL(''); }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
                  </div>
                  <p className="text-sm text-gray-600">Click to change image or drag a new one</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-cloud-upload-alt text-2xl text-emerald-600"></i>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700">Drag & Drop Image</p>
                    <p className="text-sm text-gray-500">or click to browse files</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
              placeholder="0"
              min="0"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6 md:mt-8">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 min-w-[140px] h-[45px] bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center hover:bg-emerald-700 shadow-sm transition-all active:scale-95 disabled:opacity-60"
            >
              {saving ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Saving...</> : 'Save Changes'}
            </button>
            <Link
              href="/admin/products"
              className="flex-1 min-w-[140px] h-[45px] bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center hover:bg-gray-300 shadow-sm transition-all active:scale-95 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)}></div>
          <div className="relative bg-white w-[92%] sm:w-[512px] rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Manage Categories</h2>
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50">
                  <label className="block text-sm font-bold text-emerald-900 mb-2">New Category Name</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full sm:flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="e.g. Health & Beauty" required />
                    <button type="submit" disabled={isAddingCat} className="w-full sm:w-auto bg-[#0EB981] text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-[#0da874] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                      {isAddingCat ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-plus"></i>} Add
                    </button>
                  </div>
                </div>
              </form>
              <div className="mt-6 grid grid-cols-1 gap-2">
                {allCategories.map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t">
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="w-full px-12 py-3 bg-black text-white text-sm font-black rounded-xl hover:bg-gray-900 transition-all">DONE & CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
