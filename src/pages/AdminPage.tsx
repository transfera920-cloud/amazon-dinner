import { useState } from 'react';
import AdminLogin from '../components/AdminLogin.tsx';
import AdminDashboard from '../components/AdminDashboard.tsx';

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(
    typeof window !== 'undefined' ? !!localStorage.getItem('admin_token') : false
  );

  function handleLogout() {
    localStorage.removeItem('admin_token');
    setLoggedIn(false);
  }

  return loggedIn ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <AdminLogin onLoggedIn={() => setLoggedIn(true)} />
  );
}
