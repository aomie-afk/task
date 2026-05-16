import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

async function getUserDB() {
  try {
    const dbConnect = (await import('@/lib/db')).default;
    const User = (await import('@/models/User')).default;
    await dbConnect();
    return { type: 'mongo', User };
  } catch (error) {
    const { userMemoryStore } = await import('@/lib/memoryStore');
    return { type: 'memory', User: userMemoryStore };
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getSession();
    
    if (!session || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getUserDB();
    let user;

    if (db.type === 'mongo') {
      user = await db.User.findById(session.userId).select('name email');
    } else {
      user = db.User.findById(session.userId);
    }
    
    if (!user) {
      // User might have been deleted or memory store reset
      const { deleteSession } = await import('@/lib/session');
      await deleteSession();
      return NextResponse.json({ success: false, error: 'User not found or session invalid' }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
