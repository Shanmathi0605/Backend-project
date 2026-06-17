import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AuthPages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { addToast } = useToast();

  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';
  const isForgot = location.pathname === '/forgot-password';
  const isReset = location.pathname === '/reset-password';

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);

  // Parse redirect query
  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect') || '';

  const handleValidation = () => {
    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter a valid email address', 'warning');
      return false;
    }
    if (isLogin || isRegister) {
      if (password.length < 6) {
        addToast('Password must be at least 6 characters long', 'warning');
        return false;
      }
    }
    if (isRegister) {
      if (!name.trim()) {
        addToast('Please enter your full name', 'warning');
        return false;
      }
      if (password !== confirmPassword) {
        addToast('Passwords do not match', 'error');
        return false;
      }
      if (role === 'vendor' && !storeName.trim()) {
        addToast('Please provide your Store Name', 'warning');
        return false;
      }
    }
    if (isReset) {
      if (password.length < 6) {
        addToast('Password must be at least 6 characters long', 'warning');
        return false;
      }
      if (password !== confirmPassword) {
        addToast('Passwords do not match', 'error');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidation()) return;

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password, role);
        if (redirect) {
          navigate(`/${redirect}`);
        } else {
          navigate(role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor' : '/customer');
        }
      } else if (isRegister) {
        const extraData = role === 'vendor' ? { storeName, status: 'Pending Approval' } : {};
        await register(name, email, password, role, extraData);
        if (role === 'vendor') {
          addToast('Your seller account registration is pending admin approval', 'info');
          navigate('/vendor');
        } else {
          navigate('/customer');
        }
      } else if (isForgot) {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));
        addToast('Password reset link has been dispatched to your email!', 'success');
        setEmail('');
      } else if (isReset) {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 800));
        addToast('Your credentials have been successfully updated. Please log in.', 'success');
        navigate('/login');
      }
    } catch (err) {
      // Handled by context toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {isLogin && 'Welcome Back'}
            {isRegister && 'Create Seller or Buyer Account'}
            {isForgot && 'Reset Password Link'}
            {isReset && 'Choose New Password'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            {isLogin && 'Login to access your personalized portal dashboard'}
            {isRegister && 'Register as a standard customer or register your shop as a vendor'}
            {isForgot && 'Input your email to receive recovery instructions'}
            {isReset && 'Provide a secure replacement password'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '14px' }}
                required
              />
            </div>
          )}

          {!isReset && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Email Address</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '14px' }}
                required
              />
            </div>
          )}

          {(isLogin || isRegister || isReset) && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '14px' }}
                required
              />
            </div>
          )}

          {(isRegister || isReset) && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '14px' }}
                required
              />
            </div>
          )}

          {(isLogin || isRegister) && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>User Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '14px', backgroundColor: 'var(--card-bg)' }}
              >
                <option value="customer">Customer / Buyer</option>
                <option value="vendor">Store Vendor / Seller</option>
                {isLogin && <option value="admin">Super Administrator</option>}
              </select>
            </div>
          )}

          {isRegister && role === 'vendor' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Store Name</label>
              <input
                type="text"
                placeholder="e.g. Gizmo Outlet"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '14px' }}
                required
              />
            </div>
          )}

          {isLogin && (
            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--primary-color)', fontWeight: '500' }}>Forgot password?</Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '14px', borderRadius: 'var(--border-radius-md)', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'background-color var(--transition-fast)' }}
          >
            {loading ? 'Processing request...' : isLogin ? 'Sign In' : isRegister ? 'Create Account' : isForgot ? 'Request Reset Code' : 'Update Credentials'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isLogin && (
            <p>Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Register here</Link></p>
          )}
          {isRegister && (
            <p>Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Sign In here</Link></p>
          )}
          {(isForgot || isReset) && (
            <p>Back to <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Sign In</Link></p>
          )}
        </div>
      </div>
    </div>
  );
};
export default AuthPages;
