export const dynamic = 'force-dynamic';
import HeroSlider from '@/components/HeroSlider';
import ProductGridClient from '@/components/ProductGridClient';

export default async function Home() {
  let products = [];
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products`, {
      next: { revalidate: 60 }
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        products = json.data;
      }
    }
  } catch (error) {
    console.error('Home page fetch error:', error);
  }

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
