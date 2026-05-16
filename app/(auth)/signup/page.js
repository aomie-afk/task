import SignupForm from '@/components/SignupForm';

export const metadata = {
  title: 'Daftar — Vortex Task',
  description: 'Buat akun Vortex Task baru.',
};

export default function SignupPage() {
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
      
      <h1 className="auth-title">Buat Akun</h1>
      <p className="auth-subtitle">Mulai perjalanan produktivitas Anda sekarang.</p>
      
      <SignupForm />
    </>
  );
}
