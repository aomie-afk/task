import '@/app/auth.css';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-container">
      <div className="auth-card glass">
        {children}
      </div>
    </div>
  );
}
