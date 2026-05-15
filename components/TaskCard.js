'use client';

import { 
  ChevronRight, CheckCircle2, Calendar, Tag, Trash2, 
  MoreVertical, Edit2, GripVertical, Briefcase, 
  User, Heart, Wallet, Circle 
} from 'lucide-react';
import { useState } from 'react';

const PRIO_MAP = {
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Low:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

const CAT_ICONS = {
  'Kerja': Briefcase,
  'Pribadi': User,
  'Kesehatan': Heart,
  'Keuangan': Wallet,
  'Lainnya': Tag,
};

const STATUS_NEXT = { 'Todo': 'In Progress', 'In Progress': 'Done' };
const STATUS_LABEL = { 'Todo': 'Mulai', 'In Progress': 'Selesaikan' };

export default function TaskCard({ task, onStatusChange, onEdit, onRefresh, attributes, listeners, setNodeRef, style }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const prio = PRIO_MAP[task.priority] || PRIO_MAP.Medium;

  const handleDelete = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (!confirm('Hapus task ini?')) return;
    try {
      await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
      onRefresh?.();
    } catch (e) { console.error(e); }
  };

  const handleAdvance = (e) => {
    e.stopPropagation();
    if (STATUS_NEXT[task.status]) onStatusChange(task._id, STATUS_NEXT[task.status]);
  };

  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    : null;

  const isOverdue = task.dueDate && task.status !== 'Done' && new Date(task.dueDate) < new Date();
  const CatIcon = CAT_ICONS[task.category] || Tag;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="task-card glass glass-hover" 
      onClick={() => onEdit(task)}
    >
      {/* Top row */}
      <div className="card-top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GripVertical size={14} style={{ color: '#475569', cursor: 'grab' }} />
          <span className="prio-chip" style={{ background: prio.bg, color: prio.color }}>
            {task.priority}
          </span>
        </div>
        <div className="card-menu-wrap" onClick={e => e.stopPropagation()}>
          <button className="menu-btn" onClick={() => setMenuOpen(o => !o)}>
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="dropdown">
              <button className="dd-item" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(task); }}>
                <Edit2 size={14} /> Edit
              </button>
              <button className="dd-item danger" onClick={handleDelete}>
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title & Desc */}
      <h4 className="card-title">{task.title}</h4>
      {task.description && <p className="card-desc">{task.description}</p>}

      {/* Meta */}
      <div className="card-meta">
        {dueDateStr && (
          <span className={`meta-item ${isOverdue ? 'overdue' : ''}`}>
            <Calendar size={12} />
            {isOverdue ? '⚠ ' : ''}{dueDateStr}
          </span>
        )}
        <span className="meta-item">
          <CatIcon size={12} />
          {task.category}
        </span>
      </div>

      {/* Action */}
      <div className="card-footer">
        {task.status === 'Done' ? (
          <div className="done-badge">
            <CheckCircle2 size={14} />
            Selesai
          </div>
        ) : (
          <button className="advance-btn" onClick={handleAdvance}>
            {STATUS_LABEL[task.status]}
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      <style jsx>{`
        .task-card {
          padding: 1.1rem;
          cursor: pointer;
          border-radius: 14px;
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.65rem;
        }
        .prio-chip {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.18rem 0.6rem;
          border-radius: 6px;
          letter-spacing: 0.04em;
        }
        .card-menu-wrap { position: relative; }
        .menu-btn {
          background: transparent;
          border: none;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 2px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .menu-btn:hover { color: white; background: rgba(255,255,255,0.06); }

        .dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 4px);
          background: #1a1a2e;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0.4rem;
          z-index: 10;
          min-width: 110px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .dd-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 0.5rem 0.6rem;
          border-radius: 7px;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .dd-item:hover { background: rgba(255,255,255,0.06); color: white; }
        .dd-item.danger:hover { background: rgba(239,68,68,0.1); color: #f87171; }

        .card-title {
          font-weight: 600;
          font-size: 0.92rem;
          margin-bottom: 0.35rem;
          line-height: 1.4;
        }
        .card-desc {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.45;
          margin-bottom: 0.85rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-meta {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
          flex-wrap: wrap;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.73rem;
          color: #64748b;
          font-weight: 500;
        }
        .meta-item.overdue { color: #f87171; }

        .card-footer {
          display: flex;
          justify-content: flex-end;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .advance-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(139,92,246,0.1);
          color: #a78bfa;
          border: 1px solid rgba(139,92,246,0.2);
          padding: 0.35rem 0.8rem;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .advance-btn:hover { background: #8b5cf6; color: white; border-color: #8b5cf6; }
        .done-badge {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #34d399;
        }
      `}</style>
    </div>
  );
}
