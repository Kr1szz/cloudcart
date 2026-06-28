import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const s = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 160px)',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    borderRadius: '24px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
    padding: '40px 36px',
    border: '1px solid rgba(255,255,255,0.5)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  logoIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(0,122,255,0.25)',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1d1d1f',
    textAlign: 'center',
    marginTop: '16px',
    marginBottom: '4px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#86868b',
    textAlign: 'center',
    marginBottom: '28px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    borderRadius: '14px',
    background: 'rgba(255,59,48,0.08)',
    color: '#ff3b30',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '20px',
    animation: 'iosSlideDown 0.3s ease',
  },
  fieldGroup: {
    marginBottom: '16px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#86868b',
    marginBottom: '6px',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#f5f5f7',
    fontSize: '16px',
    color: '#1d1d1f',
    outline: 'none',
    transition: 'box-shadow 0.2s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  inputHint: {
    fontSize: '12px',
    color: '#86868b',
    marginTop: '6px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  submitBtn: {
    width: '100%',
    padding: '16px',
    border: 'none',
    borderRadius: '14px',
    background: '#007aff',
    color: '#ffffff',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    letterSpacing: '-0.2px',
    marginTop: '24px',
  },
  submitBtnDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2.5px solid rgba(255,255,255,0.3)',
    borderTop: '2.5px solid #ffffff',
    borderRadius: '50%',
    animation: 'iosSpinner 0.8s linear infinite',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#86868b',
  },
  footerLink: {
    color: '#007aff',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    if (isAuthenticated) {
      if (redirect) {
        navigate(`/${redirect}`);
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password || !phone.trim() || !address.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(username, email, password, phone, address);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoContainer}>
          <div style={s.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
        </div>

        <h1 style={s.heading}>Create Account</h1>
        <p style={s.subtitle}>Join CloudCart today</p>

        {/* Error Alert */}
        {error && (
          <div style={s.errorBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Username</label>
            <input
              type="text"
              style={s.input}
              placeholder="e.g. john_doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 4px rgba(0,122,255,0.15)')}
              onBlur={(e) => (e.target.style.boxShadow = 'none')}
              required
              autoComplete="username"
            />
          </div>

          {/* Email */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Email Address</label>
            <input
              type="email"
              style={s.input}
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 4px rgba(0,122,255,0.15)')}
              onBlur={(e) => (e.target.style.boxShadow = 'none')}
              required
              autoComplete="email"
            />
          </div>

          {/* Phone */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Phone Number</label>
            <input
              type="text"
              style={s.input}
              placeholder="e.g. +14155552671"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 4px rgba(0,122,255,0.15)')}
              onBlur={(e) => (e.target.style.boxShadow = 'none')}
              required
            />
            <div style={s.inputHint}>Required for AWS SNS SMS order notifications</div>
          </div>

          {/* Address */}
          <div style={s.fieldGroup}>
            <label style={s.label}>Shipping Address</label>
            <textarea
              style={{ ...s.input, resize: 'none', minHeight: '72px' }}
              placeholder="123 Main St, Apt 4B, San Jose, CA 95112"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 4px rgba(0,122,255,0.15)')}
              onBlur={(e) => (e.target.style.boxShadow = 'none')}
              required
            />
          </div>

          {/* Password Row */}
          <div style={{ ...s.row, marginBottom: '4px' }}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Password</label>
              <input
                type="password"
                style={s.input}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => (e.target.style.boxShadow = '0 0 0 4px rgba(0,122,255,0.15)')}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
                required
                autoComplete="new-password"
              />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Confirm Password</label>
              <input
                type="password"
                style={s.input}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={(e) => (e.target.style.boxShadow = '0 0 0 4px rgba(0,122,255,0.15)')}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...s.submitBtn,
              ...(loading ? s.submitBtnDisabled : {}),
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#0066d6'; e.currentTarget.style.transform = 'scale(1.01)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#007aff'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {loading ? (
              <>
                <div style={s.spinner} />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div style={s.footerText}>
          Already have an account?{' '}
          <Link
            to={redirect ? `/login?redirect=${redirect}` : '/login'}
            style={s.footerLink}
          >
            Sign In
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes iosSpinner {
          to { transform: rotate(360deg); }
        }
        @keyframes iosSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Register;
