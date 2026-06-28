import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ios = {
  page: { maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' },
  title: { fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.5px', color: '#1c1c1e', marginBottom: '1.5rem' },
  successBanner: {
    background: 'linear-gradient(135deg, #34C759 0%, #30B350 100%)',
    color: '#fff',
    borderRadius: '16px',
    padding: '1.25rem 1.5rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    boxShadow: '0 4px 16px rgba(52, 199, 89, 0.3)',
    position: 'relative',
  },
  successIcon: { fontSize: '1.75rem', flexShrink: 0, marginTop: '0.1rem' },
  successTitle: { fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.2rem' },
  successText: { fontSize: '0.85rem', opacity: 0.92, lineHeight: 1.5 },
  dismissBtn: {
    position: 'absolute', top: '0.75rem', right: '0.75rem',
    background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%',
    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#fff', fontSize: '0.85rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: '0.75rem',
    padding: '1.25rem 1.5rem',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' },
  orderId: { fontWeight: '700', fontSize: '1rem', color: '#1c1c1e' },
  orderDate: { fontSize: '0.8rem', color: '#8e8e93' },
  row: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem 2rem', marginBottom: '0.85rem' },
  field: { display: 'flex', flexDirection: 'column' },
  fieldLabel: { fontSize: '0.68rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8e8e93', marginBottom: '0.15rem' },
  fieldValue: { fontSize: '0.92rem', fontWeight: '600', color: '#1c1c1e' },
  actions: { display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' },
  pdfBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.4rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600',
    background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', border: 'none', cursor: 'pointer',
    textDecoration: 'none', transition: 'background 0.15s ease',
  },
  viewBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.4rem 0.85rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600',
    background: 'rgba(0, 122, 255, 0.1)', color: '#007AFF', border: 'none', cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  emptyState: {
    textAlign: 'center', padding: '4rem 1.5rem',
    background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)',
    borderRadius: '16px', border: '1px solid rgba(0,0,0,0.04)',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
  },
  emptyIcon: { fontSize: '3.5rem', color: '#c7c7cc', marginBottom: '1rem' },
  emptyTitle: { fontWeight: '700', fontSize: '1.15rem', color: '#1c1c1e', marginBottom: '0.4rem' },
  emptyText: { fontSize: '0.88rem', color: '#8e8e93', marginBottom: '1.5rem' },
  shopBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.65rem 1.5rem', borderRadius: '12px', fontWeight: '600',
    background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', color: '#fff',
    border: 'none', textDecoration: 'none', fontSize: '0.9rem',
    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
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

const Orders = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(searchParams.get('success') === 'true');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/orders');
      setOrders(res.data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const viewOrderDetails = async (order) => {
    try {
      setModalLoading(true);
      setSelectedOrder(order);
      const res = await axios.get(`/api/orders/${order.id}`);
      setOrderItems(res.data.items);

      const modal = new window.bootstrap.Modal(document.getElementById('orderDetailsModal'));
      modal.show();
    } catch (err) {
      console.error('Error loading order details:', err.message);
      alert('Failed to load order item details.');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
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
      {/* Success Alert */}
      {showSuccessAlert && (
        <div style={ios.successBanner}>
          <i className="bi bi-checkmark-circle-fill" style={ios.successIcon}></i>
          <div>
            <div style={ios.successTitle}>Order Placed Successfully!</div>
            <div style={ios.successText}>
              Your order <strong>#{searchParams.get('orderId')}</strong> is confirmed. A confirmation email has been dispatched via Amazon SES, SMS notification generated via SNS, and the PDF Invoice has been rendered in AWS Lambda and uploaded to S3.
            </div>
          </div>
          <button style={ios.dismissBtn} onClick={() => setShowSuccessAlert(false)}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      <h1 style={ios.title}>My Orders</h1>

      {orders.length === 0 ? (
        <div style={ios.emptyState}>
          <div><i className="bi bi-bag-x" style={ios.emptyIcon}></i></div>
          <div style={ios.emptyTitle}>No Orders Yet</div>
          <div style={ios.emptyText}>You haven't placed any orders yet. Start shopping to see them here.</div>
          <Link to="/products" style={ios.shopBtn}>
            <i className="bi bi-bag-plus"></i> Start Shopping
          </Link>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id} style={ios.card}>
              <div style={ios.cardHeader}>
                <span style={ios.orderId}>Order #{order.id}</span>
                <span style={ios.orderDate}>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div style={ios.row}>
                <div style={ios.field}>
                  <span style={ios.fieldLabel}>Total</span>
                  <span style={{ ...ios.fieldValue, color: '#007AFF' }}>₹{Number(order.total_amount).toFixed(2)}</span>
                </div>
                <div style={ios.field}>
                  <span style={ios.fieldLabel}>Payment</span>
                  <span style={ios.fieldValue}><StatusPill status={order.payment_status} /></span>
                </div>
                <div style={ios.field}>
                  <span style={ios.fieldLabel}>Status</span>
                  <span style={ios.fieldValue}><StatusPill status={order.status} /></span>
                </div>
              </div>

              <div style={ios.actions}>
                {order.invoice_url ? (
                  <a
                    href={order.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={ios.pdfBtn}
                  >
                    <i className="bi bi-file-earmark-pdf"></i> Invoice
                  </a>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: '#8e8e93', fontFamily: 'monospace' }}>Generating...</span>
                )}
                <button
                  onClick={() => viewOrderDetails(order)}
                  style={ios.viewBtn}
                  disabled={modalLoading}
                >
                  <i className="bi bi-eye"></i> View Items
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bootstrap Modal for Order Details */}
      <div className="modal fade" id="orderDetailsModal" tabIndex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="modal-header" style={ios.modalHeader}>
              <h5 className="modal-title" id="orderDetailsModalLabel" style={ios.modalTitle}>
                Order #{selectedOrder?.id}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body" style={ios.modalBody}>
              <div style={ios.modalMeta}>
                <div style={ios.modalMetaRow}><span style={ios.modalMetaStrong}>Shipping:</span> {selectedOrder?.shipping_address}</div>
                <div style={ios.modalMetaRow}><span style={ios.modalMetaStrong}>Date:</span> {selectedOrder ? new Date(selectedOrder.created_at).toLocaleString() : ''}</div>
                <div style={ios.modalMetaRow}><span style={ios.modalMetaStrong}>Total:</span> <span style={{ color: '#007AFF', fontWeight: '700' }}>₹{Number(selectedOrder?.total_amount).toFixed(2)}</span></div>
              </div>

              <h6 style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1c1c1e', marginBottom: '0.75rem' }}>Items</h6>
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
                  {orderItems.map((item) => (
                    <tr key={item.id}>
                      <td style={ios.modalTd}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {item.image_url ? (
                            <img
                              src={item.image_url.startsWith('http') ? item.image_url : `${window.location.origin}${item.image_url}`}
                              alt={item.name}
                              style={ios.itemImg}
                              onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23f2f2f7%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2210%22 fill=%22%23aaa%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22>No Img</text></svg>' }}
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
              {selectedOrder?.invoice_url && (
                <a
                  href={selectedOrder.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...ios.pdfBtn, marginRight: 'auto' }}
                >
                  <i className="bi bi-file-earmark-pdf"></i> Download Invoice
                </a>
              )}
              <button type="button" data-bs-dismiss="modal" style={{
                padding: '0.45rem 1.1rem', borderRadius: '10px', fontWeight: '600',
                fontSize: '0.85rem', background: '#f2f2f7', color: '#3a3a3c', border: 'none', cursor: 'pointer',
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
