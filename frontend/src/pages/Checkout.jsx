import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const s = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
  },
  pageTitle: {
    fontSize: '34px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: '#1d1d1f',
    marginBottom: '32px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '24px',
    alignItems: 'start',
  },
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
    padding: '28px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionNum: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#007aff',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
  fieldGroup: {
    marginBottom: '20px',
  },
  radioCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    borderRadius: '14px',
    border: '2px solid #e5e5ea',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '10px',
  },
  radioCardActive: {
    borderColor: '#007aff',
    backgroundColor: 'rgba(0,122,255,0.04)',
  },
  radioOuter: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: '2px solid #c7c7cc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'border-color 0.2s ease',
  },
  radioOuterActive: {
    borderColor: '#007aff',
  },
  radioInner: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#007aff',
    transition: 'transform 0.2s ease',
  },
  radioLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1d1d1f',
  },
  radioSub: {
    fontSize: '13px',
    color: '#86868b',
    marginTop: '2px',
  },
  radioIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
  },
  placeBtn: {
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
  },
  placeBtnDisabled: {
    opacity: 0.7,
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
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  orderItemName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1d1d1f',
    maxWidth: '220px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  orderItemQty: {
    fontSize: '13px',
    color: '#86868b',
    marginTop: '2px',
  },
  orderItemPrice: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1d1d1f',
    flexShrink: 0,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  summaryLabel: {
    fontSize: '15px',
    color: '#86868b',
  },
  summaryValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1d1d1f',
  },
  divider: {
    height: '1px',
    background: 'rgba(0,0,0,0.08)',
    margin: '16px 0',
    border: 'none',
  },
  grandLabel: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  grandValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  freeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(52,199,89,0.12)',
    color: '#34c759',
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    background: 'rgba(0,0,0,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    color: '#c7c7cc',
    marginBottom: '24px',
  },
  browsePill: {
    padding: '14px 32px',
    border: 'none',
    borderRadius: '980px',
    background: '#007aff',
    color: '#ffffff',
    fontSize: '17px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
};

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?redirect=checkout');
    }
  }, [isAuthenticated, authLoading]);

  // Autofill from user profile if available
  useEffect(() => {
    if (user) {
      setAddress(user.address || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      setErrorMsg('Please enter both shipping address and phone number.');
      return;
    }

    try {
      setProcessing(true);
      setErrorMsg('');

      const orderRes = await axios.post('/api/orders', {
        shipping_address: `${address} (Phone: ${phone})`,
        payment_method: paymentMethod,
      });

      await clearCart();
      navigate(`/orders?success=true&orderId=${orderRes.data.orderId}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, ...s.emptyContainer }}>
          <div style={s.emptyIcon}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1d1d1f', marginBottom: '8px' }}>No Items to Checkout</h2>
          <p style={{ fontSize: '15px', color: '#86868b', marginBottom: '28px', maxWidth: '340px' }}>Your cart is empty. Browse our products and find something you love.</p>
          <Link to="/products" style={s.browsePill}>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <h1 style={s.pageTitle}>Checkout</h1>

      <div style={s.layout}>
        {/* Left Column: Shipping + Payment */}
        <div>
          {/* Shipping Card */}
          <div style={s.card}>
            <div style={s.sectionTitle}>
              <span style={s.sectionNum}>1</span>
              Shipping Details
            </div>

            <form onSubmit={handleSubmitOrder} id="checkout-form">
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
                <div style={s.inputHint}>Required for SNS SMS delivery notifications</div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Shipping Address</label>
                <textarea
                  style={{ ...s.input, resize: 'none', minHeight: '90px' }}
                  placeholder="123 Main St, Apt 4B, San Jose, CA 95112"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onFocus={(e) => (e.target.style.boxShadow = '0 0 0 4px rgba(0,122,255,0.15)')}
                  onBlur={(e) => (e.target.style.boxShadow = 'none')}
                  required
                />
              </div>
            </form>
          </div>

          {/* Payment Card */}
          <div style={s.card}>
            <div style={s.sectionTitle}>
              <span style={s.sectionNum}>2</span>
              Payment Method
            </div>

            {/* Credit Card Option */}
            <div
              style={{
                ...s.radioCard,
                ...(paymentMethod === 'Credit Card' ? s.radioCardActive : {}),
              }}
              onClick={() => setPaymentMethod('Credit Card')}
            >
              <div style={{ ...s.radioIcon, background: 'rgba(0,122,255,0.1)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.radioLabel}>Credit / Debit Card</div>
                <div style={s.radioSub}>Simulated payment processing</div>
              </div>
              <div style={{ ...s.radioOuter, ...(paymentMethod === 'Credit Card' ? s.radioOuterActive : {}) }}>
                {paymentMethod === 'Credit Card' && <div style={s.radioInner} />}
              </div>
            </div>

            {/* COD Option */}
            <div
              style={{
                ...s.radioCard,
                ...(paymentMethod === 'Cash On Delivery' ? s.radioCardActive : {}),
              }}
              onClick={() => setPaymentMethod('Cash On Delivery')}
            >
              <div style={{ ...s.radioIcon, background: 'rgba(52,199,89,0.1)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.radioLabel}>Cash on Delivery</div>
                <div style={s.radioSub}>Pay when your order arrives</div>
              </div>
              <div style={{ ...s.radioOuter, ...(paymentMethod === 'Cash On Delivery' ? s.radioOuterActive : {}) }}>
                {paymentMethod === 'Cash On Delivery' && <div style={s.radioInner} />}
              </div>
            </div>
          </div>

          {/* Error + Submit */}
          {errorMsg && (
            <div style={s.errorBox}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            form="checkout-form"
            disabled={processing}
            style={{
              ...s.placeBtn,
              ...(processing ? s.placeBtnDisabled : {}),
            }}
            onMouseEnter={(e) => { if (!processing) { e.currentTarget.style.background = '#0066d6'; e.currentTarget.style.transform = 'scale(1.01)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#007aff'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {processing ? (
              <>
                <div style={s.spinner} />
                Processing order...
              </>
            ) : (
              <>
                Place order - ₹{getCartTotal().toFixed(2)}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Order Summary */}
        <div style={{ ...s.card, position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1d1d1f', marginBottom: '16px' }}>
            Order Summary
          </h3>

          <div>
            {cartItems.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  ...s.orderItem,
                  ...(idx === cartItems.length - 1 ? { borderBottom: 'none' } : {}),
                }}
              >
                <div>
                  <div style={s.orderItemName}>{item.name}</div>
                  <div style={s.orderItemQty}>Qty {item.quantity} × ₹{Number(item.price).toFixed(2)}</div>
                </div>
                <div style={s.orderItemPrice}>₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={s.divider} />

          <div style={s.summaryRow}>
            <span style={s.summaryLabel}>Subtotal</span>
            <span style={s.summaryValue}>₹{getCartTotal().toFixed(2)}</span>
          </div>
          <div style={s.summaryRow}>
            <span style={s.summaryLabel}>Shipping</span>
            <span style={s.freeBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Free
            </span>
          </div>

          <div style={s.divider} />

          <div style={{ ...s.summaryRow, marginBottom: 0 }}>
            <span style={s.grandLabel}>Total</span>
            <span style={s.grandValue}>₹{getCartTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes iosSpinner {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 400px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
