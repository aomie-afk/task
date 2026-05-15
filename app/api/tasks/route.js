import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';

// Try to use MongoDB, fall back to in-memory store
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      category: searchParams.get('category'),
      status: searchParams.get('status'),
      date: searchParams.get('date'),
    };
    // Remove nulls
    Object.keys(query).forEach(k => query[k] == null && delete query[k]);

    const db = await getDB();

    if (db.type === 'mongo') {
      const mongoQuery = {};
      if (query.category) mongoQuery.category = query.category;
      if (query.status) mongoQuery.status = query.status;
      if (query.date) {
        const start = new Date(query.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(query.date);
        end.setHours(23, 59, 59, 999);
        mongoQuery.createdAt = { $gte: start, $lte: end };
      }
      const tasks = await db.Task.find(mongoQuery).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: tasks });
    }

    // Fallback to memory store
    const tasks = memoryStore.getAll(query);
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('GET /api/tasks error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDB();

    if (db.type === 'mongo') {
      const task = await db.Task.create(body);
      return NextResponse.json({ success: true, data: task }, { status: 201 });
    }

    const task = memoryStore.create(body);
    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
