import { parse } from 'papaparse';
import HeroSlider from '@/components/HeroSlider';
import ProductGridClient from '@/components/ProductGridClient';

// Server-side fetching
async function getProducts() {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQocF9BvexghWp_6R6KJCbfC_IhO1GpvzLBxEVimIXZ3gyh6vGRbxMI6EzbUV9_fEZMjVn7Z2B-XMdF/pub?output=csv';

  try {
    const res = await fetch(csvUrl, { next: { revalidate: 60 } }); // Cache and revalidate every 60s
    if (!res.ok) throw new Error('Failed to fetch CSV');
    const csvText = await res.text();

    // Parse using papaparse synchronously on server
    const parsed = parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    return parsed.data;
  } catch (err) {
    console.error('Error fetching/parsing CSV:', err);
    return [];
  }
}

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
