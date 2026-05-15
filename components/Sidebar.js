'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, LayoutGrid, Timer, BarChart3, Calendar, Settings, Zap, Database } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  href: '/' },
  { icon: LayoutGrid,      label: 'Task Board',  href: '/board' },
  { icon: Calendar,        label: 'Kalender',    href: '/calendar' },
  { icon: Timer,           label: 'Focus Timer', href: '/timer' },
  { icon: BarChart3,       label: 'Analisis',    href: '/insights' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [dbStatus, setDbStatus] = useState({ connected: false, mode: 'memory' });
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('/api/status')
      .then(r => r.json())
      .then(setDbStatus)
      .catch(() => setDbStatus({ connected: false, mode: 'memory' }));

    fetch('/api/tasks')
      .then(r => r.json())
      .then(j => { if (j.success) setTasks(j.data); })
      .catch(console.error);
  }, [pathname]); // Refresh when navigating

  return (
    <aside className="sidebar glass">
      {/* Logo */}
      <div className="logo">
        <div className="logo-icon">
          <Zap size={22} color="white" />
        </div>
        <div className="logo-text">
          <span className="logo-name">Vortex</span>
          <span className="logo-sub">Task Manager</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="nav-grid">
        {menuItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`nav-btn${active ? ' active' : ''}`}>
              <div className="nav-icon-box">
                <Icon size={20} />
              </div>
              <span className="nav-btn-label">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Status */}
      <div className="sidebar-stats">
        <div className="stat-card glass">
          <p className="stat-val">{tasks.length}</p>
          <p className="stat-label">Total Task</p>
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-foot">
        <div className="db-status">
          <span className="db-dot" style={{ background: dbStatus.connected ? '#10b981' : '#f59e0b', boxShadow: dbStatus.connected ? '0 0 6px rgba(16,185,129,0.6)' : '0 0 6px rgba(245,158,11,0.6)' }} />
          <span className="db-label">{dbStatus.connected ? 'MongoDB Atlas' : 'In-memory Mode'}</span>
        </div>
        <button className="nav-item settings">
          <div className="nav-icon-wrap"><Settings size={18} /></div>
          <span className="nav-label">Pengaturan</span>
        </button>
      </div>

    </aside>
  );
}
