'use client';
import { useState, useCallback } from 'react';

export default function AddProduct() {
  const [Name, setName] = useState('');
  const [Description, setDescription] = useState('');
  const [Price, setPrice] = useState('');
  const [Category, setCategory] = useState('');
  const [StockStatus, setStockStatus] = useState('In Stock');
  const [ImageURL, setImageURL] = useState('');

  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  const clearForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setStockStatus('In Stock');
    setImageURL('');
    setImagePreview(null);
    // Also reset the form element
    document.querySelector('form').reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const formData = new FormData(e.target);

    // Get values from formData
    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const category = formData.get('category');
    const stockStatus = formData.get('stockStatus') || 'In Stock';

    console.log('FormData captured:', { name, description, price, category, stockStatus, imageURL: ImageURL });

    // Basic validation
    if (!name || !price || !category) {
      setError('Name, Price and Category are required.');
      return;
    }

    // Prepare JSON payload (since API expects JSON)
    const payload = {
      Name: name,
      Description: description,
      Price: Number(price),
      ImageURL: ImageURL, // From drag & drop
      Category: category,
      StockStatus: stockStatus
    };

    console.log('Sending POST request to /api/products with payload:', payload);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok && data.success) {
        alert('Product saved successfully!');
        setMessage('Product published successfully!');
        clearForm();
      } else {
        setError(data.message || data.error || 'Failed to save product');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error');
    }
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900">Add New Product</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Create and publish a new product to your store.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}
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

          {/* Stock Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Status</label>
            <select
              name="stockStatus"
              value={StockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
              required
            >
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
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
