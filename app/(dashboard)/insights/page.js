'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart,
  Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { Brain, Zap, Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
      <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#a78bfa', fontWeight: 700 }}>{p.value} task</p>
      ))}
    </div>
  );
};

export default function Insights() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState({
    busyLevel: 'Menganalisis...', recommendation: '',
    categoryData: [], priorityData: [], weeklyData: [], hourlyData: [], radarData: [],
    completionRate: 0, avgPriority: 0, activeTasks: 0,
  });

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      const json = await res.json();
      if (json.success) {
        setTasks(json.data);
        processAnalysis(json.data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  function processAnalysis(data) {
    const active = data.filter(t => t.status !== 'Done').length;
    const done = data.filter(t => t.status === 'Done').length;
    const compRate = data.length ? Math.round((done / data.length) * 100) : 0;

    // Busy level
    let busyLevel = 'Optimal';
    let recommendation = 'Beban kerja Anda seimbang! Pertahankan ritme ini.';
    let busyColor = '#10b981';
    if (active > 10) { busyLevel = 'Kelebihan Beban'; recommendation = 'Pertimbangkan mendelegasikan atau menunda task prioritas rendah.'; busyColor = '#ef4444'; }
    else if (active > 6) { busyLevel = 'Sibuk'; recommendation = 'Anda menangani banyak task. Fokus pada prioritas tinggi dulu.'; busyColor = '#f59e0b'; }
    else if (active === 0) { busyLevel = 'Idle'; recommendation = 'Waktunya merencanakan proyek baru!'; busyColor = '#94a3b8'; }

    // Category breakdown
    const catMap = data.reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {});
    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    // Priority breakdown
    const prioMap = data.reduce((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {});
    const priorityData = ['High', 'Medium', 'Low'].map(p => ({ name: p, value: prioMap[p] || 0 }));

    // Weekly (last 7 days)
    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const created = data.filter(t => new Date(t.createdAt).toDateString() === d.toDateString()).length;
      const finished = data.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === d.toDateString()).length;
      return { name: dayStr, Dibuat: created, Selesai: finished };
    });

    // Hourly
    const hourMap = data.reduce((acc, t) => {
      const h = new Date(t.createdAt).getHours();
      acc[h] = (acc[h] || 0) + 1;
      return acc;
    }, {});
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i % 6 === 0 ? `${i}:00` : '',
      count: hourMap[i] || 0,
    }));

    // Radar: productivity dimensions
    const radarData = [
      { subject: 'Selesai', value: compRate },
      { subject: 'Konsistensi', value: Math.min(100, weeklyData.filter(d => d.Dibuat > 0).length * 14) },
      { subject: 'Prioritas', value: Math.round(((prioMap.High || 0) / (data.length || 1)) * 100) },
      { subject: 'Fokus', value: Math.min(100, done * 10) },
      { subject: 'Balance', value: Math.min(100, categoryData.length * 20) },
    ];

    setAnalysis({ busyLevel, recommendation, busyColor, categoryData, priorityData, weeklyData, hourlyData, radarData, completionRate: compRate, activeTasks: active });
  }

  return (
    <div className="insights-page animate-fade-in">
      <header>
        <h1>Analisis Produktivitas</h1>
        <p className="subtitle">Wawasan mendalam tentang pola kerja dan efisiensi Anda.</p>
      </header>

      {/* Hero Card */}
      <div className="hero-card glass" style={{ borderColor: `${analysis.busyColor}33` }}>
        <div className="hero-left">
          <div className="busy-badge" style={{ background: `${analysis.busyColor}20`, color: analysis.busyColor, borderColor: `${analysis.busyColor}44` }}>
            {analysis.busyLevel}
          </div>
          <div className="ai-row">
            <Brain size={36} style={{ color: '#a78bfa', flexShrink: 0 }} />
            <div>
              <p className="ai-label">Rekomendasi AI</p>
              <p className="ai-text">{analysis.recommendation}</p>
            </div>
          </div>
        </div>
        <div className="hero-stats">
          <div className="hs">
            <span className="hs-num" style={{ color: '#3b82f6' }}>{analysis.activeTasks}</span>
            <span className="hs-label">Task Aktif</span>
          </div>
          <div className="hs-divider" />
          <div className="hs">
            <span className="hs-num" style={{ color: '#10b981' }}>{analysis.completionRate}%</span>
            <span className="hs-label">Tingkat Selesai</span>
          </div>
          <div className="hs-divider" />
          <div className="hs">
            <span className="hs-num" style={{ color: '#8b5cf6' }}>{tasks.length}</span>
            <span className="hs-label">Total Task</span>
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="chart-section">
        <div className="section-label"><TrendingUp size={16} /> Aktivitas Mingguan</div>
        <div className="glass chart-box" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analysis.weeklyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }} />
              <Area type="monotone" dataKey="Dibuat" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradCreated)" dot={false} />
              <Area type="monotone" dataKey="Selesai" stroke="#10b981" strokeWidth={2} fill="url(#gradDone)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Peak */}
      <div className="chart-section">
        <div className="section-label"><Zap size={16} /> Jam Puncak Produktivitas</div>
        <div className="glass chart-box" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analysis.hourlyData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="url(#barGrad)" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: Pie + Radar */}
      <div className="bottom-grid">
        <div className="chart-section">
          <div className="section-label"><Target size={16} /> Distribusi Kategori</div>
          <div className="glass chart-box" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analysis.categoryData} cx="50%" cy="45%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value">
                  {analysis.categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-section">
          <div className="section-label"><Brain size={16} /> Skor Produktivitas</div>
          <div className="glass chart-box" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={analysis.radarData} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Radar name="Skor" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style jsx>{`
        .insights-page { max-width: 1100px; margin: 0 auto; }
        .subtitle { color: var(--text-muted); margin-top: 0.25rem; margin-bottom: 2rem; }

        .hero-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.75rem 2rem;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 2rem;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .hero-left { display: flex; flex-direction: column; gap: 1rem; flex: 1; }
        .busy-badge {
          display: inline-block;
          padding: 0.3rem 1rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border: 1px solid;
          width: fit-content;
        }
        .ai-row { display: flex; align-items: flex-start; gap: 1rem; }
        .ai-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
        .ai-text { font-size: 0.95rem; color: white; line-height: 1.5; }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .hs { display: flex; flex-direction: column; align-items: center; }
        .hs-num { font-size: 2.25rem; font-weight: 800; }
        .hs-label { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; }
        .hs-divider { width: 1px; height: 48px; background: rgba(255,255,255,0.07); }

        .section-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .chart-section { margin-bottom: 1.5rem; }
        .chart-box {
          padding: 1.25rem;
          border-radius: 16px;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 700px) {
          .bottom-grid { grid-template-columns: 1fr; }
        }

        h1 { font-size: 1.8rem; margin-bottom: 0; }
      `}</style>
    </div>
  );
}
