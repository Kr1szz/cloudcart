import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ios = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  header: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' },
  title: { fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.5px', color: '#1c1c1e', marginBottom: '0.25rem' },
  subtitle: { fontSize: '0.88rem', color: '#8e8e93', lineHeight: 1.5 },
  actionBtns: { display: 'flex', gap: '0.6rem', flexWrap: 'wrap' },
  actionBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.55rem 1.1rem', borderRadius: '12px', fontWeight: '600', fontSize: '0.85rem',
    background: 'rgba(0, 0, 0, 0.06)', color: '#1c1c1e', border: 'none', cursor: 'pointer',
    textDecoration: 'none', transition: 'background 0.15s ease',
  },
  /* KPI Cards */
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  kpiCard: (gradient) => ({
    background: gradient,
    borderRadius: '16px', padding: '1.5rem',
    color: '#fff', position: 'relative', overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
  }),
  kpiLabel: {
    fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: '0.6px', opacity: 0.85, marginBottom: '0.6rem',
  },
  kpiValue: { fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '0.15rem' },
  kpiHint: { fontSize: '0.78rem', opacity: 0.75 },
  kpiIcon: { position: 'absolute', top: '1rem', right: '1.25rem', fontSize: '2rem', opacity: 0.25 },
  /* Section Cards */
  sectionCard: {
    background: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  sectionTitle: { fontWeight: '700', fontSize: '1.1rem', color: '#1c1c1e', marginBottom: '1rem' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0' },
  th: {
    fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: '0.5px', color: '#8e8e93', padding: '0.6rem 0.75rem',
    borderBottom: '1px solid #e5e5ea', textAlign: 'left',
  },
  td: { padding: '0.75rem', borderBottom: '1px solid #f2f2f7', verticalAlign: 'middle', fontSize: '0.88rem' },
  /* Category Cards */
  catGrid: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  catCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.85rem 1.15rem', borderRadius: '12px',
    background: '#f2f2f7', transition: 'background 0.15s ease',
  },
  catName: { fontWeight: '600', fontSize: '0.92rem', color: '#1c1c1e' },
  catRevenue: { fontWeight: '700', fontSize: '1.05rem', color: '#007AFF' },
  emptyText: { textAlign: 'center', padding: '2rem', color: '#8e8e93', fontSize: '0.88rem' },
  spinner: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem 0' },
};

const statusColors = {
  pending: { bg: 'rgba(255, 149, 0, 0.12)', color: '#FF9500' },
  processing: { bg: 'rgba(0, 122, 255, 0.12)', color: '#007AFF' },
  shipped: { bg: 'rgba(88, 86, 214, 0.12)', color: '#5856D6' },
  delivered: { bg: 'rgba(52, 199, 89, 0.12)', color: '#34C759' },
  cancelled: { bg: 'rgba(255, 59, 48, 0.12)', color: '#FF3B30' },
};

const StatusPill = ({ status }) => {
  const s = statusColors[status] || { bg: 'rgba(142,142,147,0.12)', color: '#8e8e93' };
  return (
    <span style={{
      display: 'inline-block', padding: '0.2rem 0.7rem', borderRadius: '50px',
      fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px',
      background: s.bg, color: s.color,
    }}>
      {status}
    </span>
  );
};

const kpiGradients = [
  'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
  'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)',
  'linear-gradient(135deg, #34C759 0%, #30A14E 100%)',
  'linear-gradient(135deg, #AF52DE 0%, #5856D6 100%)',
];

const AdminDashboard = () => {
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) navigate('/login');
      else if (!isAdmin) navigate('/');
    }
  }, [isAuthenticated, isAdmin, authLoading]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/admin/dashboard');
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders);
        setCategorySales(res.data.categorySales);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, isAdmin]);

  if (loading) {
    return (
      <div style={ios.spinner}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Sales', value: `₹${stats.totalSales.toFixed(2)}`, hint: 'Gross revenue', icon: 'bi-cash-coin', gradient: kpiGradients[0] },
    { label: 'Total Orders', value: stats.totalOrders, hint: 'All transactions', icon: 'bi-bag-check-fill', gradient: kpiGradients[1] },
    { label: 'Products', value: stats.totalProducts, hint: 'Active catalog', icon: 'bi-box-seam-fill', gradient: kpiGradients[2] },
    { label: 'Customers', value: stats.totalUsers, hint: 'Registered users', icon: 'bi-people-fill', gradient: kpiGradients[3] },
  ];

  return (
    <div style={ios.page}>
      {/* Header */}
      <div style={ios.header}>
        <div>
          <h1 style={ios.title}>Dashboard</h1>
          <p style={ios.subtitle}>Manage products, fulfillment, database records, and monitor AWS integrations.</p>
        </div>
        <div style={ios.actionBtns}>
          <Link to="/admin/products" style={ios.actionBtn}>
            <i className="bi bi-box"></i> Manage Products
          </Link>
          <Link to="/admin/orders" style={ios.actionBtn}>
            <i className="bi bi-cart"></i> Manage Orders
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={ios.kpiGrid}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={ios.kpiCard(kpi.gradient)}>
            <i className={`bi ${kpi.icon}`} style={ios.kpiIcon}></i>
            <div style={ios.kpiLabel}>{kpi.label}</div>
            <div style={ios.kpiValue}>{kpi.value}</div>
            <div style={ios.kpiHint}>{kpi.hint}</div>
          </div>
        ))}
      </div>

      {/* Two-column: Recent Orders + Category Sales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Recent Orders */}
        <div style={ios.sectionCard}>
          <div style={ios.sectionTitle}>Recent Orders</div>
          {recentOrders.length === 0 ? (
            <p style={ios.emptyText}>No recent orders logged.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={ios.table}>
                <thead>
                  <tr>
                    <th style={ios.th}>Order</th>
                    <th style={ios.th}>Customer</th>
                    <th style={ios.th}>Total</th>
                    <th style={{ ...ios.th, textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td style={{ ...ios.td, fontWeight: '700' }}>#{ord.id}</td>
                      <td style={ios.td}>
                        <div style={{ fontWeight: '600', color: '#1c1c1e' }}>{ord.username}</div>
                        <div style={{ fontSize: '0.78rem', color: '#8e8e93' }}>{ord.email}</div>
                      </td>
                      <td style={{ ...ios.td, fontWeight: '600', color: '#007AFF' }}>₹{Number(ord.total_amount).toFixed(2)}</td>
                      <td style={{ ...ios.td, textAlign: 'center' }}>
                        <StatusPill status={ord.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Sales */}
        <div style={ios.sectionCard}>
          <div style={ios.sectionTitle}>Sales by Category</div>
          {categorySales.length === 0 ? (
            <p style={ios.emptyText}>No category sales data.</p>
          ) : (
            <div style={ios.catGrid}>
              {categorySales.map((cat, idx) => (
                <div key={idx} style={ios.catCard}>
                  <div>
                    <div style={ios.catName}>{cat.category}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8e8e93' }}>Category</div>
                  </div>
                  <div style={ios.catRevenue}>₹{Number(cat.sales).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
