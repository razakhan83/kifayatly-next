import ProductSkeleton from '@/components/ProductSkeleton';

export default function Loading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {[...Array(8)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}