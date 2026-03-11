import HeroSlider from '@/components/HeroSlider';
import ProductGridClient from '@/components/ProductGridClient';
import { getProducts } from '@/lib/data';
import { Suspense } from 'react';
import ProductSkeleton from '@/components/ProductSkeleton';

export default function Home() {
  const heroSlides = [
    { src: '/hero1.webp', alt: 'Kitchen Promotion 1' },
    { src: '/hero2.webp', alt: 'Kitchen Promotion 2' },
    { src: '/hero3.webp', alt: 'Home Decor Promotion 3' },
    { src: '/hero4.webp', alt: 'Home Decor Promotion 4' },
  ];

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        </div>
      }>
        <ProductList />
      </Suspense>
    </>
  );
}

async function ProductList() {
  const products = await getProducts();
  return <ProductGridClient initialProducts={products} />;
}
