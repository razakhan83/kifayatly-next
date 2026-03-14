import { BadgeCheck, PackageCheck, Star, Truck } from 'lucide-react';
import { notFound } from 'next/navigation';

import CategoryProductSlider from '@/components/CategoryProductSlider';
import ProductActions from '@/components/ProductActions';
import ProductGallery from '@/components/ProductGallery';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { getProducts } from '@/lib/data';
import { getCategoryColor } from '@/lib/categoryColors';
import { normalizeProductImages } from '@/lib/productImages';

export const dynamic = 'force-dynamic';

const formatPrice = (raw) => {
  const cleanNumbers = String(raw).replace(/[^\d.]/g, '');
  if (!cleanNumbers) return 'Rs. 0';
  return `Rs. ${Number(cleanNumbers).toLocaleString('en-PK')}`;
};

function ReviewCard({ initial, name, body, filledStars = 5 }) {
  return (
    <div className="rounded-xl border border-border bg-muted/35 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">{initial}</div>
          <span className="text-sm font-semibold text-foreground">{name}</span>
        </div>
        <div className="flex gap-0.5 text-accent-foreground">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className={`size-3.5 ${index < filledStars ? 'fill-current' : ''}`} />
          ))}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const products = await getProducts();
  const product = products.find((entry) => entry.slug === resolvedParams.id);

  if (!product) return notFound();

  const rawCategory = product.Category || product.category || '';
  const categoryLabel = Array.isArray(rawCategory) ? (rawCategory[0] || '') : rawCategory;
  const colors = getCategoryColor(categoryLabel);
  const categorySlug = String(categoryLabel)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');

  const productImages = normalizeProductImages(
    product.Images,
    product.Image || product.image || product.ImageURL || '',
  );

  return (
    <div className="min-h-screen bg-background">
      <style
        dangerouslySetInnerHTML={{
          __html: `
  a[href*='wa.me'].fixed { display: none !important; pointer-events: none !important; }
  .whatsapp-float { display: none !important; opacity: 0 !important; pointer-events: none !important; }
`,
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 pb-2 pt-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.Name || product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="container mx-auto max-w-7xl px-4 pb-20 pt-4 md:pb-8 md:py-8">
        <div className="flex flex-col gap-6 md:flex-row md:gap-10 lg:gap-14">
          <div className="w-full md:w-[55%] lg:w-[58%]">
            <ProductGallery images={productImages} />
          </div>

          <div className="w-full md:w-[45%] lg:w-[42%]">
            <div className="flex flex-col gap-5 md:sticky md:top-28">
              <div>
                <Badge variant="outline" className={`${colors.badge} text-xs font-bold uppercase tracking-wider`}>
                  {categoryLabel || 'Premium Item'}
                </Badge>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl lg:text-4xl">
                {product.Name || product.name}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-primary md:text-4xl">
                  {formatPrice(product.Price || product.price)}
                </span>
              </div>

              <Separator />

              <div className="text-[15px] leading-relaxed text-muted-foreground">
                <p>
                  {product.Description || product.description || 'Discover the perfect addition to your collection. This premium item from China Unique Store is crafted with quality and elegance in mind, designed to elevate your everyday lifestyle.'}
                </p>
              </div>

              <Separator />
              <ProductActions product={product} />

              <div className="mt-2 border-t border-border pt-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="surface-card flex flex-col items-center gap-2 rounded-xl p-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <PackageCheck className="size-4" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">Purchased</span>
                  </div>
                  <div className="surface-card flex flex-col items-center gap-2 rounded-xl p-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Truck className="size-4" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">Dispatch</span>
                  </div>
                  <div className="surface-card flex flex-col items-center gap-2 rounded-xl p-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BadgeCheck className="size-4" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mb-4 mt-12 max-w-7xl px-4">
        <div className="surface-card rounded-xl p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mb-1 text-xl font-bold text-foreground md:text-2xl">Customer Reviews</h2>
              <div className="flex items-center gap-2">
                <div className="flex text-accent-foreground">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">4.8/5</span>
                <span className="text-sm text-muted-foreground">based on 12 reviews</span>
              </div>
            </div>
            <Button variant="outline" className="max-w-max">Write a Review</Button>
          </div>

          <div className="grid gap-4">
            <ReviewCard
              initial="A"
              name="Ahmed K."
              body="Excellent quality! The product arrived in perfect condition. Very happy with my purchase. Will definitely order again."
            />
            <ReviewCard
              initial="S"
              name="Sara M."
              body="Great value for money. Fast delivery and the item looks exactly like the picture. Highly recommended!"
            />
            <ReviewCard
              initial="R"
              name="Raza B."
              body="Good product overall. Packaging was neat and delivery was on time. Would love to see more color options."
              filledStars={4}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-muted/35 py-10 md:py-14">
        <div className="container mx-auto max-w-7xl px-4">
          <CategoryProductSlider
            categoryId={categorySlug}
            categoryLabel="You May Also Like"
            products={products.filter((entry) => entry.slug !== product.slug)}
          />
        </div>
      </div>
    </div>
  );
}
