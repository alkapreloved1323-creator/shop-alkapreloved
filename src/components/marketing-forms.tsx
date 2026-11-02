"use client";
import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setMessage(data.message || data.error);
      if (response.ok) setEmail("");
    } catch {
      setMessage("Gagal berlangganan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={submit} className="flex items-center gap-2 max-w-md w-full">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Masukkan email kamu..."
          aria-label="Alamat email"
          className="bg-[#0F172A] border border-[#4F46E5] focus:border-[#FED7AA] rounded-full px-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8] outline-none w-full transition-colors"
        />
        <button
          type="submit"
          aria-label="Subscribe newsletter"
          disabled={loading}
          className="bg-[#EEF2FF] hover:bg-[#E2E8F0] text-[#0F172A] font-semibold px-4 py-2.5 rounded-full text-xs transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <span>Kirim</span>}
        </button>
      </form>
      {message && (
        <p className="text-[#FED7AA] text-xs mt-2.5 flex items-center gap-1.5">
          <CheckCircle2 size={13} />
          {message}
        </p>
      )}
    </div>
  );
}

export function ContactForm() {
  const [state, setState] = useState({ name: "", email: "", message: "" });
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setFeedback("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const data = await response.json();
      setFeedback(data.message || data.error);
      if (response.ok) setState({ name: "", email: "", message: "" });
    } catch {
      setFeedback("Gagal mengirim pesan. Silakan hubungi kami via WhatsApp.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-[#0F172A]/60 border border-[#4F46E5]/80 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-xl">
      <div>
        <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
          Nama Lengkap
        </label>
        <input
          required
          placeholder="cth. Nabila Putri"
          value={state.name}
          onChange={(event) => setState({ ...state, name: event.target.value })}
          className="w-full bg-[#0F172A] border border-[#4F46E5] focus:border-[#FED7AA] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#64748B] outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
          Alamat Email
        </label>
        <input
          required
          type="email"
          placeholder="cth. nabila@example.com"
          value={state.email}
          onChange={(event) => setState({ ...state, email: event.target.value })}
          className="w-full bg-[#0F172A] border border-[#4F46E5] focus:border-[#FED7AA] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#64748B] outline-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">
          Pesan / Pertanyaan
        </label>
        <textarea
          required
          minLength={10}
          rows={4}
          placeholder="Tanyakan detail item, ukuran, atau request kurasi khusus..."
          value={state.message}
          onChange={(event) => setState({ ...state, message: event.target.value })}
          className="w-full bg-[#0F172A] border border-[#4F46E5] focus:border-[#FED7AA] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#64748B] outline-none transition-colors resize-none"
        />
      </div>

      <button
        className="w-full bg-[#EEF2FF] hover:bg-[#E2E8F0] text-[#0F172A] font-semibold py-3.5 px-6 rounded-full text-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Kirim Pesan</span>}
        <ArrowRight size={16} />
      </button>

      {feedback && (
        <p className="text-[#FED7AA] text-xs text-center mt-2 flex items-center justify-center gap-1.5">
          <CheckCircle2 size={14} />
          {feedback}
        </p>
      )}
    </form>
  );
}

