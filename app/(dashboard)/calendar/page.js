'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon } from 'lucide-react';
import TaskModal from '@/components/TaskModal';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function getPrioColor(p) {
  if (p === 'High') return '#ef4444';
  if (p === 'Medium') return '#f59e0b';
  return '#10b981';
}

export default function CalendarPage() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      const json = await res.json();
      if (json.success) setTasks(json.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Build calendar grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const getTasksForDay = (day) => {
    const d = new Date(year, month, day);
    const dStr = d.toDateString();
    return tasks.filter(t => {
      if (t.dueDate && new Date(t.dueDate).toDateString() === dStr) return true;
      if (new Date(t.createdAt).toDateString() === dStr) return true;
      return false;
    });
  };

  const selectedDayTasks = getTasksForDay(selectedDay);
  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const openCreate = () => { setSelectedTask(null); setIsModalOpen(true); };
  const openEdit = (t) => { setSelectedTask(t); setIsModalOpen(true); };

  // Cells: leading blanks + days
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="cal-page animate-fade-in">
      <header className="cal-header">
        <div>
          <h1>Kalender Task</h1>
          <p className="subtitle">Lihat semua task berdasarkan tanggal.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} /> Tambah Task
        </button>
      </header>

      <div className="cal-layout">
        {/* Calendar */}
        <div className="glass cal-card">
          {/* Month Nav */}
          <div className="month-nav">
            <button className="nav-btn" onClick={prevMonth}><ChevronLeft size={20} /></button>
            <h2 className="month-label">{MONTHS[month]} {year}</h2>
            <button className="nav-btn" onClick={nextMonth}><ChevronRight size={20} /></button>
          </div>

          {/* Day Names */}
          <div className="day-names">
            {DAYS.map(d => <div key={d} className="day-name">{d}</div>)}
          </div>

          {/* Grid */}
          <div className="cal-grid">
            {cells.map((day, idx) => {
              if (!day) return <div key={`blank-${idx}`} className="cal-cell blank" />;
              const dayTasks = getTasksForDay(day);
              const isSelected = day === selectedDay;
              const isTodayDay = isToday(day);

              return (
                <div
                  key={day}
                  className={`cal-cell ${isSelected ? 'selected' : ''} ${isTodayDay ? 'today' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span className="day-num">{day}</span>
                  {dayTasks.length > 0 && (
                    <div className="task-dots">
                      {dayTasks.slice(0, 3).map((t, i) => (
                        <span key={i} className="dot" style={{ background: getPrioColor(t.priority) }} />
                      ))}
                      {dayTasks.length > 3 && <span className="dot-more">+{dayTasks.length - 3}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="legend">
            <div className="leg-item"><span className="dot" style={{ background: '#ef4444' }} /> Prioritas Tinggi</div>
            <div className="leg-item"><span className="dot" style={{ background: '#f59e0b' }} /> Sedang</div>
            <div className="leg-item"><span className="dot" style={{ background: '#10b981' }} /> Rendah</div>
          </div>
        </div>

        {/* Day Detail */}
        <div className="day-detail">
          <div className="detail-header">
            <div className="detail-date">
              <CalIcon size={18} style={{ color: '#a78bfa' }} />
              <h3>{selectedDay} {MONTHS[month]} {year}</h3>
            </div>
            <span className="task-count-badge">{selectedDayTasks.length} task</span>
          </div>

          <div className="day-tasks">
            {selectedDayTasks.length === 0 && (
              <div className="no-tasks glass">
                <p>Tidak ada task di tanggal ini.</p>
                <button className="btn-add-task" onClick={openCreate}>+ Tambah Task</button>
              </div>
            )}
            {selectedDayTasks.map(task => (
              <div
                key={task._id}
                className="day-task-item glass glass-hover"
                onClick={() => openEdit(task)}
                style={{ borderLeft: `3px solid ${getPrioColor(task.priority)}` }}
              >
                <div className="dti-top">
                  <span className={`status-chip s-${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span>
                  <span className="dti-cat">{task.category}</span>
                </div>
                <p className="dti-title">{task.title}</p>
                {task.description && <p className="dti-desc">{task.description}</p>}
                {task.dueDate && (
                  <p className="dti-due">📅 Tenggat: {new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} task={selectedTask} onSave={fetchTasks} />

      <style jsx>{`
        .cal-page { max-width: 1100px; margin: 0 auto; }
        .cal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.75rem;
        }
        .subtitle { color: var(--text-muted); margin-top: 0.25rem; }
        h1 { font-size: 1.8rem; margin-bottom: 0; }

        .cal-layout {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 800px) {
          .cal-layout { grid-template-columns: 1fr; }
        }

        .cal-card { padding: 1.5rem; border-radius: 18px; }

        .month-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .month-label { font-size: 1.1rem; font-weight: 700; }
        .nav-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-muted);
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.1); color: white; }

        .day-names {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          margin-bottom: 0.5rem;
        }
        .day-name {
          text-align: center;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          padding: 0.3rem 0;
        }

        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .cal-cell {
          aspect-ratio: 1;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px 4px;
          cursor: pointer;
          transition: all 0.15s;
          position: relative;
          border: 1px solid transparent;
          gap: 3px;
        }
        .cal-cell.blank { cursor: default; }
        .cal-cell:not(.blank):hover {
          background: rgba(255,255,255,0.05);
        }
        .cal-cell.today .day-num {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
        }
        .cal-cell.selected {
          background: rgba(139,92,246,0.12);
          border-color: rgba(139,92,246,0.3);
        }
        .day-num {
          font-size: 0.8rem;
          font-weight: 500;
          line-height: 1;
        }
        .task-dots {
          display: flex;
          gap: 3px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-more {
          font-size: 0.55rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .legend {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .leg-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Day Detail */
        .day-detail { display: flex; flex-direction: column; gap: 1rem; }
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .detail-date {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .detail-date h3 { font-size: 1rem; font-weight: 700; }
        .task-count-badge {
          background: rgba(139,92,246,0.15);
          color: #a78bfa;
          border: 1px solid rgba(139,92,246,0.25);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.2rem 0.7rem;
          border-radius: 999px;
        }

        .day-tasks { display: flex; flex-direction: column; gap: 0.75rem; }
        .no-tasks {
          padding: 2.5rem;
          border-radius: 14px;
          text-align: center;
          color: var(--text-muted);
          border: 1px dashed rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .btn-add-task {
          background: transparent;
          border: none;
          color: #a78bfa;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .day-task-item {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          cursor: pointer;
          border-left-width: 3px !important;
          border-left-style: solid;
        }
        .dti-top {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .status-chip {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.18rem 0.55rem;
          border-radius: 999px;
        }
        .status-chip.s-todo { background: rgba(100,116,139,0.2); color: #94a3b8; }
        .status-chip.s-in-progress { background: rgba(59,130,246,0.15); color: #60a5fa; }
        .status-chip.s-done { background: rgba(16,185,129,0.15); color: #34d399; }
        .dti-cat {
          font-size: 0.72rem;
          color: var(--text-muted);
          background: rgba(255,255,255,0.05);
          padding: 0.15rem 0.55rem;
          border-radius: 6px;
        }
        .dti-title {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 0.3rem;
        }
        .dti-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        .dti-due { font-size: 0.78rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
