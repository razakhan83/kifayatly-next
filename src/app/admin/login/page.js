"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleManualLogin = async (e) => {
        e.preventDefault();
        const res = await signIn("credentials", {
            email, password,
            callbackUrl: "/admin",
            redirect: true
        });
        if (res?.error) setError("Ghalat Email ya Password!");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            {/* Back to Store Button */}
            <a 
                href="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <i className="fa-solid fa-arrow-left text-lg"></i>
                <span className="text-sm font-semibold hidden sm:inline">Back to Store</span>
            </a>

            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-[400px] border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-user-shield text-3xl text-emerald-600"></i>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Admin Login</h2>
                </div>

                <form onSubmit={handleManualLogin} className="space-y-4">
                    <input type="email" placeholder="Email" required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-black" onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-black" onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" className="w-full min-w-[140px] h-[45px] bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center hover:bg-emerald-700 shadow-sm transition-all active:scale-95">
                        Login Manually
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">OR</span></div>
                </div>

                <button onClick={() => signIn('google', { callbackUrl: '/admin' })} className="w-full min-w-[140px] h-[45px] bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center gap-3 font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all active:scale-95">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
                    Continue with Google
                </button>
                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            </div>
        </div>
        
    );
}

