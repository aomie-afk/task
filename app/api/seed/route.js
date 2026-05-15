import { NextResponse } from 'next/server';

const SAMPLE_TASKS = [
  {
    title: 'Rancang UI Dashboard',
    description: 'Desain halaman utama dengan glassmorphism dan aksen neon violet.',
    category: 'Kerja',
    status: 'Done',
    priority: 'High',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    duration: 120,
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Sesi Yoga Pagi',
    description: '30 menit meditasi dan peregangan untuk menjernihkan pikiran.',
    category: 'Kesehatan',
    status: 'Done',
    priority: 'Medium',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    duration: 30,
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Integrasi MongoDB Atlas',
    description: 'Hubungkan API Next.js dengan Mongoose dan MongoDB Atlas cloud.',
    category: 'Kerja',
    status: 'Done',
    priority: 'High',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    duration: 90,
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Belanja Mingguan',
    description: 'Beli sayuran, buah, dan kebutuhan dapur untuk seminggu ke depan.',
    category: 'Pribadi',
    status: 'In Progress',
    priority: 'Low',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Review Metrik Performa',
    description: 'Analisis tingkat penyelesaian task dan efisiensi tim selama seminggu.',
    category: 'Kerja',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Uji Coba Focus Timer',
    description: 'Verifikasi semua mode timer: Fokus, Istirahat Singkat, dan Istirahat Panjang.',
    category: 'Kerja',
    status: 'Todo',
    priority: 'High',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  },
  {
    title: 'Budgeting Bulanan',
    description: 'Catat pengeluaran dan tetapkan target tabungan untuk bulan ini.',
    category: 'Keuangan',
    status: 'Todo',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  },
  {
    title: 'Baca Buku "Atomic Habits"',
    description: 'Selesaikan bab 5 hingga 8 sebelum akhir minggu ini.',
    category: 'Pribadi',
    status: 'Todo',
    priority: 'Low',
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  },
];

export async function POST() {
  try {
    // Try MongoDB first
    let usedMongo = false;
    try {
      const dbConnect = (await import('@/lib/db')).default;
      const Task = (await import('@/models/Task')).default;
      await dbConnect();
      await Task.deleteMany({});
      await Task.insertMany(SAMPLE_TASKS);
      usedMongo = true;
    } catch (dbErr) {
      console.warn('MongoDB unavailable for seed, using memory store:', dbErr.message);
      // Fallback: just reset the memory store via the store's create method
      // We can't fully reset the memory store from here without exposing a reset fn,
      // so just report that MongoDB was unavailable
    }

    return NextResponse.json({
      success: true,
      message: usedMongo
        ? `Database di-seed dengan ${SAMPLE_TASKS.length} task di MongoDB Atlas!`
        : 'MongoDB tidak tersedia. Gunakan data in-memory yang sudah ada.',
      count: SAMPLE_TASKS.length,
      storage: usedMongo ? 'mongodb' : 'memory',
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
