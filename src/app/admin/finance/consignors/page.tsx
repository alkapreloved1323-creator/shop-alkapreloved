"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, UsersRound, Plus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Consignor = { id: string; name: string; phone: string | null; email: string | null; address: string | null; city: string | null; bank_name: string | null; bank_account_name: string | null; bank_account_number: string | null };
export default function FinanceConsignorsPage() {
  const [consignors, setConsignors] = useState<Consignor[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { const supabase = createSupabaseBrowserClient(); supabase.from("consignors").select("id,name,phone,email,address,city,bank_name,bank_account_name,bank_account_number").order("name").then(({ data }) => setConsignors((data ?? []) as Consignor[])); }, []);
  async function addConsignor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    const supabase = createSupabaseBrowserClient();
    const { data, error: insertError } = await supabase.from("consignors").insert({ name: name.trim(), phone: phone.trim() || null, email: email.trim() || null, address: address.trim() || null, city: city.trim() || null, bank_name: bankName.trim() || null, bank_account_name: bankAccountName.trim() || null, bank_account_number: bankAccountNumber.trim() || null }).select("id,name,phone,email,address,city,bank_name,bank_account_name,bank_account_number").single();
    if (insertError) setError(insertError.message);
    else if (data) { setConsignors((current) => [...current, data as Consignor].sort((a, b) => a.name.localeCompare(b.name))); setName(""); setPhone(""); setEmail(""); setAddress(""); setCity(""); setBankName(""); setBankAccountName(""); setBankAccountNumber(""); setOpen(false); }
    setSaving(false);
  }
  return <div className="admin-dashboard saas-dashboard saas-finance-page"><header className="saas-heading"><div><p className="saas-eyebrow">Consignor database</p><h1>Data penitip <span>✦</span></h1><p>Pilih penitip untuk melihat produk dan detail pencairannya.</p></div><button className="saas-primary-button" onClick={() => setOpen(true)}><Plus size={15} /> Tambah penitip</button></header>{error && <p className="admin-login-error" role="alert">{error}</p>}<section className="saas-panel saas-finance-consignors"><div className="saas-panel-head"><div><span className="saas-label">Authorized consignors</span><h2>Semua penitip</h2></div><UsersRound size={20} /></div>{consignors.length ? <div className="saas-finance-consignor-grid">{consignors.map((consignor) => <Link className="saas-finance-consignor-card" href={`/admin/finance/consignors/${consignor.id}`} key={consignor.id}><span className="saas-customer-avatar">{consignor.name.charAt(0)}</span><span><strong>{consignor.name}</strong><small>{consignor.phone ?? consignor.email ?? "Kontak belum diisi"}</small></span><ArrowUpRight size={15} /></Link>)}</div> : <p className="admin-empty">Belum ada data penitip.</p>}  </section>{open && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="add-consignor-title"><header><h2 id="add-consignor-title">Tambah data penitip</h2><button className="admin-row-action" type="button" onClick={() => setOpen(false)} aria-label="Tutup">×</button></header><form className="admin-settings-form" onSubmit={addConsignor}><label>Nama penitip<input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama lengkap" /></label><label>No. WhatsApp<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="08xxxxxxxxxx" /></label><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@example.com" /></label><label>Alamat<textarea rows={3} value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Alamat lengkap penitip" /></label><label>Kota asal<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Contoh: Jakarta" /></label><fieldset className="saas-bank-fields"><legend>Data rekening</legend><label>Nama bank<input value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="Contoh: BCA" /></label><label>Nama pemilik rekening<input value={bankAccountName} onChange={(event) => setBankAccountName(event.target.value)} placeholder="Sesuai buku rekening" /></label><label>Nomor rekening<input inputMode="numeric" value={bankAccountNumber} onChange={(event) => setBankAccountNumber(event.target.value)} placeholder="Nomor rekening" /></label></fieldset><footer><button type="button" className="admin-secondary-button" onClick={() => setOpen(false)}>Batal</button><button type="submit" className="admin-primary-button" disabled={saving}>{saving ? "Menyimpan..." : "Simpan penitip"}</button></footer></form></section></div>}</div>;
}
