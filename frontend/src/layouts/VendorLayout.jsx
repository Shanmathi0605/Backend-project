import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

export const VendorLayout = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'vendor')) {
      navigate('/login?redirect=vendor');
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading || !isAuthenticated || user?.role !== 'vendor') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Loading Vendor Hub...</p>
      </div>
    );
  }

  const isApproved = user?.status === 'Approved';

  if (!isApproved) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '24px 16px' }}>
          <div style={{ width: '100%', maxWidth: '550px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '48px 32px', textAlign: 'center' }}>
            {user?.status === 'Pending Approval' ? (
              <>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px' }}>
                  <span style={{ fontSize: '32px' }}>⏳</span>
                </div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Store Review Pending
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                  Thank you for registering your store <strong>"{user.storeName || 'My Store'}"</strong> on NovaCart!
                  <br /><br />
                  Your seller registration is currently under review by our administration team. We are verifying your details and will activate your dashboard access shortly.
                </p>
              </>
            ) : user?.status === 'Suspended' ? (
              <>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px' }}>
                  <span style={{ fontSize: '32px' }}>⛔</span>
                </div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Store Suspended
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                  Your store account <strong>"{user.storeName || 'My Store'}"</strong> has been suspended by the platform administration.
                  <br /><br />
                  Please contact the support team or your account manager for detailed inquiries.
                </p>
              </>
            ) : (
              <>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px' }}>
                  <span style={{ fontSize: '32px' }}>❌</span>
                </div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Registration Rejected
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                  Unfortunately, your vendor application for store <strong>"{user.storeName || 'My Store'}"</strong> has been rejected.
                  <br /><br />
                  Please contact our administrator panel for resolution or submit clarification if required.
                </p>
              </>
            )}

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                borderRadius: 'var(--border-radius-md)',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Sign Out & Back to Home
            </button>
          </div>
        </div>
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
export default VendorLayout;
