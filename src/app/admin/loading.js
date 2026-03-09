'use client';

export default function AdminLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Premium Pulse Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin animation-delay-150"></div>
          <div className="absolute inset-4 w-8 h-8 border-4 border-transparent border-t-emerald-300 rounded-full animate-spin animation-delay-300"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Admin Panel</h3>
          <p className="text-sm text-gray-600 animate-pulse">Please wait...</p>
        </div>

        {/* Progress Indicator */}
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}