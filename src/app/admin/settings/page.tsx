"use client";

import { useState } from "react";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  return <div className="admin-dashboard"><header className="admin-page-heading"><div><p className="admin-kicker">Preferensi</p><h1>Pengaturan toko</h1><p>Informasi dasar yang digunakan untuk operasional AlkaPreloved.</p></div></header>
    <form className="admin-panel admin-settings-form" onSubmit={(e) => { e.preventDefault(); setSaved(true); window.setTimeout(() => setSaved(false), 3000); }}><h2>Informasi toko</h2><div className="admin-form-row"><label>Nama toko<input defaultValue="AlkaPreloved" /></label><label>Email kontak<input type="email" defaultValue="hello@alkapreloved.my.id" /></label></div><div className="admin-form-row"><label>WhatsApp<input type="tel" defaultValue="+62 812-0000-0000" /></label><label>Mata uang<select defaultValue="IDR"><option value="IDR">Rupiah (IDR)</option></select></label></div><label>Deskripsi toko<textarea rows={4} defaultValue="Curated preloved fashion, ready for its next chapter." /></label><button className="admin-primary-button" type="submit"><Save size={15} /> Simpan pengaturan</button>{saved && <p className="admin-notice" role="status">Pengaturan tersimpan di sesi ini.</p>}<p className="admin-info-note">Pengaturan belum tersimpan secara permanen. Hubungkan database untuk menerapkannya pada storefront.</p></form>
  </div>;
}
