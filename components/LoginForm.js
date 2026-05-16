'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
  const [state, action, isPending] = useActionState(login, undefined);

  return (
    <form action={action} className="auth-form">
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
          placeholder="••••••••"
          className="auth-input"
          required
        />
        {state?.errors?.password && (
          <p className="error-text">{state.errors.password[0]}</p>
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
            <LogIn size={20} />
            Masuk Sekarang
          </>
        )}
      </button>

      <div className="auth-footer">
        Belum punya akun? 
        <Link href="/signup" className="auth-link">Daftar Gratis</Link>
      </div>
    </form>
  );
}
