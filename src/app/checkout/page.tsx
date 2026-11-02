"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, ShieldCheck } from "lucide-react";
import { KauppaFooter, KauppaNavbar } from "@/components/storefront";
import { useCart } from "@/components/cart-context";

type Location = { code: string; name: string };
type Rate = { courier_code: string; courier_name: string; service_code: string; service_name: string; etd?: string | null; total_price?: number | null; price?: number };
const STORE_ORIGIN_DISTRICT_CODE = "317405";
const formatPrice = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const fallbackMethods = [{ id: "pickup", name: "Local pickup", provider: "Kalideres, Jakarta Barat", estimate: "Ready within 1 business day", price: 0 }];

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [rates, setRates] = useState<Rate[]>([]);
  const [shippingId, setShippingId] = useState("");
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");
  const activeRate = rates.find((rate) => `${rate.courier_code}-${rate.service_code}` === shippingId);
  const shippingPrice = activeRate?.total_price ?? activeRate?.price ?? (district ? 0 : 0);
  const total = subtotal + (items.length ? shippingPrice : 0);
  const locationRequest = async (type: string, value = "") => { const response = await fetch(`/api/shipping/locations?type=${type}&value=${encodeURIComponent(value)}`); const payload = await response.json(); if (!response.ok || !payload.is_success) throw new Error(payload.message ?? "Location lookup failed"); return payload.data as Location[]; };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoadingLocations(true);
      locationRequest("provinces").then(setProvinces).catch(() => setError("Wilayah belum dapat dimuat. Coba lagi nanti.")).finally(() => setLoadingLocations(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCity(""); setDistrict(""); setCities([]); setDistricts([]); setRates([]); setShippingId("");
      if (province) locationRequest("cities", province).then(setCities).catch(() => setError("Daftar kota gagal dimuat."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [province]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDistrict(""); setDistricts([]); setRates([]); setShippingId("");
      if (city) locationRequest("districts", city).then(setDistricts).catch(() => setError("Daftar kecamatan gagal dimuat."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [city]);
  useEffect(() => {
    if (!district || !items.length) return;
    const timer = window.setTimeout(() => {
      setLoadingRates(true);
      const weight = Math.max(1, items.reduce((sum, item) => sum + item.quantity, 0));
      fetch(`/api/shipping/rates?origin_district_code=${STORE_ORIGIN_DISTRICT_CODE}&destination_district_code=${district}&weight=${weight}&item_value=${subtotal}`).then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.is_success) throw new Error(payload.message ?? "Rates unavailable");
        setRates(payload.data?.rates ?? []);
      }).catch(() => { setRates([]); setError("Tarif realtime belum tersedia untuk wilayah ini. Silakan pilih Local pickup atau coba lagi."); }).finally(() => setLoadingRates(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [district, items, subtotal]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!items.length) return; const form = new FormData(event.currentTarget); if (!form.get("name") || !form.get("email") || !form.get("phone") || !form.get("address") || !city || !district || !postalCode || !shippingId) { setError("Lengkapi alamat, kode pos, kecamatan, dan pilihan pengiriman terlebih dahulu."); return; } setError(""); setOrderNumber(`ALK-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(Math.floor(1000 + Math.random() * 9000))}`); setSubmitted(true); }
  if (submitted) return <main className="kauppa-page"><KauppaNavbar /><section className="checkout-page kauppa-container"><div className="checkout-success"><span className="success-icon"><Check size={26} /></span><p className="eyebrow">Order received</p><h1>Thank you for<br /><em>choosing slowly.</em></h1><p>Your order <strong>{orderNumber}</strong> has been recorded. We will send payment instructions and delivery updates to your email.</p><Link href="/track-order" className="button button-dark">Track your order <ArrowRight size={16} /></Link></div></section><KauppaFooter /></main>;
  const methods = rates.length ? rates.map((rate) => ({ id: `${rate.courier_code}-${rate.service_code}`, name: `${rate.courier_name} · ${rate.service_name}`, provider: rate.courier_name, estimate: rate.etd ? `${rate.etd} days` : "Delivery estimate unavailable", price: rate.total_price ?? rate.price ?? 0 })) : fallbackMethods;
  return <main className="kauppa-page"><KauppaNavbar /><section className="checkout-page kauppa-container"><div className="checkout-heading"><Link href="/cart" className="back-link"><ArrowLeft size={15} /> Back to bag</Link><p className="eyebrow">Guest checkout</p><h1>Almost <em>yours.</em></h1><p>Complete your details and we will prepare your pieces for their next chapter.</p></div>{!items.length ? <div className="checkout-empty"><h2>Your bag is waiting.</h2><p>Add a piece before continuing to checkout.</p><Link href="/shop" className="button button-dark">Browse the collection <ArrowRight size={16} /></Link></div> : <div className="checkout-layout"><form className="checkout-form" onSubmit={handleSubmit}><fieldset><legend>Contact information</legend><label>Full name<input name="name" type="text" placeholder="Your full name" required /></label><div className="form-row"><label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label><label>WhatsApp number<input name="phone" type="tel" placeholder="08xxxxxxxxxx" required /></label></div></fieldset><fieldset><legend>Shipping address</legend><label>Address<input name="address" type="text" placeholder="Street, house number, apartment" required /></label><div className="form-row"><label>Province<select value={province} onChange={(event) => setProvince(event.target.value)} required><option value="">{loadingLocations ? "Loading..." : "Select province"}</option>{provinces.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label><label>City / Regency<select value={city} onChange={(event) => setCity(event.target.value)} disabled={!province} required><option value="">Select city</option>{cities.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label></div><div className="form-row"><label>District<select name="district" value={district} onChange={(event) => setDistrict(event.target.value)} disabled={!city} required><option value="">Select district</option>{districts.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label><label>Postal code<input name="postalCode" value={postalCode} onChange={(event) => setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" pattern="[0-9]{5}" placeholder="Enter postal code" required /><small className="field-help">Kode pos diisi sesuai alamat tujuan.</small></label></div><label>Delivery note <span className="optional">Optional</span><textarea name="note" rows={3} placeholder="Any notes for delivery?" /></label></fieldset><fieldset><legend>Choose delivery</legend>{loadingRates && <p className="shipping-loading"><LoaderCircle size={15} className="spin" /> Checking live rates...</p>}<div className="shipping-options">{methods.map((method) => <label className={`shipping-option ${shippingId === method.id ? "is-selected" : ""}`} key={method.id}><input type="radio" name="shippingMethod" value={method.id} checked={shippingId === method.id} onChange={() => setShippingId(method.id)} /><span className="shipping-option-copy"><strong>{method.name}</strong><small>{method.provider} · {method.estimate}</small></span><strong>{method.price ? formatPrice(method.price) : "Free"}</strong></label>)}</div>{!district && <small className="field-help">Pilih kecamatan untuk menghitung tarif realtime.</small>}</fieldset>{error && <p className="form-error">{error}</p>}<button className="button button-dark checkout-submit" type="submit">Place order <ArrowRight size={16} /></button><p className="secure-note"><ShieldCheck size={15} /> Your details are only used to process this order.</p></form><aside className="checkout-summary"><p className="eyebrow">Your selection</p>{items.map((item) => <div className="checkout-item" key={item.slug}><div><strong>{item.name}</strong><span>{item.quantity} × {item.price}</span></div><strong>{formatPrice(item.priceValue * item.quantity)}</strong></div>)}<hr /><div className="checkout-line"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div className="checkout-line"><span>{activeRate ? `${activeRate.courier_name} · ${activeRate.service_name}` : "Shipping"}</span><strong>{shippingPrice ? formatPrice(shippingPrice) : "—"}</strong></div><div className="checkout-total"><span>Total</span><strong>{formatPrice(total)}</strong></div></aside></div>}</section><KauppaFooter /></main>;

}