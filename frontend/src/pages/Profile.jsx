import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const iosStyles = {
  page: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    marginBottom: '1.75rem',
    color: '#1c1c1e',
  },
  profileCard: {
    background: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: '2rem 1.5rem',
    marginBottom: '1rem',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
  },
  avatarIcon: {
    fontSize: '2rem',
    color: '#ffffff',
  },
  userName: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: '0.25rem',
    letterSpacing: '-0.3px',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.2rem 0.75rem',
    borderRadius: '50px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    background: 'linear-gradient(135deg, #007AFF, #5856D6)',
    color: '#ffffff',
  },
  sectionLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '0.75rem 1.25rem 0.4rem',
    marginTop: '0.5rem',
  },
  listCard: {
    background: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(0, 0, 0, 0.04)',
    boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
    marginBottom: '1rem',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1.25rem',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    transition: 'background 0.15s ease',
  },
  listItemLast: {
    borderBottom: 'none',
  },
  listItemIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: '0.85rem',
    fontSize: '0.95rem',
    color: '#ffffff',
  },
  listItemLabel: {
    fontSize: '0.92rem',
    fontWeight: '500',
    color: '#1c1c1e',
    flex: 1,
  },
  listItemValue: {
    fontSize: '0.88rem',
    color: '#8e8e93',
    textAlign: 'right',
    maxWidth: '55%',
    wordBreak: 'break-word',
  },
  metaBlock: {
    padding: '0.85rem 1.25rem',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  },
  metaBlockLast: {
    borderBottom: 'none',
  },
  metaLabel: {
    fontSize: '0.68rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: '#007AFF',
    marginBottom: '0.3rem',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
  },
  metaValue: {
    fontSize: '0.85rem',
    color: '#3a3a3c',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    wordBreak: 'break-all',
  },
  metaHint: {
    fontSize: '0.75rem',
    color: '#8e8e93',
    marginTop: '0.35rem',
    lineHeight: '1.4',
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5rem 0',
  },
};

const Profile = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading]);

  if (loading || !user) {
    return (
      <div style={iosStyles.spinner}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const infoRows = [
    { icon: 'bi-envelope-fill', bg: '#007AFF', label: 'Email Address', value: user.email },
    { icon: 'bi-phone-fill', bg: '#34C759', label: 'Phone Number', value: user.phone || null },
    { icon: 'bi-geo-alt-fill', bg: '#FF9500', label: 'Shipping Address', value: user.address || null },
  ];

  return (
    <div style={iosStyles.page}>
      <h1 style={iosStyles.pageTitle}>Profile</h1>

      {/* Profile Header Card */}
      <div style={iosStyles.profileCard}>
        <div style={iosStyles.avatar}>
          <i className="bi bi-person-fill" style={iosStyles.avatarIcon}></i>
        </div>
        <div>
          <div style={iosStyles.userName}>{user.username}</div>
          <span style={iosStyles.roleBadge}>{user.role}</span>
        </div>
      </div>

      {/* Personal Information Section */}
      <div style={iosStyles.sectionLabel}>Personal Information</div>
      <div style={iosStyles.listCard}>
        {infoRows.map((row, idx) => (
          <div
            key={row.label}
            style={{
              ...iosStyles.listItem,
              ...(idx === infoRows.length - 1 ? iosStyles.listItemLast : {}),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div style={{ ...iosStyles.listItemIcon, background: row.bg }}>
                <i className={`bi ${row.icon}`}></i>
              </div>
              <span style={iosStyles.listItemLabel}>{row.label}</span>
            </div>
            <span style={iosStyles.listItemValue}>
              {row.value || <em style={{ color: '#c7c7cc', fontStyle: 'normal' }}>Not set</em>}
            </span>
          </div>
        ))}
      </div>

      {/* Identity & Security Context Section */}
      <div style={iosStyles.sectionLabel}>Identity & Security</div>
      <div style={iosStyles.listCard}>
        <div style={iosStyles.metaBlock}>
          <div style={iosStyles.metaLabel}>Session Auth Provider</div>
          <div style={iosStyles.metaValue}>
            {user.cognito_sub ? 'Amazon Cognito User Pool Auth' : 'Local MySQL Web Credential Auth'}
          </div>
        </div>

        {user.cognito_sub && (
          <div style={iosStyles.metaBlock}>
            <div style={iosStyles.metaLabel}>Cognito ID (UUID)</div>
            <div style={iosStyles.metaValue}>{user.cognito_sub}</div>
          </div>
        )}

        <div style={{ ...iosStyles.metaBlock, ...iosStyles.metaBlockLast }}>
          <div style={iosStyles.metaLabel}>Authorized User Role</div>
          <div style={{ ...iosStyles.metaValue, textTransform: 'capitalize' }}>{user.role} Policy</div>
          <div style={iosStyles.metaHint}>
            {user.role === 'admin'
              ? 'Policy grants access to AWS console simulations, backend dashboards, product creation, S3 deletions, and order fulfillment routes.'
              : 'Policy grants standard customer access for checkout events, RDS cart syncing, and SES receipt alerts.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
