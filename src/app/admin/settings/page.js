'use client';

import { useState, useEffect } from 'react';

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [form, setForm] = useState({
        storeName: '',
        supportEmail: '',
        businessAddress: '',
        whatsappNumber: '',
        karachiDeliveryFee: 0,
        outsideKarachiDeliveryFee: 0,
        freeShippingThreshold: 5000,
        announcementBarEnabled: true,
        announcementBarText: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success && data.data) {
                setForm({
                    storeName: data.data.storeName || '',
                    supportEmail: data.data.supportEmail || '',
                    businessAddress: data.data.businessAddress || '',
                    whatsappNumber: data.data.whatsappNumber || '',
                    karachiDeliveryFee: data.data.karachiDeliveryFee || 0,
                    outsideKarachiDeliveryFee: data.data.outsideKarachiDeliveryFee || 0,
                    freeShippingThreshold: data.data.freeShippingThreshold || 0,
                    announcementBarEnabled: data.data.announcementBarEnabled ?? true,
                    announcementBarText: data.data.announcementBarText || '',
                });
            }
        } catch (err) {
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                alert(data.message || 'Failed to save settings.');
            }
        } catch (err) {
            console.error('Save failed:', err);
            alert('Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            {/* Page Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Store Settings</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Configure your store details, shipping, and notifications.
                </p>
            </div>

            <div className="space-y-6">
                {/* ─── General Info ─── */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <i className="fa-solid fa-store text-emerald-600 text-sm"></i>
                        </div>
                        <h3 className="text-base font-bold text-gray-900">General Information</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
                            <input
                                type="text"
                                value={form.storeName}
                                onChange={e => handleChange('storeName', e.target.value)}
                                placeholder="China Unique Store"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Support Email</label>
                            <input
                                type="email"
                                value={form.supportEmail}
                                onChange={e => handleChange('supportEmail', e.target.value)}
                                placeholder="support@chinauniquestore.com"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Address</label>
                            <textarea
                                value={form.businessAddress}
                                onChange={e => handleChange('businessAddress', e.target.value)}
                                placeholder="Shop #12, Block A, Gulshan..."
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all resize-none"
                            />
                        </div>
                    </div>
                </section>

                {/* ─── WhatsApp Integration ─── */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                            <i className="fa-brands fa-whatsapp text-green-600 text-lg"></i>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">WhatsApp Integration</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Updates floating button & product page links</p>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+</span>
                            <input
                                type="tel"
                                value={form.whatsappNumber}
                                onChange={e => handleChange('whatsappNumber', e.target.value)}
                                placeholder="923001234567"
                                className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">Format: Country code + number without spaces (e.g. 923001234567)</p>
                    </div>
                </section>

                {/* ─── Shipping Rates ─── */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                            <i className="fa-solid fa-truck-fast text-blue-600 text-sm"></i>
                        </div>
                        <h3 className="text-base font-bold text-gray-900">Shipping Rates</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Karachi Delivery Fee</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">PKR</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.karachiDeliveryFee}
                                    onChange={e => handleChange('karachiDeliveryFee', Number(e.target.value))}
                                    className="w-full pl-14 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Outside Karachi Fee</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">PKR</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.outsideKarachiDeliveryFee}
                                    onChange={e => handleChange('outsideKarachiDeliveryFee', Number(e.target.value))}
                                    className="w-full pl-14 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Free Shipping Threshold</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">PKR</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.freeShippingThreshold}
                                    onChange={e => handleChange('freeShippingThreshold', Number(e.target.value))}
                                    className="w-full pl-14 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">Orders above this amount get free delivery. Set 0 to disable.</p>
                        </div>
                    </div>
                </section>

                {/* ─── Announcement Bar ─── */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
                    <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                            <i className="fa-solid fa-bullhorn text-amber-600 text-sm"></i>
                        </div>
                        <h3 className="text-base font-bold text-gray-900">Announcement Bar</h3>
                    </div>
                    <div className="space-y-4">
                        {/* Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Show Top Banner</p>
                                <p className="text-xs text-gray-400 mt-0.5">Display scrolling announcement across the site</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleChange('announcementBarEnabled', !form.announcementBarEnabled)}
                                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.announcementBarEnabled ? 'bg-[#0EB981]' : 'bg-gray-300'}`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${form.announcementBarEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                        {/* Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner Message</label>
                            <input
                                type="text"
                                value={form.announcementBarText}
                                onChange={e => handleChange('announcementBarText', e.target.value)}
                                placeholder="🔥 Ramadan Sale 20% Off! Free Delivery on orders above Rs. 3000!"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* ─── Save Button ─── */}
                <div className="flex items-center gap-4 pt-2 pb-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 bg-[#0EB981] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-[#0da874] active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <i className="fa-solid fa-spinner animate-spin text-xs"></i>
                                Saving...
                            </>
                        ) : saved ? (
                            <>
                                <i className="fa-solid fa-check text-xs"></i>
                                Saved!
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-floppy-disk text-xs"></i>
                                Save Changes
                            </>
                        )}
                    </button>
                    {saved && (
                        <span className="text-sm text-emerald-600 font-medium animate-[fadeIn_0.3s_ease-out]">
                            Settings updated successfully.
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
