'use client';
import { useState, useCallback, useEffect } from 'react';

import Toast from '@/components/Toast';

export default function AddProduct() {
  const [Name, setName] = useState('');
  const [Description, setDescription] = useState('');
  const [Price, setPrice] = useState('');
  const [Category, setCategory] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [ImageURL, setImageURL] = useState('');
  const [cloudinaryId, setCloudinaryId] = useState('');

  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);

  // Fetch categories on mount
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
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
    } catch (err) {
      showToast('Error adding category', 'error');
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target.result;
          setImagePreview(url);
          setImageURL(url);
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target.result;
        setImagePreview(url);
        setImageURL(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const clearForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setStockQuantity('');
    setImageURL('');
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const category = formData.get('category');
    const stockQuantity = formData.get('stockQuantity') || '0';

    if (!name || !price || !category) {
      showToast('Name, Price and Category are required.', 'error');
      return;
    }

    let finalImageURL = ImageURL;
    let finalCloudinaryId = cloudinaryId;

    // If we have an image preview (selected file) but no uploaded URL yet, or we want to re-upload
    // Note: In the current logic, imagePreview holds the base64. 
    // We only upload if it's a base64 string (starts with data:)
    if (ImageURL && ImageURL.startsWith('data:')) {
      try {
        console.log('[UPLOAD] Getting upload signature...');
        const signRes = await fetch('/api/cloudinary-sign');
        const signData = await signRes.json();
        
        if (!signRes.ok) throw new Error(signData.error || 'Failed to get signature');

        const { signature, timestamp, cloudName, apiKey } = signData;

        console.log('[UPLOAD] Uploading directly to Cloudinary to bypass Vercel limits...');
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
          console.log('[UPLOAD] Success:', finalImageURL);
        } else {
          showToast('Image upload failed: ' + (uploadData.error?.message || 'Upload error'), 'error');
          return;
        }
      } catch (err) {
        console.error('Upload error:', err);
        showToast('Error uploading image: ' + err.message, 'error');
        return;
      }
    }

    const payload = {
      Name: name,
      Description: description,
      Price: Number(price),
      ImageURL: finalImageURL,
      cloudinary_id: finalCloudinaryId,
      Category: category,
      stockQuantity: Number(stockQuantity) || 0,
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Product published successfully!', 'success');
        clearForm();
      } else {
        showToast(data.message || data.error || 'Failed to save product', 'error');
      }
    } catch (err) {
      console.error('Network error:', err);
      showToast('Network error while saving product.', 'error');
    }
  };

  return (
    <div className="w-full pb-10">
      {/* Toast Component */}
      <Toast 
        isVisible={toast.visible} 
        message={toast.message} 
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />

      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">Add New Product</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Create and publish a new product to your store.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              name="name"
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
              name="price"
              value={Price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <button 
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <i className="fa-solid fa-plus-circle"></i> Manage Categories
              </button>
            </div>
            <select
              name="category"
              value={Category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Image Upload - Drag & Drop */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
                ${isDragOver
                  ? 'border-emerald-500 bg-emerald-50 scale-105'
                  : 'border-emerald-300 hover:border-emerald-400 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full max-h-32 mx-auto rounded-lg object-contain border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
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
              name="description"
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
              name="stockQuantity"
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
              className="flex-1 min-w-[140px] h-[45px] bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center hover:bg-emerald-700 shadow-sm transition-all active:scale-95"
            >
              Publish Product
            </button>
            <button
              type="reset"
              className="flex-1 min-w-[140px] h-[45px] bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center hover:bg-gray-300 shadow-sm transition-all active:scale-95"
              onClick={() => setImagePreview(null)}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)}></div>
          <div className="relative bg-white w-[92%] sm:w-[512px] rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[85vh] flex flex-col overflow-hidden shrink-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b bg-gray-50/50 shrink-0">
              <h2 className="text-xl font-bold text-gray-900 truncate pr-4">Manage Categories</h2>
              <button 
                type="button"
                onClick={() => setIsCategoryModalOpen(false)} 
                className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all active:scale-90"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar scroll-smooth">
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50">
                  <label className="block text-sm font-bold text-emerald-900 mb-2">New Category Name</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full sm:flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                      placeholder="e.g. Health & Beauty"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isAddingCat}
                      className="w-full sm:w-auto bg-[#0EB981] text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-[#0da874] shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0 h-[48px] sm:h-auto active:scale-95"
                    >
                      {isAddingCat ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-plus"></i>}
                      Add
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-8">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Current Catalog Categories</h3>
                <div className="grid grid-cols-1 gap-2">
                  {categories.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                       <i className="fa-solid fa-layer-group text-3xl text-gray-200 mb-2 block"></i>
                       <p className="text-sm text-gray-400">No categories found.</p>
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <div key={cat._id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-all group overflow-hidden">
                        <span className="text-sm font-semibold text-gray-700 break-words pr-4 min-w-0 flex-1 leading-tight">{cat.name}</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                           <i className="fa-solid fa-check text-xs"></i>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
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
