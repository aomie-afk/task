'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, LayoutGrid, Timer, BarChart3, Calendar, Settings, Zap, LogOut, Users, ChevronRight } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { getProfile, getTasks } from '@/app/actions/data';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  href: '/' },
  { icon: LayoutGrid,      label: 'Task Board',  href: '/board' },
  { icon: Calendar,        label: 'Kalender',    href: '/calendar' },
  { icon: Users,           label: 'Tim Saya',    href: '/teams' },
  { icon: Timer,           label: 'Focus Timer', href: '/timer' },
  { icon: BarChart3,       label: 'Analisis',    href: '/insights' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [dbStatus, setDbStatus] = useState({ connected: false, mode: 'memory' });
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/status')
      .then(r => r.json())
      .then(setDbStatus)
      .catch(() => setDbStatus({ connected: false, mode: 'memory' }));

    getTasks()
      .then(j => { if (j.success) setTasks(j.data); })
      .catch(console.error);

    getProfile()
      .then(j => { 
        if (j.success) {
          setUser(j.data);
        } else if (j.error === 'User not found or session invalid' || j.error === 'Unauthorized') {
          window.location.href = '/login';
        }
      })
      .catch(console.error);
  }, [pathname]);

  return (
    <aside className="sidebar glass">
      {/* Header: User Profile & Settings (Notion style) */}
      <div className="sidebar-header">
        <Link href="/settings" className={`user-account glass-hover ${pathname === '/settings' ? 'active' : ''}`}>
          <div className="user-avatar">
            {user ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="user-meta">
            <span className="user-name">{user ? user.name : 'Memuat...'}</span>
            <span className="user-email">{user ? user.email : ''}</span>
          </div>
          <Settings size={14} className="settings-icon" />
        </Link>
      </div>

      <div className="divider" />

      {/* Nav Section */}
      <nav className="nav-grid">
        <div className="nav-section-label">Main Menu</div>
        {menuItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`nav-btn${active ? ' active' : ''}`}>
              <div className="nav-icon-box">
                <Icon size={18} />
              </div>
              <span className="nav-btn-label">{label}</span>
              {active && <div className="active-indicator" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-spacer" />

      {/* Bottom Section */}
      <div className="sidebar-footer">
        <div className="sidebar-stats glass">
          <div className="stat-item">
            <span className="stat-value">{tasks.length}</span>
            <span className="stat-name">Tugas</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{tasks.filter(t => t.status === 'Done').length}</span>
            <span className="stat-name">Selesai</span>
          </div>
        </div>

        <div className="db-status-pill">
          <span className="db-dot" style={{ background: dbStatus.connected ? '#10b981' : '#f59e0b' }} />
          <span>{dbStatus.connected ? 'Cloud Connected' : 'Local Mode'}</span>
        </div>

        <form action={logout}>
          <button type="submit" className="logout-btn">
            <LogOut size={18} />
            <span>Keluar Sesi</span>
          </button>
        </form>
      </div>

      <style jsx>{`
        .sidebar {
          display: flex;
          flex-direction: column;
          padding: 1.25rem 1rem;
          height: 100vh;
          width: 260px;
          border-right: 1px solid var(--border);
          overflow-y: auto;
        }
        .sidebar-header { margin-bottom: 1.25rem; }
        .user-account {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem;
          border-radius: 12px;
          text-decoration: none;
          color: white;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .user-account:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
        .user-account.active { background: rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.2); }
        .user-avatar {
          width: 36px;
          height: 36px;
          background: var(--accent-gradient);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .user-meta { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
        .user-name { font-size: 0.9rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-email { font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .settings-icon { color: var(--text-muted); opacity: 0.5; }
        
        .divider { height: 1px; background: var(--border); margin-bottom: 1.5rem; opacity: 0.5; }
        
        .nav-section-label {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
          margin-left: 0.5rem;
        }
        
        .nav-grid { display: flex; flex-direction: column; gap: 0.4rem; }
        .nav-btn {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 0.85rem;
          border-radius: 10px;
          text-decoration: none;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s;
          position: relative;
        }
        .nav-btn:hover { color: white; background: rgba(255,255,255,0.04); }
        .nav-btn.active { color: white; background: rgba(139,92,246,0.1); }
        .active-indicator {
          position: absolute;
          left: 0;
          width: 3px;
          height: 16px;
          background: var(--accent);
          border-radius: 0 4px 4px 0;
        }
        
        .sidebar-spacer { flex: 1; }
        
        .sidebar-footer { display: flex; flex-direction: column; gap: 1rem; }
        
        .sidebar-stats {
          display: flex;
          padding: 0.85rem;
          border-radius: 12px;
          background: rgba(255,255,255,0.02);
        }
        .stat-item { flex: 1; text-align: center; display: flex; flex-direction: column; }
        .stat-value { font-size: 1.1rem; font-weight: 800; }
        .stat-name { font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
        .stat-divider { width: 1px; background: var(--border); margin: 0 0.5rem; }
        
        .db-status-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          padding: 0.5rem 0.85rem;
          background: rgba(0,0,0,0.2);
          border-radius: 999px;
          align-self: flex-start;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .db-dot { width: 6px; height: 6px; border-radius: 50%; box-shadow: 0 0 8px currentColor; }
        
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem;
          border-radius: 12px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          color: #f87171;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover { background: #ef4444; color: white; }
      `}</style>
    </aside>
  );
}
