'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Elegant Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin animation-delay-150"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">Loading...</p>
          <p className="text-sm text-gray-500">Please wait</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}