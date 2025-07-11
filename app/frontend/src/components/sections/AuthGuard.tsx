import { Navigate } from 'react-router-dom';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // Disable safeguard on localhost
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return <div className="relative min-h-screen">{children}</div>;
  }
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <div className="relative min-h-screen">{children}</div>;
}