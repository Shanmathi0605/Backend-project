import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AuthPages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, sendOtp, forgotPassword, resetPassword, verifyLoginOtp } = useAuth();
  const { addToast } = useToast();

  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';
  const isForgot = location.pathname === '/forgot-password';
  const isReset = location.pathname === '/reset-password';

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect') || '';
  const urlRole = queryParams.get('role') || '';

  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(urlRole === 'vendor' ? 'vendor' : 'customer');
  const [storeName, setStoreName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginRequiresOtp, setLoginRequiresOtp] = useState(false);

  // Sync role when URL query param changes
  React.useEffect(() => {
    if (isRegister) {
      setRole(urlRole === 'vendor' ? 'vendor' : 'customer');
    } else {
      setRole('customer');
    }
  }, [urlRole, isRegister]);

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
      if (!otp.trim() || otp.length < 6) {
        addToast('Please enter a valid 6-digit OTP', 'warning');
        return false;
      }
    }
    if (isReset) {
      if (!email.trim()) {
        addToast('Please enter your email', 'warning');
        return false;
      }
      if (!otp.trim() || otp.length < 6) {
        addToast('Please enter the 6-digit OTP', 'warning');
        return false;
      }
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter a valid email address first', 'warning');
      return;
    }
    setSendingOtp(true);
    try {
      await sendOtp(email);
      setOtpSent(true);
    } catch (err) {
      // Toast handled in context
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidation()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const user = await login(email, password);
        if (user && user.requiresOtp) {
          setLoginRequiresOtp(true);
          return;
        }
        const userRole = user ? user.role : role;
        if (redirect) {
          navigate(`/${redirect}`);
        } else {
          navigate(userRole === 'admin' ? '/admin' : userRole === 'vendor' ? '/vendor' : '/');
        }
      } else if (isRegister) {
        const extraData = role === 'vendor' ? { storeName, status: 'Pending Approval', otp } : { otp };
        await register(name, email, password, role, extraData);
        if (role === 'vendor') {
          addToast('Your seller account registration is pending admin approval', 'info');
          navigate('/vendor');
        } else {
          navigate('/customer');
        }
      } else if (isForgot) {
        await forgotPassword(email);
        // Pass email state to reset page so user doesn't have to type it again
        navigate('/reset-password', { state: { email } });
      } else if (isReset) {
        await resetPassword(email, otp, password);
        navigate('/login');
      }
    } catch (err) {
      // Handled by context toast
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) {
      addToast('Please enter the 6-digit OTP sent to your email', 'warning');
      return;
    }
    setLoading(true);
    try {
      const user = await verifyLoginOtp(email, otp);
      const userRole = user ? user.role : 'customer';
      if (redirect) {
        navigate(`/${redirect}`);
      } else {
        navigate(userRole === 'admin' ? '/admin' : userRole === 'vendor' ? '/vendor' : '/');
      }
    } catch (error) {
      // Toast shown in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {isForgot ? 'Password Recovery' : isReset ? 'Set New Password' : isLogin ? (loginRequiresOtp ? 'Security Check' : 'Welcome Back') : (role === 'vendor' ? 'Become a Seller' : 'Create an Account')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            {isForgot
              ? 'Enter your email to receive a password reset OTP.'
              : isReset
              ? 'Enter your OTP and new password.'
              : isLogin
              ? (loginRequiresOtp ? 'Enter the OTP sent to your email.' : 'Sign in to your account to continue.')
              : (role === 'vendor' ? 'Register your store and start selling today.' : 'Fill in your details to get started.')}
          </p>
        </div>

        <form onSubmit={loginRequiresOtp ? handleLoginOtpSubmit : handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

          {/* Regular Login Fields (Hidden during OTP step) */}
          {!loginRequiresOtp && (
            <>
              {(isLogin || isRegister || isForgot || isReset) && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Email Address</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '14px', backgroundColor: 'var(--card-bg)' }}
                      required
                    />
                    {isRegister && (
                      <button 
                        type="button" 
                        onClick={handleSendOtp} 
                        disabled={sendingOtp || otpSent}
                        style={{ padding: '0 16px', backgroundColor: otpSent ? 'var(--success-color, #28a745)' : 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-md)', cursor: (sendingOtp || otpSent) ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap' }}
                      >
                        {sendingOtp ? 'Sending...' : otpSent ? 'Sent ✓' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {(isLogin || isRegister || isReset) && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {isReset ? 'New Password' : 'Password'}
                    </label>
                    {isLogin && (
                      <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: '500' }}>
                        Forgot Password?
                      </Link>
                    )}
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '14px', backgroundColor: 'var(--card-bg)' }}
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* OTP Fields */}
          {(isReset || (isRegister && otpSent) || loginRequiresOtp) && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-primary)' }}>Enter OTP</label>
              <input
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '14px' }}
                maxLength={6}
                required
              />
            </div>
          )}

          {(isRegister || isReset) && !loginRequiresOtp && (
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

          <button type="submit" disabled={loading || sendingOtp} style={{ padding: '14px', backgroundColor: 'var(--accent-color)', color: '#fff', borderRadius: 'var(--border-radius-md)', fontWeight: '600', fontSize: '15px', border: 'none', cursor: (loading || sendingOtp) ? 'not-allowed' : 'pointer', opacity: (loading || sendingOtp) ? 0.7 : 1, marginTop: '8px' }}>
            {loading
              ? 'Processing...'
              : loginRequiresOtp
              ? 'Verify OTP & Login'
              : isForgot
              ? 'Send OTP'
              : isReset
              ? 'Reset Password'
              : isLogin
              ? 'Sign In'
              : isRegister && otpSent
              ? 'Verify & Register'
              : 'Send Registration OTP'}
          </button>
        </form>

        {!loginRequiresOtp && (
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
            {isLogin ? (
              <>
                Don't have an account? <Link to="/register" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Sign up</Link>
              </>
            ) : isRegister ? (
              <>
                Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Sign in</Link>
              </>
            ) : isForgot ? (
              <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Back to Login</Link>
            ) : isReset ? (
              <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Back to Login</Link>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
export default AuthPages;
