import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const styles = {
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
    gridTemplateColumns: '1fr 380px',
    gap: '24px',
    alignItems: 'start',
  },
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
    padding: '24px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  itemImage: {
    width: '72px',
    height: '72px',
    borderRadius: '14px',
    backgroundColor: '#f5f5f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '6px',
  },
  itemDetails: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1d1d1f',
    textDecoration: 'none',
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemPrice: {
    fontSize: '13px',
    color: '#86868b',
    marginTop: '4px',
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: '10px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  stepperBtn: {
    width: '36px',
    height: '36px',
    border: 'none',
    background: 'transparent',
    fontSize: '18px',
    fontWeight: '500',
    color: '#007aff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease',
  },
  stepperBtnDisabled: {
    color: '#c7c7cc',
    cursor: 'default',
  },
  stepperCount: {
    width: '40px',
    textAlign: 'center',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1d1d1f',
    borderLeft: '1px solid rgba(0,0,0,0.08)',
    borderRight: '1px solid rgba(0,0,0,0.08)',
    lineHeight: '36px',
  },
  lineTotal: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1d1d1f',
    minWidth: '70px',
    textAlign: 'right',
    flexShrink: 0,
  },
  deleteBtn: {
    width: '36px',
    height: '36px',
    border: 'none',
    background: 'rgba(255,59,48,0.1)',
    borderRadius: '10px',
    color: '#ff3b30',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: '20px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
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
  divider: {
    height: '1px',
    background: 'rgba(0,0,0,0.08)',
    margin: '16px 0',
    border: 'none',
  },
  grandTotalLabel: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  grandTotalValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  checkoutBtn: {
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
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    letterSpacing: '-0.2px',
  },
  authNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(0,122,255,0.08)',
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#007aff',
    marginTop: '16px',
  },
  continueLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '20px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#007aff',
    textDecoration: 'none',
    transition: 'opacity 0.2s ease',
  },
  /* Empty state */
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
  emptyTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '15px',
    color: '#86868b',
    marginBottom: '28px',
    maxWidth: '340px',
  },
  browsePillBtn: {
    padding: '14px 32px',
    border: 'none',
    borderRadius: '980px',
    background: '#007aff',
    color: '#ffffff',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.25s ease',
  },
};

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutRedirect = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  const handleQtyChange = async (itemId, newQty, stock) => {
    if (newQty <= 0) return;
    if (newQty > stock) {
      alert(`Only ${stock} items available in stock!`);
      return;
    }
    try {
      await updateQuantity(itemId, newQty);
    } catch (err) {
      alert(err.message);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, ...styles.emptyContainer }}>
          <div style={styles.emptyIcon}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              <line x1="10" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <h2 style={styles.emptyTitle}>Your Cart is Empty</h2>
          <p style={styles.emptyText}>
            Looks like you haven't added anything yet. Explore our collection and find something you love.
          </p>
          <Link to="/products" style={styles.browsePillBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Shopping Cart</h1>

      <div style={styles.layout}>
        {/* Left: Cart Items */}
        <div>
          <div style={styles.card}>
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  ...styles.itemRow,
                  ...(index === cartItems.length - 1 ? { borderBottom: 'none' } : {}),
                }}
              >
                {/* Product Image */}
                <div style={styles.itemImage}>
                  {item.image_url ? (
                    <img
                      src={item.image_url.startsWith('http') ? item.image_url : `${window.location.origin}${item.image_url}`}
                      alt={item.name}
                      style={styles.img}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23f5f5f7%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2212%22 fill=%22%23aaa%22 text-anchor=%22middle%22 dy=%223%22>No Image</text></svg>';
                      }}
                    />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </div>

                {/* Product Details */}
                <div style={styles.itemDetails}>
                  <Link to={`/products/${item.product_id}`} style={styles.itemName}>
                    {item.name}
                  </Link>
                  <div style={styles.itemPrice}>₹{Number(item.price).toFixed(2)} each</div>
                </div>

                {/* iOS Quantity Stepper */}
                <div style={styles.stepper}>
                  <button
                    style={{
                      ...styles.stepperBtn,
                      ...(item.quantity <= 1 ? styles.stepperBtnDisabled : {}),
                    }}
                    onClick={() => handleQtyChange(item.id, item.quantity - 1, item.stock)}
                    disabled={item.quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span style={styles.stepperCount}>{item.quantity}</span>
                  <button
                    style={styles.stepperBtn}
                    onClick={() => handleQtyChange(item.id, item.quantity + 1, item.stock)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Line Total */}
                <span style={styles.lineTotal}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>

                {/* Delete Button */}
                <button
                  style={styles.deleteBtn}
                  onClick={() => removeFromCart(item.id)}
                  aria-label="Remove item"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,59,48,0.18)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,59,48,0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <Link
            to="/products"
            style={styles.continueLink}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Right: Order Summary */}
        <div style={styles.card}>
          <h3 style={styles.summaryTitle}>Order Summary</h3>

          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span style={styles.summaryValue}>₹{getCartTotal().toFixed(2)}</span>
          </div>

          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Shipping</span>
            <span style={styles.freeBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Free
            </span>
          </div>

          <div style={styles.divider} />

          <div style={{ ...styles.summaryRow, marginBottom: 0 }}>
            <span style={styles.grandTotalLabel}>Total</span>
            <span style={styles.grandTotalValue}>₹{getCartTotal().toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckoutRedirect}
            style={styles.checkoutBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0066d6';
              e.currentTarget.style.transform = 'scale(1.01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#007aff';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Proceed to Checkout
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          {!isAuthenticated && (
            <div style={styles.authNotice}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Sign in required before checkout
            </div>
          )}
        </div>
      </div>

      {/* Responsive override for mobile */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;
