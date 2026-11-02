"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Heart, Plus, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import type { Product } from "@/components/storefront";

const priceRanges = [
  { value: "all", label: "All prices" },
  { value: "under150", label: "Under Rp150.000" },
  { value: "150to300", label: "Rp150.000 - Rp300.000" },
  { value: "over300", label: "Above Rp300.000" },
];

function CatalogCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const { isSaved, toggleItem } = useWishlist();
  const liked = isSaved(product.slug);
  return (
    <article className="catalog-reference-product">
      <div className="catalog-reference-image">
        <Link href={`/product/${product.slug}`} className="catalog-reference-image-link">
          <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw" />
        </Link>
        {product.badge && <span className="catalog-reference-tag">{product.badge}</span>}
        <button className={`catalog-reference-wishlist ${liked ? "is-liked" : ""}`} onClick={() => toggleItem(product)} aria-label={`${liked ? "Remove" : "Add"} ${product.name} ${liked ? "from" : "to"} wishlist`}>
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>
        <button className="catalog-reference-add" onClick={() => onAdd(product)} aria-label={`Add ${product.name} to cart`}><Plus size={19} /></button>
      </div>
      <div className="catalog-reference-info">
        <Link href={`/product/${product.slug}`} className="catalog-reference-name">{product.name}</Link>
        <div className="catalog-reference-price"><strong>{product.price}</strong></div>
        <div className="catalog-reference-rating"><span><Star size={12} fill="currentColor" /> {product.rating?.toFixed(1) ?? "4.8"}</span><i>·</i><span>{product.reviews ?? 0} reviews</span></div>
      </div>
    </article>
  );
}

export function CatalogClient({ products }: { products: Product[] }) {
  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(params?.get("search") ?? "");
  const [category, setCategory] = useState(params?.get("category") ?? "All Products");
  const [priceRange, setPriceRange] = useState("all");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [notice, setNotice] = useState("");
  const { addItem } = useCart();
  const perPage = 8;
  const categories = useMemo(() => ["All Products", "Men", "Women", "Fashion", "Shoes", "Bags", "Accessories", "Footwear", "Outerwear", "Vintage"], []);
  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const matchesQuery = `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All Products" || (category === "Fashion" ? ["Tops", "Bottoms", "Dresses", "Men", "Women"].includes(product.category) : product.category === category);
      const price = product.priceValue ?? 0;
      const matchesPrice = priceRange === "all" || (priceRange === "under150" && price < 150000) || (priceRange === "150to300" && price >= 150000 && price <= 300000) || (priceRange === "over300" && price > 300000);
      return matchesQuery && matchesCategory && matchesPrice;
    });
    return [...result].sort((a, b) => sort === "low" ? (a.priceValue ?? 0) - (b.priceValue ?? 0) : sort === "high" ? (b.priceValue ?? 0) - (a.priceValue ?? 0) : sort === "rating" ? (b.rating ?? 0) - (a.rating ?? 0) : (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }, [products, query, category, priceRange, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visibleProducts = filtered.slice((page - 1) * perPage, page * perPage);
  const selectCategory = (value: string) => { setCategory(value); setPage(1); };
  const clearFilters = () => { setCategory("All Products"); setPriceRange("all"); setQuery(""); setSort("featured"); setPage(1); };
  const addToCart = (product: Product) => {
    addItem({ slug: product.slug, name: product.name, price: product.price, priceValue: product.priceValue ?? 0, image: product.image, size: product.size, stock: 10 });
    setNotice(`${product.name} ditambahkan ke keranjang`);
    window.setTimeout(() => setNotice(""), 2400);
  };

  return <div className="catalog-reference-ui">
    {notice && <div className="catalog-toast" role="status">{notice}</div>}
    <div className="catalog-reference-pills">{categories.map((item) => <button key={item} onClick={() => selectCategory(item)} className={category === item ? "is-active" : ""}>{item}</button>)}</div>
    <div className="catalog-reference-layout">
      <aside className={`catalog-reference-sidebar ${mobileFilters ? "is-open" : ""}`}>
        <div className="catalog-reference-filter-head"><h2>Filters</h2><SlidersHorizontal size={17} /></div>
        <div className="catalog-reference-filter-section"><h3>Categories</h3>{categories.map((item) => <button key={item} onClick={() => selectCategory(item)} className={category === item ? "is-active" : ""}>{item}{category === item && <span />}</button>)}</div>
        <div className="catalog-reference-filter-section"><h3>Price range</h3>{priceRanges.map((item) => <label key={item.value}><input type="radio" name="price" checked={priceRange === item.value} onChange={() => { setPriceRange(item.value); setPage(1); }} />{item.label}</label>)}</div>
        <button className="catalog-reference-clear" onClick={clearFilters}>Clear all filters</button>
      </aside>
      <section className="catalog-reference-listing">
        <div className="catalog-reference-listing-head"><p><strong>{filtered.length} products</strong> available</p><div><button className="catalog-reference-mobile-filter" onClick={() => setMobileFilters(!mobileFilters)}><SlidersHorizontal size={15} /> Filters</button><label><ArrowUpDown size={14} /><span>Sort by</span><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="rating">Top rated</option></select></label></div></div>
        <div className="catalog-reference-search"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search the collection" aria-label="Search the collection" />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}</div>
        {visibleProducts.length > 0 ? <div className="catalog-reference-grid">{visibleProducts.map((product) => <CatalogCard key={product.slug} product={product} onAdd={addToCart} />)}</div> : <div className="catalog-reference-empty"><Search size={30} /><h3>No products found</h3><p>Try changing your search or filters.</p><button onClick={clearFilters}>Reset filters</button></div>}
        {filtered.length > perPage && <div className="catalog-reference-pagination"><button disabled={page === 1} onClick={() => setPage((current) => current - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} onClick={() => setPage(number)} className={page === number ? "is-active" : ""}>{number}</button>)}<button disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} aria-label="Next page"><ChevronRight size={16} /></button></div>}
      </section>
    </div>
  </div>;
}
