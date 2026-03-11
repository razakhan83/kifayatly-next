import HeroSlider from '@/components/HeroSlider';
import ProductGridClient from '@/components/ProductGridClient';
import { getProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getProducts();

  // Hero slides derived from old assets exactly as initially coded 
  const heroSlides = [
    { src: '/hero1.webp', alt: 'Kitchen Promotion 1' },
    { src: '/hero2.webp', alt: 'Kitchen Promotion 2' },
    { src: '/hero3.webp', alt: 'Home Decor Promotion 3' },
    { src: '/hero4.webp', alt: 'Home Decor Promotion 4' },
  ];

  return (
    <>
      <HeroSlider slides={heroSlides} />
      <ProductGridClient initialProducts={products} />
    </>
  );
}
