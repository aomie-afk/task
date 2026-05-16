'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Plus, Search, SlidersHorizontal, MoreVertical, X, GripVertical } from 'lucide-react';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import DroppableColumn from '@/components/DroppableColumn';

const COLUMNS = [
  { key: 'Todo', label: 'Belum Mulai', color: '#64748b' },
  { key: 'In Progress', label: 'Sedang Berjalan', color: '#3b82f6' },
  { key: 'Done', label: 'Selesai', color: '#10b981' },
];

import { getTasks } from '@/app/actions/data';

const CATEGORIES = ['Semua', 'Kerja', 'Pribadi', 'Kesehatan', 'Keuangan', 'Lainnya'];
const PRIORITIES = ['Semua', 'High', 'Medium', 'Low'];

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Semua');
  const [prioFilter, setPrioFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const json = await getTasks();
      if (json.success) setTasks(json.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const updateStatus = async (id, newStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) { fetchTasks(); }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t._id === active.id);
    const overId = over.id;

    // Check if dragging over a column
    const isOverColumn = COLUMNS.some(col => col.key === overId);
    
    if (isOverColumn) {
      if (activeTask.status !== overId) {
        setTasks(prev => prev.map(t => t._id === active.id ? { ...t, status: overId } : t));
      }
      return;
    }

    // Check if dragging over another task
    const overTask = tasks.find(t => t._id === overId);
    if (overTask && activeTask.status !== overTask.status) {
      setTasks(prev => prev.map(t => t._id === active.id ? { ...t, status: overTask.status } : t));
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTask = tasks.find(t => t._id === active.id);
    let newStatus = activeTask.status;

    // If over a column
    if (COLUMNS.some(col => col.key === over.id)) {
      newStatus = over.id;
    } else {
      // If over another task
      const overTask = tasks.find(t => t._id === over.id);
      if (overTask) newStatus = overTask.status;
    }

    if (activeTask.status !== newStatus) {
      updateStatus(active.id, newStatus);
    }
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Semua' || t.category === catFilter;
    const matchPrio = prioFilter === 'Semua' || t.priority === prioFilter;
    return matchSearch && matchCat && matchPrio;
  });

  const openEdit = (task) => { setSelectedTask(task); setIsModalOpen(true); };
  const openCreate = () => { setSelectedTask(null); setIsModalOpen(true); };

  return (
    <div className="board-page animate-fade-in">
      {/* Header */}
      <div className="board-header">
        <div>
          <h1>Task Board</h1>
          <p className="subtitle">Kelola dan pantau progres semua tugas Anda.</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={18} /> Tambah Task
        </button>
      </div>

      {/* Controls */}
      <div className="controls-bar glass">
        <div className="search-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari task..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="clear-search" onClick={() => setSearch('')}><X size={14} /></button>}
        </div>
        <button className={`filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={16} /> Filter
        </button>
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="filter-bar glass animate-fade-in">
          <div className="filter-group">
            <label>Kategori</label>
            <div className="pill-group">
              {CATEGORIES.map(c => (
                <button key={c} className={`pill ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
              ))}
            </div>
          </div>
          <div className="filter-divider" />
          <div className="filter-group">
            <label>Prioritas</label>
            <div className="pill-group">
              {PRIORITIES.map(p => (
                <button key={p} className={`pill ${prioFilter === p ? 'active' : ''}`} onClick={() => setPrioFilter(p)}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board with DndContext */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {COLUMNS.map(col => (
            <DroppableColumn
              key={col.key}
              col={col}
              tasks={filtered.filter(t => t.status === col.key)}
              loading={loading}
              openCreate={openCreate}
              onStatusChange={updateStatus}
              onEdit={openEdit}
              onRefresh={fetchTasks}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeId ? (
            <div className="task-card glass" style={{ 
              opacity: 0.8, 
              cursor: 'grabbing',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              transform: 'scale(1.05)',
              padding: '1.1rem',
              borderRadius: '14px',
              border: '1px solid var(--accent)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <GripVertical size={14} style={{ color: '#475569' }} />
                <span className="prio-chip" style={{ 
                  background: 'rgba(139,92,246,0.12)', 
                  color: '#a78bfa',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.18rem 0.6rem',
                  borderRadius: '6px'
                }}>
                  {tasks.find(t => t._id === activeId)?.priority}
                </span>
              </div>
              <h4 className="card-title" style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                {tasks.find(t => t._id === activeId)?.title}
              </h4>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSave={fetchTasks}
      />

      <style jsx>{`
        .board-page { height: 100%; display: flex; flex-direction: column; }

        .board-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .subtitle { color: var(--text-muted); margin-top: 0.25rem; }

        .controls-bar {
          display: flex;
          gap: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          align-items: center;
        }
        .search-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--text-muted);
          position: relative;
        }
        .search-wrap input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          outline: none;
          font-size: 0.9rem;
        }
        .search-wrap input::placeholder { color: #475569; }
        .clear-search {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-muted);
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-toggle.active {
          background: rgba(139,92,246,0.15);
          border-color: rgba(139,92,246,0.3);
          color: #a78bfa;
        }

        .filter-bar {
          display: flex;
          gap: 2rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .filter-group label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 0.5rem;
        }
        .pill-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .pill {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-muted);
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pill.active {
          background: rgba(139,92,246,0.2);
          border-color: rgba(139,92,246,0.4);
          color: #c4b5fd;
        }
        .pill:hover:not(.active) {
          background: rgba(255,255,255,0.08);
          color: white;
        }
        .filter-divider {
          width: 1px;
          background: rgba(255,255,255,0.06);
          align-self: stretch;
        }
      `}</style>
    </div>
  );
}
