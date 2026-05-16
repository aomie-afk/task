import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Masuk — Vortex Task',
  description: 'Masuk ke akun Vortex Task Anda.',
};

export default function LoginPage() {
  return (
    <>
      <div className="auth-logo">
        <div className="logo-icon">
          <span style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem' }}>V</span>
        </div>
        <div>
          <span className="logo-name">Vortex</span>
          <span style={{ color: 'var(--accent2)', fontWeight: 800 }}>Task</span>
        </div>
      </div>
      
      <h1 className="auth-title">Selamat Datang</h1>
      <p className="auth-subtitle">Kelola tugas Anda dengan lebih efisien hari ini.</p>
      
      <LoginForm />
    </>
  );
}
