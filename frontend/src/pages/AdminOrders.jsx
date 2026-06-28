import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ios = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  breadcrumb: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    fontSize: '0.82rem', color: '#8e8e93', marginBottom: '1.5rem',
  },
  breadcrumbLink: { color: '#007AFF', textDecoration: 'none', fontWeight: '500' },
  breadcrumbSep: { color: '#c7c7cc' },
  breadcrumbActive: { color: '#1c1c1e', fontWeight: '600' },
  title: { fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.5px', color: '#1c1c1e', marginBottom: '1.5rem' },
  sectionCard: {
    background: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)', padding: '1.25rem',
  },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0' },
  th: {
    fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: '0.5px', color: '#8e8e93', padding: '0.6rem 0.75rem',
    borderBottom: '1px solid #e5e5ea', textAlign: 'left',
  },
  td: { padding: '0.75rem', borderBottom: '1px solid #f2f2f7', verticalAlign: 'middle', fontSize: '0.88rem' },
  viewBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '600',
    background: 'rgba(0, 122, 255, 0.1)', color: '#007AFF', border: 'none', cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  statusSelect: {
    padding: '0.35rem 0.6rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '500',
    border: '1.5px solid #e5e5ea', outline: 'none', background: '#fafafa',
    minWidth: '120px', cursor: 'pointer',
  },
  pdfLink: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '34px', height: '34px', borderRadius: '10px',
    background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30',
    border: 'none', textDecoration: 'none', fontSize: '1.1rem',
    transition: 'background 0.15s ease',
  },
  /* Modal */
  modalHeader: {
    background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
    color: '#fff', borderBottom: 'none', padding: '1.25rem 1.5rem',
    borderRadius: '16px 16px 0 0',
  },
  modalTitle: { fontWeight: '700', fontSize: '1.05rem' },
  modalBody: { padding: '1.5rem' },
  modalMeta: {
    background: '#f2f2f7', borderRadius: '12px', padding: '1rem 1.25rem',
    marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem',
  },
  modalMetaRow: { fontSize: '0.85rem', color: '#3a3a3c' },
  modalMetaStrong: { fontWeight: '600', color: '#1c1c1e' },
  modalTable: { width: '100%', borderCollapse: 'separate', borderSpacing: '0' },
  modalTh: {
    fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: '0.5px', color: '#8e8e93', padding: '0.6rem 0.75rem',
    borderBottom: '1px solid #e5e5ea', textAlign: 'left',
  },
  modalTd: { padding: '0.75rem', borderBottom: '1px solid #f2f2f7', verticalAlign: 'middle' },
  itemImg: {
    width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain',
    background: '#f2f2f7', padding: '2px',
  },
  modalFooter: { borderTop: 'none', padding: '0.75rem 1.5rem 1.25rem' },
  closeBtn: {
    padding: '0.45rem 1.1rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem',
    background: '#f2f2f7', color: '#3a3a3c', border: 'none', cursor: 'pointer',
  },
  emptyText: { textAlign: 'center', padding: '2.5rem', color: '#8e8e93', fontSize: '0.88rem' },
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

