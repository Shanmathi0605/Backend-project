import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

export const CustomerLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'customer')) {
      navigate('/login?redirect=customer');
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading || !isAuthenticated || user?.role !== 'customer') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar isOpen={true} />
        <main style={{ flexGrow: 1, padding: '32px', backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 80px)', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default CustomerLayout;
