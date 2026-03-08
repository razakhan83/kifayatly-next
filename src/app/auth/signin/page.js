'use client';

import { signIn } from 'next-auth/react';

export default function SignInPage() {
    return (
        <section className="min-h-screen w-full flex items-center justify-center bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10 flex flex-col items-center transform transition-all hover:scale-[1.01] duration-300">

                {/* Animated Logo Container */}
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#10b981]/10 mb-6 shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#10b981]/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
                    <i className="fa-solid fa-store text-3xl text-[#10b981] relative z-10 animate-bounce"></i>
                </div>

                {/* Header Texts */}
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center tracking-tight">
                    Admin Access
                </h2>
                <p className="text-base text-gray-500 font-medium mb-8 text-center max-w-xs">
                    Secure login for China Unique Store management
                </p>

                {/* Continue with Google Button */}
                <button
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="group w-full flex items-center justify-center gap-4 py-4 px-6 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-bold text-gray-700 text-lg shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10b981]"
                >
                    <svg className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                {/* Footer Security Note */}
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                    <i className="fa-solid fa-lock text-[#10b981]"></i>
                    <span>Authorized Personnel Only</span>
                </div>
            </div>
        </section>
    );
}
