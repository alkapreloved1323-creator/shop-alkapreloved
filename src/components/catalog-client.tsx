"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard, type Product } from "@/components/storefront";

const categories = ["All pieces", "Tops", "Dresses", "Bottoms", "Accessories"];
const conditions = ["All conditions", "Like new", "Very good", "Good", "Fair"];

export function CatalogClient({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All pieces");
  const [condition, setCondition] = useState("All conditions");
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const matchesQuery = `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All pieces" || product.category === category;
      const matchesCondition = condition === "All conditions" || product.condition.toLowerCase() === condition.toLowerCase();
      return matchesQuery && matchesCategory && matchesCondition;
    });
    return [...result].sort((a, b) => sort === "price-low" ? (a.priceValue ?? 0) - (b.priceValue ?? 0) : sort === "price-high" ? (b.priceValue ?? 0) - (a.priceValue ?? 0) : (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }, [products, query, category, condition, sort]);

  return <div className="catalog-shell">
    <div className="catalog-toolbar">
      <div className="catalog-search"><Search size={17} /><input id="catalog-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the collection" aria-label="Search the collection" />{query && <button aria-label="Clear search" onClick={() => setQuery("")}><X size={15} /></button>}</div>
      <button className="filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={15} /> Filters</button>
      <label className="sort-control">Sort by <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products"><option value="newest">Newest first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
    </div>
    <div className={`catalog-filters ${filtersOpen ? "is-open" : ""}`}><div><p className="filter-label">Category</p><div className="filter-pills">{categories.map((item) => <button key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div><div><p className="filter-label">Condition</p><div className="filter-pills">{conditions.map((item) => <button key={item} className={condition === item ? "is-active" : ""} onClick={() => setCondition(item)}>{item}</button>)}</div></div></div>
    <div className="catalog-meta"><p><strong>{filtered.length}</strong> pieces</p>{(query || category !== "All pieces" || condition !== "All conditions") && <button className="clear-filters" onClick={() => { setQuery(""); setCategory("All pieces"); setCondition("All conditions"); }}>Clear all</button>}</div>
    {filtered.length > 0 ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.slug} product={product} />)}</div> : <div className="catalog-empty"><p className="eyebrow">Nothing here yet</p><h2>Try a softer search.</h2><p>We could not find a piece matching those filters.</p><button className="button button-dark" onClick={() => { setQuery(""); setCategory("All pieces"); setCondition("All conditions"); }}>View all pieces</button></div>}
  </div>;
}
