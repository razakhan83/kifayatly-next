import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductSkeleton() {
    return (
        <Card className="rounded-xl overflow-hidden flex flex-col h-full animate-pulse border-0 shadow-sm ring-0">
            {/* Image skeleton */}
            <div className="relative pt-[100%] bg-gray-100">
                <Skeleton className="absolute inset-0 rounded-none" />
                <Skeleton className="absolute top-2 left-2 h-5 w-16 rounded-full" />
            </div>
            <CardContent className="p-3 flex flex-col flex-grow justify-between gap-2">
                {/* Title */}
                <div>
                    <Skeleton className="h-4 w-full mb-1.5" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                {/* Price */}
                <div>
                    <Skeleton className="h-6 w-24 mb-2" />
                    {/* Button */}
                    <Skeleton className="h-[44px] md:h-[48px] w-full rounded-md" />
                </div>
            </CardContent>
        </Card>
    );
}
