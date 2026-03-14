import HomeClientWrapper from '@/components/HomeClientWrapper';
import { getCategories, getProducts } from '@/lib/data';

export default async function Home() {
  const heroSlides = [
    { mobileSrc: '/hero1.webp', pcSrc: '/hero1pc.webp', alt: 'Kitchen Promotion 1' },
    { mobileSrc: '/hero2.webp', pcSrc: '/hero2pc.webp', alt: 'Kitchen Promotion 2' },
    { mobileSrc: '/hero3.webp', pcSrc: '/hero3pc.webp', alt: 'Home Decor Promotion 3' },
    { mobileSrc: '/hero4.webp', pcSrc: '/hero4pc.webp', alt: 'Home Decor Promotion 4' },
  ];

  const products = await getProducts();
  const categories = await getCategories();

  return (
    <HomeClientWrapper products={products} heroSlides={heroSlides} categories={categories} />
  );
}
