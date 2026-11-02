import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, Recycle, ShieldCheck } from "lucide-react";
import { KauppaFooter, KauppaNavbar } from "@/components/storefront";

export const metadata: Metadata = { title: "Tentang — AlkaPreloved", description: "Kenali cerita di balik AlkaPreloved — platform fashion preloved berkualitas." };

const values = [
  { icon: Recycle, title: "Slow fashion", body: "Setiap piece yang kami kurasi adalah langkah kecil menjauh dari fast fashion. Membeli preloved berarti memberi pakaian kehidupan kedua." },
  { icon: ShieldCheck, title: "Quality checked", body: "Tim kami memeriksa kondisi, bahan, dan detail setiap item sebelum masuk koleksi. Apa yang kamu lihat adalah apa yang kamu dapat." },
  { icon: Heart, title: "Community first", body: "Kami membangun komunitas yang percaya bahwa gaya personal tidak harus mahal — cukup thoughtful." },
  { icon: Leaf, title: "Less waste", body: "Satu item preloved yang terjual berarti satu item yang tidak berakhir di tempat pembuangan. Sederhana, tapi bermakna." },
];

const milestones = [
  { year: "2023", label: "Mulai dari koleksi pribadi — 12 item pertama dijual lewat Instagram." },
  { year: "2024", label: "500+ items terkurasi. Komunitas bertumbuh organik lewat mulut ke mulut." },
  { year: "2025", label: "Website diluncurkan. Pengalaman belanja yang lebih rapi dan transparan." },
  { year: "2026", label: "Terus bertumbuh — setiap piece punya cerita, setiap pembeli jadi bagian darinya." },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <KauppaNavbar />

      {/* Hero */}
      <section className="about-hero">
        <div className="kauppa-container about-hero-inner">
          <div className="about-hero-copy">
            <p className="eyebrow">Our story</p>
            <h1>Fashion yang<br /><em>sudah punya cerita.</em></h1>
            <p>AlkaPreloved lahir dari keyakinan sederhana: pakaian terbaik bukan yang paling baru — tapi yang paling tepat. Kami mengurasi preloved pieces berkualitas agar kamu bisa bergaya dengan lebih sadar.</p>
          </div>
          <div className="about-hero-image">
            <Image src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=85" alt="Curated clothing rack" fill sizes="(max-width:800px) 100vw, 50vw" className="about-hero-img" priority />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="kauppa-container">
          <p className="eyebrow">What we believe</p>
          <h2>Empat hal yang<br /><em>kami pegang.</em></h2>
          <div className="about-values-grid">
            {values.map((v) => (
              <div key={v.title} className="about-value-card">
                <span className="about-value-icon"><v.icon size={22} /></span>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="about-timeline">
        <div className="kauppa-container about-timeline-inner">
          <div>
            <p className="eyebrow">The journey</p>
            <h2>Dari lemari<br /><em>ke komunitas.</em></h2>
          </div>
          <ol className="about-milestones">
            {milestones.map((m) => (
              <li key={m.year}>
                <strong>{m.year}</strong>
                <p>{m.label}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="kauppa-container">
          <p className="eyebrow">Ready to explore?</p>
          <h2>Temukan piece<br /><em>berikutnya.</em></h2>
          <div className="about-cta-buttons">
            <Link href="/shop" className="button button-dark">Belanja sekarang <ArrowRight size={15} /></Link>
            <Link href="/contact" className="text-link">Hubungi kami <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      <KauppaFooter />
    </main>
  );
}
