import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    `nav-link nav-link-custom${isActive ? ' active' : ''}`;

  const cartCount = getCartCount();
  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container nav-container">
        <Link className="navbar-brand navbar-brand-custom" to="/" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">
            <i className="bi bi-cloud-haze2-fill"></i>
          </span>
          <span>CloudCart</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarContent"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse${mobileOpen ? ' show' : ''}`} id="navbarContent">
          <ul className="navbar-nav me-auto mb-3 mb-lg-0">
            <li className="nav-item">
              <NavLink className={navClass} to="/" end onClick={closeMenu}>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={navClass} to="/products" onClick={closeMenu}>
                Products
              </NavLink>
            </li>
          </ul>

          <div className="nav-actions">
            <Link to="/cart" className="nav-icon-button" aria-label="Shopping cart" onClick={closeMenu}>
              <i className="bi bi-bag"></i>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>

            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="account-trigger"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="avatar-initial">{initial}</span>
                  <span className="account-name">{user.username}</span>
                  <i className="bi bi-chevron-down"></i>
                </button>

                <ul className="dropdown-menu dropdown-menu-end account-menu" aria-labelledby="userDropdown">
                  <li className="account-menu-header">
                    <span>{user.username}</span>
                    <small>{user.email || 'CloudCart member'}</small>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/profile" onClick={closeMenu}>
                      <i className="bi bi-person"></i>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/orders" onClick={closeMenu}>
                      <i className="bi bi-receipt"></i>
                      Orders
                    </Link>
                  </li>
                  {isAdmin && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link className="dropdown-item" to="/admin" onClick={closeMenu}>
                          <i className="bi bi-speedometer2"></i>
                          Admin
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" type="button" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right"></i>
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="auth-actions">
                <Link to="/login" className="btn btn-ghost" onClick={closeMenu}>
                  Sign in
                </Link>
                <Link to="/register" className="btn btn-primary-custom" onClick={closeMenu}>
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
