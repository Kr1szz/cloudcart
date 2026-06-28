import React from 'react';
import { Link } from 'react-router-dom';

export const getProductImageSrc = (imageUrl) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  if (typeof window === 'undefined') return imageUrl;
  return `${window.location.origin}${imageUrl}`;
};

export const getCategoryVisualIcon = (name = '') => {
  const value = name.toLowerCase();
  if (value.includes('electronics') || value.includes('tech')) return 'bi-laptop';
  if (value.includes('apparel') || value.includes('fashion')) return 'bi-bag';
  if (value.includes('home') || value.includes('kitchen')) return 'bi-house-door';
  if (value.includes('book')) return 'bi-book';
  if (value.includes('fitness') || value.includes('outdoor') || value.includes('sport')) return 'bi-activity';
  if (value.includes('beauty')) return 'bi-stars';
  return 'bi-box-seam';
};

const ProductCard = ({ product, actionLabel = 'View details' }) => {
  const imageSrc = getProductImageSrc(product.image_url);
  const visualIcon = getCategoryVisualIcon(product.category_name);

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-media" aria-label={`View ${product.name}`}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
              event.currentTarget.nextElementSibling?.classList.remove('d-none');
            }}
          />
        ) : null}
        <span className={`product-image-fallback${imageSrc ? ' d-none' : ''}`} aria-hidden="true">
          <i className={`bi ${visualIcon}`}></i>
        </span>
      </Link>

      <div className="product-card-body">
        <span className="product-category">{product.category_name || 'Product'}</span>
        <Link to={`/products/${product.id}`} className="product-title">
          {product.name}
        </Link>
        {product.description && <p className="product-description">{product.description}</p>}
        <div className="product-card-footer">
          <span className="product-price">₹{Number(product.price).toFixed(2)}</span>
          <Link to={`/products/${product.id}`} className="btn btn-small-primary">
            <span>{actionLabel}</span>
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
