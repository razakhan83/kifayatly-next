'use client';

export default function ProductSkeleton() {
    return (
        <div className="product-card bg-white rounded-xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex flex-col w-full h-full">
            {/* Image Skeleton */}
            <div className="relative pt-[100%] bg-gray-200 animate-pulse w-full"></div>

            <div className="p-3 flex flex-col flex-grow justify-between gap-3">
                <div className="space-y-2">
                    {/* Title Skeleton */}
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>

                {/* Price Skeleton */}
                <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2"></div>

                {/* Button Skeleton */}
                <div className="h-10 md:h-12 bg-gray-200 rounded-lg animate-pulse w-full mt-auto"></div>
            </div>
        </div>
    );
}
