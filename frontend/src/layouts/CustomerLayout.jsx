import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Navbar />
      <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'center' }}>
        <main style={{ width: '100%', maxWidth: '1200px', padding: '32px 24px', minHeight: 'calc(100vh - 80px)', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default CustomerLayout;
