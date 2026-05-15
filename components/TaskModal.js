'use client';

import { useState, useEffect } from 'react';
import { X, Save, Trash2, Loader } from 'lucide-react';

const CATEGORIES = ['Kerja', 'Pribadi', 'Kesehatan', 'Keuangan', 'Lainnya'];
const PRIORITIES  = ['High', 'Medium', 'Low'];
const STATUSES    = ['Todo', 'In Progress', 'Done'];

const EMPTY = {
  title: '', description: '', category: 'Kerja',
  priority: 'Medium', status: 'Todo', dueDate: '',
};

export default function TaskModal({ isOpen, onClose, task, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'Kerja',
        priority: task.priority || 'Medium',
        status: task.status || 'Todo',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const url = task ? `/api/tasks/${task._id}` : '/api/tasks';
      const method = task ? 'PATCH' : 'POST';
      const body = { ...form };
      if (!body.dueDate) delete body.dueDate;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if ((await res.json()).success) { onSave(); onClose(); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Hapus task ini secara permanen?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
      if ((await res.json()).success) { onSave(); onClose(); }
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal glass animate-fade-in">
        {/* Header */}
        <div className="modal-head">
          <h2>{task ? 'Edit Task' : 'Task Baru'}</h2>
          <button className="close-btn" onClick={onClose}><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="field">
            <label>Judul <span className="req">*</span></label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Apa yang perlu diselesaikan?"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="field">
            <label>Deskripsi</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Tambahkan detail atau catatan..."
            />
          </div>

          {/* Row: Category + Priority */}
          <div className="field-row">
            <div className="field">
              <label>Kategori</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Prioritas</label>
              <div className="prio-picker">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`prio-btn prio-${p.toLowerCase()} ${form.priority === p ? 'active' : ''}`}
                    onClick={() => set('priority', p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row: Due Date + Status */}
          <div className="field-row">
            <div className="field">
              <label>Tenggat</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            {task && (
              <button type="button" className="btn-del" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader size={16} className="spin" /> : <Trash2 size={16} />}
                Hapus
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? <Loader size={16} className="spin" /> : <Save size={16} />}
              {task ? 'Simpan' : 'Buat Task'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal {
          width: 100%;
          max-width: 520px;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.6);
        }
        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.75rem;
        }
        .modal-head h2 { font-size: 1.2rem; font-weight: 800; }
        .close-btn {
          background: rgba(255,255,255,0.06);
          border: none;
          color: #94a3b8;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .close-btn:hover { background: rgba(255,255,255,0.1); color: white; }

        .field {
          margin-bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .field label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .req { color: #f87171; }
        .field input,
        .field textarea,
        .field select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 0.7rem 0.9rem;
          outline: none;
          transition: border-color 0.2s;
          resize: vertical;
          width: 100%;
        }
        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: rgba(139,92,246,0.5);
        }

        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .prio-picker { display: flex; gap: 0.5rem; }
        .prio-btn {
          flex: 1;
          padding: 0.6rem;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #64748b;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .prio-btn.prio-high.active   { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }
        .prio-btn.prio-medium.active { background: rgba(245,158,11,0.15); color: #fbbf24; border-color: rgba(245,158,11,0.3); }
        .prio-btn.prio-low.active    { background: rgba(16,185,129,0.15); color: #34d399; border-color: rgba(16,185,129,0.3); }
        .prio-btn:hover:not(.active) { background: rgba(255,255,255,0.07); color: white; }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-top: 0.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .btn-del {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(239,68,68,0.08);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.2);
          padding: 0.6rem 1rem;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-del:hover { background: rgba(239,68,68,0.15); }
        .btn-cancel {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.09);
          color: #64748b;
          padding: 0.6rem 1.1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-cancel:hover { border-color: rgba(255,255,255,0.2); color: white; }
        .btn-save {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
        }
        .btn-save:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-save:disabled, .btn-del:disabled { opacity: 0.5; cursor: not-allowed; }

        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
