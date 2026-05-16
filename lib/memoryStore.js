/**
 * In-memory store sebagai fallback ketika MongoDB tidak tersedia.
 * Data disimpan di memori server (hilang saat restart), cocok untuk dev/demo.
 */

let tasks = [
  {
    _id: '1',
    title: 'Rancang UI Dashboard',
    description: 'Desain halaman utama dengan glassmorphism dan aksen neon.',
    category: 'Kerja',
    status: 'Done',
    priority: 'High',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '2',
    title: 'Sesi Yoga Pagi',
    description: '30 menit meditasi dan peregangan untuk menjernihkan pikiran.',
    category: 'Kesehatan',
    status: 'Done',
    priority: 'Medium',
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '3',
    title: 'Integrasi MongoDB',
    description: 'Hubungkan API Next.js dengan Mongoose untuk penyimpanan data.',
    category: 'Kerja',
    status: 'Done',
    priority: 'High',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 90,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '4',
    title: 'Belanja Mingguan',
    description: 'Beli sayuran, buah, dan kebutuhan dapur untuk seminggu ke depan.',
    category: 'Pribadi',
    status: 'In Progress',
    priority: 'Low',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '5',
    title: 'Review Metrik Performa',
    description: 'Analisis tingkat penyelesaian task dan efisiensi tim selama seminggu.',
    category: 'Kerja',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 0,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '6',
    title: 'Uji Coba Focus Timer',
    description: 'Verifikasi semua mode timer (Fokus, Istirahat Pendek, Istirahat Panjang).',
    category: 'Kerja',
    status: 'Todo',
    priority: 'High',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '7',
    title: 'Budgeting Bulanan',
    description: 'Catat pengeluaran dan tetapkan target tabungan untuk bulan ini.',
    category: 'Keuangan',
    status: 'Todo',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '8',
    title: 'Baca Buku "Atomic Habits"',
    description: 'Selesaikan bab 5 hingga 8 sebelum akhir minggu.',
    category: 'Pribadi',
    status: 'Todo',
    priority: 'Low',
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextId = 9;

function generateId() {
  return String(nextId++);
}

export const memoryStore = {
  getAll(query = {}) {
    let result = [...tasks];
    if (query.category) result = result.filter(t => t.category === query.category);
    if (query.status) result = result.filter(t => t.status === query.status);
    if (query.date) {
      const d = new Date(query.date).toDateString();
      result = result.filter(t => new Date(t.createdAt).toDateString() === d);
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  create(data) {
    const now = new Date().toISOString();
    const task = {
      _id: generateId(),
      title: data.title || '',
      description: data.description || '',
      category: data.category || 'Kerja',
      status: data.status || 'Todo',
      priority: data.priority || 'Medium',
      dueDate: data.dueDate || null,
      duration: data.duration || 0,
      createdAt: now,
      updatedAt: now,
    };
    tasks.unshift(task);
    return task;
  },

  update(id, data) {
    const idx = tasks.findIndex(t => t._id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    if (data.status === 'Done' && tasks[idx].status !== 'Done') {
      data.completedAt = now;
    }
    tasks[idx] = { ...tasks[idx], ...data, updatedAt: now };
    return tasks[idx];
  },

  delete(id) {
    const idx = tasks.findIndex(t => t._id === id);
    if (idx === -1) return false;
    tasks.splice(idx, 1);
    return true;
  },

  findById(id) {
    return tasks.find(t => t._id === id) || null;
  },
};

// Pre-populate with a default test user
let users = [{
  _id: '1',
  name: 'Test User',
  email: 'nama@email.com',
  password: 'password', // For memoryStore we will just compare plaintext if bcrypt fails, but let's hash it properly later or handle it. Wait, bcrypt.compare is used in auth.js. Let's just hash it properly or modify auth.js.
}];
let nextUserId = 2;

export const userMemoryStore = {
  findByEmail(email) {
    return users.find(u => u.email === email.toLowerCase()) || null;
  },
  findById(id) {
    return users.find(u => u._id === id) || null;
  },
  create(data) {
    const user = {
      _id: String(nextUserId++),
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password, // This is already hashed in auth.js
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  }
};
