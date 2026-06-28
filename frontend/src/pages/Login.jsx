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
    maxWidth: '420px',
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
    marginBottom: '32px',
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
  passwordRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  forgotLink: {
    fontSize: '13px',
    color: '#007aff',
    textDecoration: 'none',
    fontWeight: '500',
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

const Login = () => {
  const { login, isAuthenticated, error: authError } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed.');
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
              <path d="M6.5 6.5C6.5 4 8.5 2 11 2c2 0 3.5 1 4.2 2.5" />
              <path d="M3 19V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <circle cx="12" cy="14" r="2" />
              <path d="M12 16v2" />
            </svg>
          </div>
        </div>

        <h1 style={s.heading}>Sign In</h1>
        <p style={s.subtitle}>Welcome back to CloudCart</p>

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
          <div style={s.fieldGroup}>
            <label style={s.label}>Email or Username</label>
            <input
              type="text"
              style={s.input}
              placeholder="Enter email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 4px rgba(0,122,255,0.15)')}
              onBlur={(e) => (e.target.style.boxShadow = 'none')}
              required
              autoComplete="username"
            />
          </div>

          <div style={{ marginBottom: '4px' }}>
            <div style={s.passwordRow}>
              <label style={s.label}>Password</label>
              <a href="#" style={s.forgotLink}>Forgot?</a>
            </div>
            <input
              type="password"
              style={s.input}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => (e.target.style.boxShadow = '0 0 0 4px rgba(0,122,255,0.15)')}
              onBlur={(e) => (e.target.style.boxShadow = 'none')}
              required
              autoComplete="current-password"
            />
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={s.footerText}>
          Don't have an account?{' '}
          <Link
            to={redirect ? `/register?redirect=${redirect}` : '/register'}
            style={s.footerLink}
          >
            Sign Up
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

export default Login;
