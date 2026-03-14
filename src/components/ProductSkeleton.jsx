import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductSkeleton() {
    return (
        <Card className="bg-white min-h-[380px] w-full rounded-2xl overflow-hidden flex flex-col justify-between animate-pulse border-0 shadow-[0_4px_12px_rgba(0,0,0,0.03)] ring-0">
            {/* Image skeleton */}
            <div className="relative aspect-square bg-gray-100 shrink-0">
                <Skeleton className="absolute inset-0 rounded-none bg-gray-200/50" />
                <Skeleton className="absolute top-2 left-2 h-5 w-16 rounded-full bg-gray-300/50" />
            </div>
            <CardContent className="p-4 flex flex-col flex-grow justify-between relative">
                {/* Title */}
                <div>
                    <Skeleton className="h-4 w-full mb-1.5" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                {/* Price */}
                <div className="mt-4 mb-[2px]">
                    <Skeleton className="h-6 w-24 mb-3 bg-gray-200/50" />
                    {/* Button */}
                    <Skeleton className="h-[40px] w-full rounded-xl bg-gray-200/50" />
                </div>
            </CardContent>
        </Card>
    );
}
