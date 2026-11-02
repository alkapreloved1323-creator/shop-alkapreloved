import type { Metadata } from "next";
import { Clock3, Mail, MapPin, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/marketing-forms";
import { KauppaFooter, KauppaNavbar } from "@/components/storefront";

export const metadata: Metadata = { title: "Kontak — AlkaPreloved", description: "Hubungi AlkaPreloved untuk pertanyaan produk, order, dan kurasi." };

const contactDetails = [
  { icon: MessageCircle, title: "WhatsApp", detail: "+62 812 3456 7890", note: "Balasan tercepat, setiap hari" },
  { icon: Mail, title: "Email", detail: "hello@alkapreloved.com", note: "Kami balas dalam 1 hari kerja" },
  { icon: Clock3, title: "Jam layanan", detail: "Senin–Sabtu, 09.00–18.00", note: "Waktu Indonesia Barat" },
];

export default function ContactPage() {
  return (
    <main className="contact-page">
      <KauppaNavbar />
      <section className="contact-hero"><div className="kauppa-container"><p className="eyebrow">We would love to hear from you</p><h1>Let&apos;s talk<br /><em>good finds.</em></h1><p>Butuh detail ukuran, ingin menanyakan kondisi item, atau punya request khusus? Ceritakan pada kami.</p></div></section>
      <section className="contact-content"><div className="kauppa-container contact-layout"><div className="contact-intro"><p className="eyebrow">Get in touch</p><h2>Small question,<br /><em>friendly answer.</em></h2><p>Tim AlkaPreloved siap membantu kamu menemukan piece yang tepat. Isi form di samping, atau hubungi kami langsung melalui kanal pilihanmu.</p><div className="contact-details">{contactDetails.map(({ icon: Icon, title, detail, note }) => <div key={title}><span className="contact-detail-icon"><Icon size={18} /></span><span><strong>{title}</strong><b>{detail}</b><small>{note}</small></span></div>)}</div></div><div className="contact-form-wrap"><ContactForm /></div></div></section>
      <section className="contact-location"><div className="kauppa-container contact-location-inner"><div><p className="eyebrow">A considered corner</p><h2>Come say hello.</h2><p>Studio by appointment in Jakarta Selatan. We keep our doors small, calm, and full of good stories.</p><div className="contact-address"><MapPin size={17} /><span>Jakarta Selatan<br />Indonesia</span></div></div><div className="contact-map" aria-label="Illustrated location map"><span /><span /><span /><strong>ALKAPRELOVED</strong></div></div></section>
      <KauppaFooter />
    </main>
  );
}
