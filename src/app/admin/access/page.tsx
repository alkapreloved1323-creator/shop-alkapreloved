"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UserPlus, Trash2 } from "lucide-react";

type Role = "superadmin" | "admin" | "staff";
type AccessUser = { id: string; email: string; role: Role; createdAt: string; lastSignInAt: string | null };

export default function AdminAccessPage() {
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadUsers() {
    setLoading(true);
    const response = await fetch("/api/admin/users");
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Gagal memuat daftar pengguna.");
    else setUsers(data.users);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/users").then(async (response) => {
      const data = await response.json();
      if (!active) return;
      if (!response.ok) setError(data.error ?? "Gagal memuat daftar pengguna.");
      else setUsers(data.users);
      setLoading(false);
    }).catch(() => {
      if (active) { setError("Gagal memuat daftar pengguna."); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  async function addUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, role }) });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Gagal menambahkan pengguna.");
    else { setEmail(""); setPassword(""); setRole("staff"); setNotice("Pengguna berhasil ditambahkan."); await loadUsers(); }
    setBusy(false);
  }

  async function changeRole(user: AccessUser, nextRole: Role) {
    setError("");
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id, role: nextRole }) });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Gagal mengubah role.");
    else setUsers((current) => current.map((item) => item.id === user.id ? { ...item, role: nextRole } : item));
  }

  async function removeUser(user: AccessUser) {
    if (!window.confirm(`Hapus akses ${user.email}?`)) return;
    setError("");
    const response = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: user.id }) });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? "Gagal menghapus pengguna.");
    else setUsers((current) => current.filter((item) => item.id !== user.id));
  }

  return <div className="admin-dashboard saas-dashboard saas-access-page">
    <header className="saas-heading"><div><p className="saas-eyebrow">Security & access</p><h1>Akses dashboard <span>✦</span></h1><p>Atur admin dan user yang boleh masuk ke dashboard admin.</p></div></header>
    {error && <p className="admin-login-error" role="alert">{error}</p>}
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    <div className="saas-access-grid">
      <section className="saas-panel saas-access-form-panel"><div className="saas-panel-head"><div><span className="saas-label">Invite user</span><h2>Tambah akses</h2></div><UserPlus size={20} /></div><form onSubmit={addUser} className="admin-settings-form"><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@example.com" required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} placeholder="Minimal 8 karakter" required /></label><label>Role<select value={role} onChange={(event) => setRole(event.target.value as Role)}><option value="staff">User / Staff</option><option value="admin">Admin</option></select></label><button className="saas-primary-button" type="submit" disabled={busy}>{busy ? "Menyimpan..." : "Tambah pengguna"}</button></form></section>
      <section className="saas-panel saas-access-list-panel"><div className="saas-panel-head"><div><span className="saas-label">Authorized accounts</span><h2>Pengguna aktif</h2></div><ShieldCheck size={20} /></div>{loading ? <p className="admin-empty">Memuat pengguna...</p> : users.length === 0 ? <p className="admin-empty">Belum ada admin atau user terdaftar.</p> : <div className="saas-access-list">{users.map((user) => <article className="saas-access-user" key={user.id}><div className="saas-customer-avatar">{user.email.charAt(0).toUpperCase()}</div><div className="saas-access-user-info"><strong>{user.email}</strong><small>Ditambahkan {new Date(user.createdAt).toLocaleDateString("id-ID")}</small></div>{user.role === "superadmin" ? <span className="saas-superadmin-badge">Superadmin · Terkunci</span> : <><select value={user.role} onChange={(event) => void changeRole(user, event.target.value as Role)} aria-label={`Role ${user.email}`}><option value="staff">User / Staff</option><option value="admin">Admin</option></select><button className="admin-row-action" onClick={() => void removeUser(user)} aria-label={`Hapus akses ${user.email}`}><Trash2 size={15} /></button></>}</article>)}</div>}</section>
    </div>
  </div>;
}
