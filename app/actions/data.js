'use server';

import { getSession, deleteSession } from '@/lib/session';

async function getDB() {
  try {
    const dbConnect = (await import('@/lib/db')).default;
    const User = (await import('@/models/User')).default;
    const Task = (await import('@/models/Task')).default;
    await dbConnect();
    return { type: 'mongo', User, Task };
  } catch (error) {
    const { userMemoryStore, memoryStore } = await import('@/lib/memoryStore');
    return { type: 'memory', User: userMemoryStore, Task: memoryStore };
  }
}

export async function getProfile() {
  const session = await getSession();
  if (!session || !session.userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const db = await getDB();
  let user;

  if (db.type === 'mongo') {
    user = await db.User.findById(session.userId).select('name email');
  } else {
    user = db.User.findById(session.userId);
  }

  if (!user) {
    await deleteSession();
    return { success: false, error: 'User not found or session invalid' };
  }

  // Convert to plain object to pass to client
  return { 
    success: true, 
    data: { 
      _id: user._id.toString(), 
      name: user.name, 
      email: user.email 
    } 
  };
}

export async function getTasks(query = {}) {
  const session = await getSession();
  if (!session || !session.userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const db = await getDB();
  
  if (db.type === 'mongo') {
    const mongoQuery = { user: session.userId };
    if (query.category) mongoQuery.category = query.category;
    if (query.status) mongoQuery.status = query.status;
    if (query.date) {
      const start = new Date(query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      mongoQuery.createdAt = { $gte: start, $lt: end };
    }
    const tasks = await db.Task.find(mongoQuery).sort({ createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(tasks)) };
  } else {
    // Memory store
    const tasks = db.Task.getAll(query).filter(t => t.user === session.userId || !t.user); // if no user, show default
    return { success: true, data: JSON.parse(JSON.stringify(tasks)) };
  }
}
