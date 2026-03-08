'use client';
import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');



    const [formData, setFormData] = useState({
        Name: '',
        Price: '',
        Category: '',
        ImageURL: '',
    });

    const isAdmin = session?.user?.email === '123raza83@gmail.com';

    useEffect(() => {
        if (status === 'authenticated' && isAdmin) {
            fetchProducts();
        } else if (status === 'unauthenticated' || (status === 'authenticated' && !isAdmin)) {
            setIsLoading(false);
        }
    }, [status, session]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/products');
            const result = await res.json();
            if (result.success) {
                setProducts(result.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    Price: Number(formData.Price),
                    StockStatus: 'In Stock'
                })
            });

            const result = await res.json();

            if (result.success) {
                setSuccessMessage('Product successfully published to store!');
                setFormData({ Name: '', Price: '', Category: '', ImageURL: '' });
                fetchProducts();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(result.message || 'Failed to add product');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'loading' || (status === 'authenticated' && isAdmin && isLoading)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 flex-1 w-full">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#10b981] rounded-full animate-spin mb-4"></div>
            </div>
        );
    }

    if (status === 'unauthenticated' || (status === 'authenticated' && !isAdmin)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] w-full px-4">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 text-center max-w-md w-full relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#10b981] to-emerald-400"></div>
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fa-solid fa-shield-halved text-4xl text-[#10b981]"></i>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Admin Login Required</h2>
                    <p className="text-gray-500 mb-8 font-medium">You need authorized credentials to access the store management dashboard.</p>

                    <button
                        onClick={() => signIn('google')}
                        className="w-full py-4 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 hover:border-[#10b981] transition-all shadow-sm"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                        Continue with Google
                    </button>

                    {status === 'authenticated' && !isAdmin && (
                        <p className="mt-6 text-sm text-red-500 font-bold bg-red-50 py-2 px-4 rounded-lg border border-red-100">
                            Current account ({session?.user?.email}) is not authorized.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100vw', minHeight: '100vh', margin: 0, padding: 0 }} className="bg-gray-50 block w-full">
            <h1 style={{ color: 'red', fontSize: '60px', backgroundColor: 'yellow', textAlign: 'center', zIndex: 9999, position: 'relative' }}>
                TEST - RAZA BHAI
            </h1>

            <div className="min-h-screen bg-gray-50 w-full"></div>
            <div className="w-full mx-auto space-y-8 px-4 md:px-8 py-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                    <h1 className="text-3xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <i className="fa-solid fa-shield-halved text-[#10b981]"></i>
                        Admin Dashboard
                    </h1>
                </div>

                {/* Card 1: Upload Product */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 w-full">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4">
                        <i className="fa-solid fa-circle-plus text-[#10b981]"></i> Upload New Product
                    </h2>

                    {error && <div className="p-4 mb-6 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold">{error}</div>}

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl font-semibold flex items-center gap-3 border border-green-200 transition-all">
                            <i className="fa-regular fa-circle-check text-xl"></i>
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700">Product Name *</label>
                                <input
                                    type="text"
                                    name="Name"
                                    value={formData.Name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all outline-none"
                                    placeholder="e.g. Premium Ceramic Vase"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700">Price (PKR) *</label>
                                <input
                                    type="number"
                                    name="Price"
                                    value={formData.Price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="1"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all outline-none"
                                    placeholder="e.g. 1500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-700">Category *</label>
                                <select
                                    name="Category"
                                    value={formData.Category}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all font-medium text-gray-700 outline-none"
                                >
                                    <option value="" disabled>Select a Category</option>
                                    <option value="Kitchen Items">Kitchen Items</option>
                                    <option value="Home Decor">Home Decor</option>
                                    <option value="Bathroom Accessories">Bathroom Accessories</option>
                                    <option value="Storage Organizers">Storage Organizers</option>
                                    <option value="Electronics">Electronics</option>
                                </select>
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700">Image URL</label>
                                <input
                                    type="url"
                                    name="ImageURL"
                                    value={formData.ImageURL}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all outline-none"
                                    placeholder="https://example.com/image.webp"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full font-bold py-4 px-4 rounded-xl text-white transition-all shadow-md flex justify-center items-center gap-2 ${isSubmitting ? 'bg-[#10b981]/70 cursor-not-allowed' : 'bg-[#10b981] hover:bg-[#0A3D2E] hover:shadow-lg'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <><i className="fa-solid fa-circle-notch fa-spin"></i> Publishing...</>
                                ) : (
                                    <><i className="fa-solid fa-cloud-arrow-up"></i> Publish Product</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Card 2: Order Management & Inventory */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 w-full">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <i className="fa-solid fa-list-check text-[#10b981]"></i> Recent Orders & Inventory
                        </h2>
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">{products.length} Products</span>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <table className="w-full min-w-[600px] text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-bold border-b border-gray-200 rounded-tl-lg">Product</th>
                                    <th className="p-4 font-bold border-b border-gray-200">Category</th>
                                    <th className="p-4 font-bold border-b border-gray-200">Price</th>
                                    <th className="p-4 font-bold border-b border-gray-200 text-right rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-500 font-medium text-lg border-b border-gray-200">
                                            No products found. Start adding inventory above!
                                        </td>
                                    </tr>
                                ) : (
                                    products.map(p => (
                                        <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-5 flex items-center gap-4">
                                                {p.Image || p.ImageURL ? (
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100">
                                                        <img src={p.Image || p.ImageURL} alt={p.Name} className="object-cover w-full h-full" />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                                                        <i className="fa-solid fa-image text-2xl"></i>
                                                    </div>
                                                )}
                                                <div className="max-w-[300px]">
                                                    <p className="text-base font-bold text-gray-900 truncate" title={p.Name}>{p.Name}</p>
                                                    <p className="text-sm text-emerald-600 font-semibold">{p.StockStatus || 'In Stock'}</p>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm font-semibold whitespace-nowrap">
                                                    {p.Category}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <p className="text-base font-extrabold text-gray-800">Rs. {p.Price?.toLocaleString('en-PK')}</p>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button className="text-gray-400 hover:text-red-600 p-2 transition-colors focus:outline-none ml-3" title="Delete Product">
                                                    <i className="fa-solid fa-trash text-lg"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
