import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-custom">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link className="footer-logo" to="/">
            <span className="brand-mark" aria-hidden="true">
              <i className="bi bi-cloud-haze2-fill"></i>
            </span>
            <span>CloudCart</span>
          </Link>
          <p>
            A polished cloud commerce demo with catalog browsing, checkout,
            invoices, and account workflows.
          </p>
        </div>

        <div>
          <h5>Shop</h5>
          <ul className="footer-links">
            <li><Link to="/products">All products</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/orders">Orders</Link></li>
          </ul>
        </div>

        <div>
          <h5>Account</h5>
          <ul className="footer-links">
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/login">Sign in</Link></li>
            <li><Link to="/register">Create account</Link></li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>&copy; {currentYear} CloudCart. All rights reserved.</span>
        <span>React, Node.js, and AWS services</span>
      </div>
    </footer>
  );
};

export default Footer;
