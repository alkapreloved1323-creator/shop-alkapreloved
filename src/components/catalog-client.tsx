"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard, type Product } from "@/components/storefront";
import { useCart } from "@/components/cart-context";

const priceRanges = [
  { value: "all", label: "All prices" },
  { value: "under150", label: "Under Rp 150k" },
  { value: "150to300", label: "Rp 150k - 300k" },
  { value: "over300", label: "Over Rp 300k" },
];

export function CatalogClient({ products }: { products: Product[] }) {
  const [query, setQuery] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("search") ?? "");
  const [category, setCategory] = useState(() => typeof window === "undefined" ? "All pieces" : new URLSearchParams(window.location.search).get("category") ?? "All pieces");
  const [condition, setCondition] = useState("All conditions");
  const [priceRange, setPriceRange] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const { addItem } = useCart();
  const perPage = 8;
  const categories = useMemo(() => ["All pieces", ...Array.from(new Set(products.map((product) => product.category))).sort()], [products]);
  const conditions = ["All conditions", "Like new", "Very good", "Good", "Fair"];
  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const matchesQuery = `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All pieces" || product.category === category;
      const matchesCondition = condition === "All conditions" || product.condition.toLowerCase() === condition.toLowerCase();
      const price = product.priceValue ?? 0;
      const matchesPrice = priceRange === "all" || (priceRange === "under150" && price < 150000) || (priceRange === "150to300" && price >= 150000 && price <= 300000) || (priceRange === "over300" && price > 300000);
      return matchesQuery && matchesCategory && matchesCondition && matchesPrice;
    });
    return [...result].sort((a, b) => sort === "price-low" ? (a.priceValue ?? 0) - (b.priceValue ?? 0) : sort === "price-high" ? (b.priceValue ?? 0) - (a.priceValue ?? 0) : (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }, [products, query, category, condition, priceRange, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visibleProducts = filtered.slice((page - 1) * perPage, page * perPage);
  const hasFilters = Boolean(query || category !== "All pieces" || condition !== "All conditions" || priceRange !== "all");
  const clearFilters = () => { setQuery(""); setCategory("All pieces"); setCondition("All conditions"); setPriceRange("all"); setPage(1); };
  const select = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };
  const addToCart = (product: Product) => {
    addItem({ slug: product.slug, name: product.name, price: product.price, priceValue: product.priceValue ?? 0, image: product.image, size: product.size, stock: 1 });
    setNotice(`${product.name} ditambahkan ke keranjang`);
    window.setTimeout(() => setNotice(""), 2400);
  };

  return <div className="catalog-shell catalog-reference-ui">
    {notice && <div className="catalog-toast" role="status">{notice}</div>}
    <div className="catalog-toolbar catalog-reference-toolbar">
      <div className="catalog-search"><Search size={17} /><input id="catalog-search" value={query} onChange={(event) => select(setQuery, event.target.value)} placeholder="Search the collection" aria-label="Search the collection" />{query && <button aria-label="Clear search" onClick={() => select(setQuery, "")}><X size={15} /></button>}</div>
      <button className="filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={15} /> Filters</button>
      <label className="sort-control"><ArrowUpDown size={14} /> Sort by <select value={sort} onChange={(event) => select(setSort, event.target.value)} aria-label="Sort products"><option value="newest">Newest first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
    </div>
    <div className={`catalog-filters catalog-reference-filters ${filtersOpen ? "is-open" : ""}`}>
      <div><p className="filter-label">Category</p><div className="filter-pills">{categories.map((item) => <button key={item} className={category === item ? "is-active" : ""} onClick={() => select(setCategory, item)}>{item}</button>)}</div></div>
      <div><p className="filter-label">Price range</p><div className="filter-pills">{priceRanges.map((item) => <button key={item.value} className={priceRange === item.value ? "is-active" : ""} onClick={() => select(setPriceRange, item.value)}>{item.label}</button>)}</div></div>
      <div><p className="filter-label">Condition</p><div className="filter-pills">{conditions.map((item) => <button key={item} className={condition === item ? "is-active" : ""} onClick={() => select(setCondition, item)}>{item}</button>)}</div></div>
    </div>
    <div className="catalog-meta catalog-reference-meta"><p><strong>{filtered.length}</strong> pieces curated for their next chapter</p>{hasFilters && <button className="clear-filters" onClick={clearFilters}>Clear all</button>}</div>
    {visibleProducts.length > 0 ? <div className="product-grid catalog-reference-grid">{visibleProducts.map((product) => <div className="catalog-reference-card" key={product.slug}><ProductCard product={product} theme="light" /><button className="catalog-add-button" onClick={() => addToCart(product)}>Add to bag</button></div>)}</div> : <div className="catalog-empty"><p className="eyebrow">Nothing here yet</p><h2>Try a softer search.</h2><p>We could not find a piece matching those filters.</p><button className="button button-dark" onClick={clearFilters}>View all pieces</button></div>}
    {filtered.length > 0 && <div className="catalog-pagination"><button disabled={page === 1} onClick={() => setPage((current) => current - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button><span>Page {page} of {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} aria-label="Next page"><ChevronRight size={16} /></button></div>}
  </div>;
}
