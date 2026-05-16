'use server';

import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

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

export async function updateProfile(formData) {
  const session = await getSession();
  if (!session?.userId) return { error: 'Unauthorized' };

  const name = formData.get('name');
  const email = formData.get('email');

  try {
    const db = await getUserDB();
    if (db.type === 'mongo') {
      await db.User.findByIdAndUpdate(session.userId, { name, email });
    } else {
      const user = db.User.findById(session.userId);
      if (user) {
        user.name = name;
        user.email = email.toLowerCase();
      }
    }
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function changePassword(formData) {
  const session = await getSession();
  if (!session?.userId) return { error: 'Unauthorized' };

  const currentPassword = formData.get('currentPassword');
  const newPassword = formData.get('newPassword');

  try {
    const db = await getUserDB();
    if (db.type === 'mongo') {
      const user = await db.User.findById(session.userId);
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) return { error: 'Password saat ini salah.' };

      user.password = newPassword; // hashing handled by pre-save
      await user.save();
    } else {
      const user = db.User.findById(session.userId);
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return { error: 'Password saat ini salah.' };

      user.password = await bcrypt.hash(newPassword, 10);
    }
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}
