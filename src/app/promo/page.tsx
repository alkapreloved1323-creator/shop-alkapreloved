import Link from "next/link";
import { ArrowRight, Clock3, Tag } from "lucide-react";
import { KauppaFooter, KauppaNavbar, KauppaProductCard, type Product } from "@/components/storefront";

const saleProducts: Product[] = [
  { name: "Everyday Leather Tote", slug: "everyday-leather-tote", category: "Accessories", price: "Rp 320.000", priceValue: 320000, condition: "Good", size: "One size", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=85", badge: "20% off", rating: 4.2, reviews: 104 },
  { name: "Soft Tailored Trousers", slug: "soft-tailored-trousers", category: "Bottoms", price: "Rp 240.000", priceValue: 240000, condition: "Like new", size: "S", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=85", badge: "15% off", rating: 4.8, reviews: 502 },
  { name: "Silk Midi Dress", slug: "silk-midi-dress", category: "Dresses", price: "Rp 290.000", priceValue: 290000, condition: "Like new", size: "M", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85", badge: "25% off", rating: 4.3, reviews: 175 },
  { name: "Classic Canvas Sneakers", slug: "classic-canvas-sneakers", category: "Footwear", price: "Rp 195.000", priceValue: 195000, condition: "Very good", size: "39", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85", badge: "10% off", rating: 4.7, reviews: 344 },
];

export const metadata = { title: "Promo — AlkaPreloved", description: "Discover limited-time offers on curated preloved pieces." };

export default function PromoPage() {
  return (
    <main className="promo-page">
      <KauppaNavbar />
      <section className="promo-hero">
        <div className="kauppa-container promo-hero-inner">
          <div className="promo-hero-copy">
            <p className="eyebrow">Limited-time offers</p>
            <h1>Good pieces.<br /><em>Better prices.</em></h1>
            <p>Make room for something considered. Enjoy special prices on selected preloved finds, available while stocks last.</p>
            <Link href="#promo-picks" className="button button-dark">Shop the offers <ArrowRight size={15} /></Link>
          </div>
          <div className="promo-hero-art" aria-hidden="true"><span className="promo-art-circle promo-art-circle-one" /><span className="promo-art-circle promo-art-circle-two" /><div className="promo-sticker"><Tag size={17} /><span>Up to<br /><strong>25% off</strong></span></div><span className="promo-art-word">PRELOVED</span></div>
        </div>
      </section>
      <section className="promo-perks"><div className="kauppa-container promo-perks-grid"><div><Tag size={18} /><span><strong>Selected markdowns</strong>On pieces we love</span></div><div><Clock3 size={18} /><span><strong>While stocks last</strong>Small batches, one-of-a-kind finds</span></div><div><ArrowRight size={18} /><span><strong>Easy everyday style</strong>Quality pieces, less spend</span></div></div></section>
      <section className="kauppa-section promo-picks" id="promo-picks"><div className="kauppa-container"><div className="kauppa-section-header"><div><p className="eyebrow">The edit</p><h2 className="kauppa-section-title">Offers worth keeping</h2></div><Link href="/shop" className="kauppa-view-all-btn">View all <ArrowRight size={14} /></Link></div><div className="kauppa-product-grid promo-product-grid">{saleProducts.map((product) => <KauppaProductCard key={product.slug} product={product} />)}</div></div></section>
      <section className="promo-note"><div className="kauppa-container"><p className="eyebrow">A little reminder</p><h2>Buy less.<br /><em>Choose well.</em></h2><p>Promo prices are already reflected in the collection. Every piece is inspected, photographed, and ready for its next chapter.</p><Link href="/shop" className="text-link">Explore the full collection <ArrowRight size={14} /></Link></div></section>
      <KauppaFooter />
    </main>
  );
}
