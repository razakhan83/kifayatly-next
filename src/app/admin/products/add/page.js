'use client';
import { useState, useCallback } from 'react';

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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={Category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
              required
            >
              <option value="">Select a category</option>
              <option>Kitchenware</option>
              <option>Home Decor</option>
              <option>Electronics</option>
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
    </div>
  );
}
