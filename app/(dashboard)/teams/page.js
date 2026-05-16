'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, ExternalLink, Plus, Loader2 } from 'lucide-react';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // In a real app, fetch from /api/teams
    setTimeout(() => {
      setTeams([
        { _id: '1', name: 'Tim Desain Vortex', membersCount: 3, role: 'Owner' },
        { _id: '2', name: 'Engineering Alpha', membersCount: 8, role: 'Member' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="animate-pulse" style={{ color: 'var(--muted)' }}>Memuat tim...</div>;

  return (
    <div className="animate-fade-in">
      <header className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Kolaborasi Tim</h1>
          <p className="subtitle">Kelola tim, proyek bersama, dan delegasi tugas.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreating(true)}>
          <Plus size={18} /> Buat Tim Baru
        </button>
      </header>

      <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {teams.map(team => (
          <div key={team._id} className="glass glass-hover team-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div className="team-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '0.75rem', borderRadius: '12px' }}>
                <Users size={24} />
              </div>
              <span className={`role-badge ${team.role.toLowerCase()}`} style={{ 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                padding: '0.2rem 0.6rem', 
                borderRadius: '999px',
                background: team.role === 'Owner' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                color: team.role === 'Owner' ? '#10b981' : '#3b82f6'
              }}>
                {team.role}
              </span>
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{team.name}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{team.membersCount} Anggota Terdaftar</p>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                Buka Board
              </button>
              <button className="btn-icon-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <UserPlus size={16} />
              </button>
            </div>
          </div>
        ))}

        {teams.length === 0 && (
          <div className="glass" style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
            <Users size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p>Anda belum bergabung dengan tim manapun.</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsCreating(true)}>Buat Tim Pertama</button>
          </div>
        )}
      </div>

      <style jsx>{`
        .role-badge.owner { background: rgba(16,185,129,0.15); color: #10b981; }
        .role-badge.member { background: rgba(59,130,246,0.15); color: #3b82f6; }
      `}</style>
    </div>
  );
}
