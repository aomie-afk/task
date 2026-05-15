'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, CheckCircle2, Clock, TrendingUp, Calendar as CalIcon, Zap, ListTodo } from 'lucide-react';
import ActivityChart from '@/components/ActivityChart';
import TaskModal from '@/components/TaskModal';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ todo: 0, inprogress: 0, done: 0, total: 0 });

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      const json = await res.json();
      if (json.success) {
        setTasks(json.data);
        calcStats(json.data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  function calcStats(data) {
    setStats({
      todo: data.filter(t => t.status === 'Todo').length,
      inprogress: data.filter(t => t.status === 'In Progress').length,
      done: data.filter(t => t.status === 'Done').length,
      total: data.length,
    });
  }

  const addQuickTask = async () => {
    if (!quickInput.trim()) return;
    const title = quickInput.trim();
    setQuickInput('');
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category: 'Kerja', status: 'Todo', priority: 'Medium' }),
      });
      fetchTasks();
    } catch (e) { console.error(e); }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const completionRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <header className="dash-header">
        <div>
          <h1>Selamat Datang 👋</h1>
          <p className="subtitle">{dateStr}</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Task Baru
        </button>
      </header>

      {/* Quick Add Bar */}
      <div className="quick-bar glass">
        <Zap size={18} style={{ color: '#a78bfa', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Ketik task baru... (Enter untuk menyimpan)"
          value={quickInput}
          onChange={e => setQuickInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addQuickTask()}
        />
        <button className="quick-save" onClick={addQuickTask}>Tambah</button>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card glass glass-hover">
          <div className="stat-icon" style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8' }}>
            <ListTodo size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-label">Belum Mulai</span>
            <span className="stat-num">{loading ? '—' : stats.todo}</span>
          </div>
        </div>
        <div className="stat-card glass glass-hover">
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
            <Clock size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-label">Sedang Berjalan</span>
            <span className="stat-num">{loading ? '—' : stats.inprogress}</span>
          </div>
        </div>
        <div className="stat-card glass glass-hover">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-label">Selesai</span>
            <span className="stat-num">{loading ? '—' : stats.done}</span>
          </div>
        </div>
        <div className="stat-card glass glass-hover">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
            <TrendingUp size={20} />
          </div>
          <div className="stat-body">
            <span className="stat-label">Tingkat Selesai</span>
            <span className="stat-num">{loading ? '—' : `${completionRate}%`}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass progress-section">
        <div className="progress-header">
          <span>Progress Keseluruhan</span>
          <span className="progress-pct">{completionRate}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${completionRate}%` }} />
        </div>
      </div>

      {/* Activity Chart */}
      <div className="section-header">
        <h2>Aktivitas 7 Hari Terakhir</h2>
        <span className="badge-info">Real-time</span>
      </div>
      <div className="glass chart-wrap">
        <ActivityChart tasks={tasks} />
      </div>

      {/* Recent Tasks */}
      <div className="section-header" style={{ marginTop: '2rem' }}>
        <h2>Task Terbaru</h2>
        <a href="/board" className="see-all">Lihat Semua →</a>
      </div>
      <div className="recent-tasks">
        {tasks.slice(0, 5).map(t => (
          <div key={t._id} className="recent-row glass glass-hover">
            <div className={`status-pill ${t.status.toLowerCase().replace(' ', '-')}`}>
              {t.status}
            </div>
            <span className="recent-title">{t.title}</span>
            <span className="recent-cat">{t.category}</span>
            <span className={`prio-dot ${t.priority.toLowerCase()}`} />
          </div>
        ))}
        {tasks.length === 0 && !loading && (
          <div className="empty-msg glass">Belum ada task. Tambahkan task pertama Anda! 🚀</div>
        )}
      </div>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} task={null} onSave={fetchTasks} />

      <style jsx>{`
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .subtitle { color: var(--text-muted); margin-top: 0.25rem; }

        .quick-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1.25rem;
          border-radius: 14px;
          border: 1px solid rgba(139,92,246,0.25);
          margin-bottom: 1.75rem;
        }
        .quick-bar input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 0.95rem;
          outline: none;
        }
        .quick-bar input::placeholder { color: #475569; }
        .quick-save {
          background: rgba(139,92,246,0.15);
          color: #a78bfa;
          border: 1px solid rgba(139,92,246,0.3);
          padding: 0.35rem 0.9rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quick-save:hover { background: #8b5cf6; color: white; }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
        }
        .stat-icon {
          padding: 0.65rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-body { display: flex; flex-direction: column; }
        .stat-label { font-size: 0.78rem; color: var(--text-muted); font-weight: 500; }
        .stat-num { font-size: 1.75rem; font-weight: 800; line-height: 1.2; }

        .progress-section {
          padding: 1.25rem 1.5rem;
          border-radius: 14px;
          margin-bottom: 2rem;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .progress-pct { color: white; }
        .progress-track {
          height: 8px;
          background: rgba(255,255,255,0.06);
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          border-radius: 999px;
          transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .section-header h2 { font-size: 1.1rem; font-weight: 700; }
        .badge-info {
          background: rgba(139,92,246,0.15);
          color: #a78bfa;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          border: 1px solid rgba(139,92,246,0.25);
        }
        .see-all {
          font-size: 0.85rem;
          color: #a78bfa;
          text-decoration: none;
          font-weight: 600;
        }
        .see-all:hover { color: white; }

        .chart-wrap {
          height: 320px;
          padding: 1.25rem;
          border-radius: 16px;
        }

        .recent-tasks { display: flex; flex-direction: column; gap: 0.6rem; }
        .recent-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.25rem;
          border-radius: 12px;
          cursor: default;
        }
        .recent-title {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .recent-cat {
          font-size: 0.78rem;
          color: var(--text-muted);
          background: rgba(255,255,255,0.05);
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
        }
        .prio-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .prio-dot.high { background: #ef4444; box-shadow: 0 0 6px #ef444466; }
        .prio-dot.medium { background: #f59e0b; box-shadow: 0 0 6px #f59e0b66; }
        .prio-dot.low { background: #10b981; box-shadow: 0 0 6px #10b98166; }

        .status-pill {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.65rem;
          border-radius: 999px;
          white-space: nowrap;
        }
        .status-pill.todo { background: rgba(100,116,139,0.2); color: #94a3b8; }
        .status-pill.in-progress { background: rgba(59,130,246,0.15); color: #60a5fa; }
        .status-pill.done { background: rgba(16,185,129,0.15); color: #34d399; }

        .empty-msg {
          text-align: center;
          padding: 2rem;
          color: var(--text-muted);
          border-radius: 12px;
          border: 1px dashed rgba(255,255,255,0.07);
        }

        h1 {
          font-size: 1.8rem;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
