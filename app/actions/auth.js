'use server';

import { SignupFormSchema, LoginFormSchema } from '@/lib/definitions';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

// Fallback logic
async function getUserDB() {
  try {
    const dbConnect = (await import('@/lib/db')).default;
    const User = (await import('@/models/User')).default;
    await dbConnect();
    return { type: 'mongo', User };
  } catch (error) {
    console.warn('MongoDB fallback to memoryStore:', error.message);
    const { userMemoryStore } = await import('@/lib/memoryStore');
    return { type: 'memory', User: userMemoryStore };
  }
}

export async function signup(state, formData) {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const db = await getUserDB();
    let user;

    if (db.type === 'mongo') {
      const existingUser = await db.User.findOne({ email });
      if (existingUser) {
        return { errors: { email: ['Email sudah terdaftar.'] } };
      }
      user = await db.User.create({ name, email, password });
    } else {
      const existingUser = db.User.findByEmail(email);
      if (existingUser) {
        return { errors: { email: ['Email sudah terdaftar.'] } };
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user = db.User.create({ name, email, password: hashedPassword });
    }

    if (!user) {
      return { message: 'Terjadi kesalahan saat membuat akun.' };
    }

    await createSession(user._id.toString());
  } catch (error) {
    console.error('Signup error:', error);
    return { message: 'Gagal mendaftar. Silakan coba lagi.' };
  }

  redirect('/');
}

export async function login(state, formData) {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  try {
    const db = await getUserDB();
    let user;
    let isPasswordValid = false;

    if (db.type === 'mongo') {
      user = await db.User.findOne({ email });
      if (user) {
        isPasswordValid = await user.comparePassword(password);
      }
    } else {
      user = db.User.findByEmail(email);
      if (user) {
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
          isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
          // Fallback for default plaintext test user in memoryStore
          isPasswordValid = password === user.password;
        }
      }
    }

    if (!user || !isPasswordValid) {
      return { errors: { email: ['Email atau password salah.'] } };
    }

    await createSession(user._id.toString());
  } catch (error) {
    console.error('Login error:', error);
    return { message: 'Gagal masuk. Silakan coba lagi.' };
  }

  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