const AdminOrders = () => {
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [itemsLoading, setItemsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) navigate('/login');
      else if (!isAdmin) navigate('/');
    }
  }, [isAuthenticated, isAdmin, authLoading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/orders');
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Error fetching admin orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchOrders();
    }
  }, [isAuthenticated, isAdmin]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`/api/admin/orders/${orderId}`, { status: newStatus });
      alert(`Order #${orderId} status updated to ${newStatus}.`);
      await fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err.message);
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  const openItemsModal = async (order) => {
    try {
      setItemsLoading(true);
      setSelectedOrder(order);
      const res = await axios.get(`/api/orders/${order.id}`);
      setSelectedOrderItems(res.data.items);

      const modal = new window.bootstrap.Modal(document.getElementById('adminOrderItemsModal'));
      modal.show();
    } catch (err) {
      console.error('Error loading items:', err.message);
      alert('Failed to load order items.');
    } finally {
      setItemsLoading(false);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div style={ios.spinner}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={ios.page}>
      {/* Breadcrumb */}
      <nav style={ios.breadcrumb}>
        <Link to="/admin" style={ios.breadcrumbLink}>Admin</Link>
        <span style={ios.breadcrumbSep}><i className="bi bi-chevron-right" style={{ fontSize: '0.65rem' }}></i></span>
        <span style={ios.breadcrumbActive}>Orders</span>
      </nav>

      <h1 style={ios.title}>All Orders</h1>

      <div style={ios.sectionCard}>
        {orders.length === 0 ? (
          <p style={ios.emptyText}>No customer transactions logged.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={ios.table}>
              <thead>
                <tr>
                  <th style={ios.th}>Order</th>
                  <th style={ios.th}>Customer</th>
                  <th style={ios.th}>Total</th>
                  <th style={{ ...ios.th, textAlign: 'center' }}>Status</th>
                  <th style={{ ...ios.th, textAlign: 'center' }}>Invoice</th>
                  <th style={{ ...ios.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
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
                    <td style={{ ...ios.td, textAlign: 'center' }}>
                      {ord.invoice_url ? (
                        <a href={ord.invoice_url} target="_blank" rel="noopener noreferrer" style={ios.pdfLink}>
                          <i className="bi bi-file-earmark-pdf"></i>
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#c7c7cc', fontFamily: 'monospace' }}>Pending</span>
                      )}
                    </td>
                    <td style={{ ...ios.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => openItemsModal(ord)}
                          style={ios.viewBtn}
                          disabled={itemsLoading}
                        >
                          <i className="bi bi-eye"></i> Items
                        </button>
                        <select
                          style={ios.statusSelect}
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bootstrap Modal for Order Items */}
      <div className="modal fade" id="adminOrderItemsModal" tabIndex="-1" aria-labelledby="adminOrderItemsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="modal-header" style={ios.modalHeader}>
              <h5 className="modal-title" id="adminOrderItemsModalLabel" style={ios.modalTitle}>
                Order #{selectedOrder?.id}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body" style={ios.modalBody}>
              <div style={ios.modalMeta}>
                <div style={ios.modalMetaRow}><span style={ios.modalMetaStrong}>Delivery:</span> {selectedOrder?.shipping_address}</div>
                <div style={ios.modalMetaRow}><span style={ios.modalMetaStrong}>Date:</span> {selectedOrder ? new Date(selectedOrder.created_at).toLocaleString() : ''}</div>
                <div style={ios.modalMetaRow}><span style={ios.modalMetaStrong}>Total:</span> <span style={{ color: '#007AFF', fontWeight: '700' }}>₹{Number(selectedOrder?.total_amount).toFixed(2)}</span></div>
              </div>

              <h6 style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1c1c1e', marginBottom: '0.75rem' }}>Purchased Items</h6>
              <table style={ios.modalTable}>
                <thead>
                  <tr>
                    <th style={ios.modalTh}>Product</th>
                    <th style={{ ...ios.modalTh, textAlign: 'center' }}>Price</th>
                    <th style={{ ...ios.modalTh, textAlign: 'center' }}>Qty</th>
                    <th style={{ ...ios.modalTh, textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderItems.map((item) => (
                    <tr key={item.id}>
                      <td style={ios.modalTd}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {item.image_url ? (
                            <img
                              src={item.image_url.startsWith('http') ? item.image_url : `${window.location.origin}${item.image_url}`}
                              alt={item.name}
                              style={ios.itemImg}
                              onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23f2f2f7%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2210%22 fill=%22%23aaa%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22>No</text></svg>' }}
                            />
                          ) : (
                            <div style={{ ...ios.itemImg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <i className="bi bi-image" style={{ color: '#c7c7cc' }}></i>
                            </div>
                          )}
                          <span style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1c1c1e' }}>{item.name}</span>
                        </div>
                      </td>
                      <td style={{ ...ios.modalTd, textAlign: 'center', fontSize: '0.88rem' }}>₹{Number(item.price).toFixed(2)}</td>
                      <td style={{ ...ios.modalTd, textAlign: 'center', fontSize: '0.88rem' }}>{item.quantity}</td>
                      <td style={{ ...ios.modalTd, textAlign: 'right', fontWeight: '600', fontSize: '0.88rem', color: '#1c1c1e' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer" style={ios.modalFooter}>
              <button type="button" data-bs-dismiss="modal" style={ios.closeBtn}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
