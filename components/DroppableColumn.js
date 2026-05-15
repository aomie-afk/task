'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTaskCard from './SortableTaskCard';
import { Plus, Inbox } from 'lucide-react';

export default function DroppableColumn({ col, tasks, loading, openCreate, onStatusChange, onRefresh, onEdit }) {
  const { setNodeRef } = useDroppable({
    id: col.key,
  });

  return (
    <div className="kanban-col">
      {/* Column Header */}
      <div className="col-header">
        <div className="col-title-row">
          <span className="col-dot" style={{ background: col.color, boxShadow: `0 0 8px ${col.color}88` }} />
          <h3>{col.label}</h3>
          <span className="col-count">{tasks.length}</span>
        </div>
        <button className="btn-icon-sm" onClick={openCreate}>
          <Plus size={16} />
        </button>
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="col-body">
        {loading && (
          <>
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </>
        )}
        {!loading && tasks.length === 0 && (
          <div className="empty-col">
            <div className="empty-icon-wrap">
              <Inbox size={24} />
            </div>
            <span>Kosong</span>
            <button className="empty-add" onClick={openCreate}>+ Tambah</button>
          </div>
        )}
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {!loading && tasks.map(task => (
            <SortableTaskCard
              key={task._id}
              task={task}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onRefresh={onRefresh}
            />
          ))}
        </SortableContext>
      </div>

      <style jsx>{`
        .empty-icon-wrap {
          background: rgba(255,255,255,0.03);
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}
