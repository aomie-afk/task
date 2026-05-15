import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const dbConnect = (await import('@/lib/db')).default;
    await dbConnect();
    return NextResponse.json({ connected: true, mode: 'mongodb' });
  } catch {
    return NextResponse.json({ connected: false, mode: 'memory' });
  }
}
