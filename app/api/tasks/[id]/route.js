import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';
import { getSession } from '@/lib/session';

async function getDB() {
  try {
    const dbConnect = (await import('@/lib/db')).default;
    const Task = (await import('@/models/Task')).default;
    await dbConnect();
    return { type: 'mongo', Task };
  } catch {
    return { type: 'memory' };
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDB();
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (db.type === 'mongo') {
      if (body.status === 'Done') body.completedAt = new Date();
      const task = await db.Task.findOneAndUpdate({ _id: id, user: session.userId }, body, { new: true, runValidators: true });
      if (!task) return NextResponse.json({ success: false, error: 'Task not found or unauthorized' }, { status: 404 });
      return NextResponse.json({ success: true, data: task });
    }

    const task = memoryStore.update(id, body);
    if (!task) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await getDB();
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (db.type === 'mongo') {
      const result = await db.Task.deleteOne({ _id: id, user: session.userId });
      if (!result.deletedCount) return NextResponse.json({ success: false, error: 'Task not found or unauthorized' }, { status: 404 });
      return NextResponse.json({ success: true, data: {} });
    }

    const deleted = memoryStore.delete(id);
    if (!deleted) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
