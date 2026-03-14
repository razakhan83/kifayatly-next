'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EditProduct({ id }) {
  const router = useRouter();

  const [Name, setName] = useState('');
  const [Description, setDescription] = useState('');
  const [Price, setPrice] = useState('');
  const [Categories, setCategories] = useState([]); // array
  const [stockQuantity, setStockQuantity] = useState('');
  const [images, setImages] = useState([]); // Array of { url, public_id, file, isNew }
  const [isLive, setIsLive] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const showToast = (message, type = 'success') => {
    if (type === 'error') toast.error(message);
    else toast.success(message);
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
          
          let existingImages = [];
          if (Array.isArray(p.Images) && p.Images.length > 0) {
              existingImages = p.Images.map(url => ({ url, isNew: false }));
          } else if (p.ImageURL || p.Image) {
              existingImages = [{ url: p.ImageURL || p.Image, isNew: false, public_id: p.cloudinary_id }];
          }
          setImages(existingImages);
          
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
  
  const processFiles = (filesList) => {
    const validFiles = Array.from(filesList).filter(f => f.type.startsWith('image/'));
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => [...prev, { url: ev.target.result, file, isNew: true }]);
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
      setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Name || !Price || Categories.length === 0) {
      showToast('Name, Price and at least one Category are required.', 'error');
      return;
    }

    setSaving(true);
    
    // Upload new images to Cloudinary
    const finalImages = [];
    try {
        const newImages = images.filter(img => img.isNew);
        let signData = null;
        
        if (newImages.length > 0) {
            const signRes = await fetch('/api/cloudinary-sign');
            signData = await signRes.json();
            if (!signRes.ok) throw new Error(signData.error || 'Failed to get signature');
        }

        for (const img of images) {
            if (!img.isNew) {
                finalImages.push(img.url);
            } else {
                const { signature, timestamp, cloudName, apiKey } = signData;
                const uploadFormData = new FormData();
                uploadFormData.append('file', img.url);
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
                    finalImages.push(uploadData.secure_url);
                } else {
                    throw new Error(uploadData.error?.message || 'Upload error');
                }
            }
        }
    } catch (err) {
        showToast('Error uploading images: ' + err.message, 'error');
        setSaving(false);
        return;
    }

    const primaryImage = finalImages.length > 0 ? finalImages[0] : '';

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name,
          Description,
          Price: Number(Price),
          ImageURL: primaryImage, // backward compatibility
          Images: finalImages,    // array of urls
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
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Product Images</label>
                <div className="relative overflow-hidden cursor-pointer text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                    <i className="fa-solid fa-plus-circle"></i> Add More Images
                    <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden group bg-gray-50">
                        <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                            type="button" 
                            onClick={() => removeImage(idx)} 
                            className="absolute top-2 right-2 w-7 h-7 bg-white/90 text-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                        {idx === 0 && <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">Primary</span>}
                    </div>
                ))}
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${isDragOver ? 'border-emerald-500 bg-emerald-50 scale-102' : 'border-emerald-300 hover:border-emerald-400 hover:bg-gray-50'}`}
            >
              <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-cloud-upload-alt text-xl text-emerald-600"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Drag & Drop Images Here</p>
                  <p className="text-xs text-gray-500">or click to browse multiple files</p>
                  <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
                </div>
              </div>
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsCategoryModalOpen(false)}></div>
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
