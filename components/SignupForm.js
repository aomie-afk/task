'use client';

import { useActionState } from 'react';
import { signup } from '@/app/actions/auth';
import { Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function SignupForm() {
  const [state, action, isPending] = useActionState(signup, undefined);

  return (
    <form action={action} className="auth-form">
      <div className="input-group">
        <label htmlFor="name">Nama Lengkap</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Jhon Doe"
          className="auth-input"
          required
        />
        {state?.errors?.name && (
          <p className="error-text">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="input-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="nama@email.com"
          className="auth-input"
          required
        />
        {state?.errors?.email && (
          <p className="error-text">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="input-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Minimal 8 karakter"
          className="auth-input"
          required
        />
        {state?.errors?.password && (
          <div className="error-text">
            <p>Password harus:</p>
            <ul style={{ paddingLeft: '1rem' }}>
              {state.errors.password.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {state?.message && (
        <p className="error-text" style={{ textAlign: 'center' }}>{state.message}</p>
      )}

      <button
        disabled={isPending}
        type="submit"
        className="btn-primary auth-btn"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Memproses...
          </>
        ) : (
          <>
            <UserPlus size={20} />
            Buat Akun
          </>
        )}
      </button>

      <div className="auth-footer">
        Sudah punya akun? 
        <Link href="/login" className="auth-link">Masuk di sini</Link>
      </div>
    </form>
  );
}
