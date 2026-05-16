'use client';

import { useState, useEffect } from 'react';
import { updateProfile, changePassword } from '@/app/actions/user';
import { User, Lock, Save, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { getProfile } from '@/app/actions/data';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    getProfile()
      .then(j => { if (j.success) setUser(j.data); })
      .finally(() => setLoading(false));
  }, []);

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setUpdating(true);
    setMsg({ type: '', text: '' });
    const formData = new FormData(e.target);
    const res = await updateProfile(formData);
    if (res.success) {
      setMsg({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } else {
      setMsg({ type: 'error', text: res.error });
    }
    setUpdating(false);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setUpdating(true);
    setMsg({ type: '', text: '' });
    const formData = new FormData(e.target);
    const res = await changePassword(formData);
    if (res.success) {
      setMsg({ type: 'success', text: 'Password berhasil diubah!' });
      e.target.reset();
    } else {
      setMsg({ type: 'error', text: res.error });
    }
    setUpdating(false);
  }

  if (loading) return <div className="animate-pulse" style={{ color: 'var(--muted)' }}>Memuat pengaturan...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Kembali ke Dashboard
      </Link>
      <header style={{ marginBottom: '2rem' }}>
        <h1>Pengaturan Profil</h1>
        <p style={{ color: 'var(--muted)' }}>Kelola informasi akun dan keamanan Anda.</p>
      </header>

      {msg.text && (
        <div className={`glass animate-fade-in`} style={{ 
          padding: '1rem', 
          marginBottom: '1.5rem', 
          borderRadius: '12px',
          border: `1px solid ${msg.type === 'success' ? '#10b981' : '#ef4444'}`,
          background: msg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: msg.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <ShieldCheck size={20} />
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Info Profil */}
        <section className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <User size={22} className="text-gradient" />
            <h2 style={{ fontSize: '1.25rem' }}>Informasi Dasar</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Nama Lengkap</label>
              <input 
                name="name" 
                defaultValue={user?.name} 
                className="glass" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '10px', color: 'white' }}
                required 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Email</label>
              <input 
                name="email" 
                defaultValue={user?.email} 
                className="glass" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '10px', color: 'white' }}
                required 
              />
            </div>
            <button disabled={updating} type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.75rem 1.5rem' }}>
              {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan Perubahan
            </button>
          </form>
        </section>

        {/* Keamanan */}
        <section className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Lock size={22} className="text-gradient" />
            <h2 style={{ fontSize: '1.25rem' }}>Keamanan Account</h2>
          </div>
          
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Password Saat Ini</label>
              <input 
                name="currentPassword" 
                type="password" 
                className="glass" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '10px', color: 'white' }}
                required 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Password Baru</label>
              <input 
                name="newPassword" 
                type="password" 
                className="glass" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '10px', color: 'white' }}
                required 
              />
            </div>
            <button disabled={updating} type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.75rem 1.5rem' }}>
              {updating ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />} Ubah Password
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
