import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { getProductImageSrc } from '../components/ProductCard';
import SEO from '../components/SEO';

const Stars = ({ rating }) => {
  const value = Math.round(Number(rating) || 0);

  return (
    <span className="rating-stars" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <i key={index} className={`bi ${index < value ? 'bi-star-fill' : 'bi-star'}`}></i>
      ))}
    </span>
  );
};

const LoadingState = () => (
  <div className="loading-state">
    <div className="text-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 mb-0">Loading product...</p>
    </div>
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const res = await axios.get(`/api/products/${id}`, { timeout: 5000 });
        setProduct(res.data.product);
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error('Error fetching product details:', err.message);
        setProduct(null);
        setErrorMsg('Product not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return total / reviews.length;
  }, [reviews]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAdding(true);
      setErrorMsg('');
      setSuccessMsg('');
      await addToCart(product, quantity);
      setSuccessMsg(`Added ${quantity} item${quantity === 1 ? '' : 's'} to cart.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add item to cart.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <LoadingState />;

  if (!product) {
    return (
      <div className="product-detail-page">
        <SEO
          title="Product Unavailable"
          description="This CloudCart product could not be loaded."
          canonical={`/products/${id}`}
          noIndex
        />
        <div className="page-shell">
          <div className="empty-state">
            <div>
              <span className="empty-state-icon">
                <i className="bi bi-exclamation-circle"></i>
              </span>
              <h2>Product unavailable</h2>
              <p>{errorMsg || 'This product could not be loaded.'}</p>
              <Link to="/products" className="btn btn-primary-custom">
                Back to products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stock = Number(product.stock || 0);
  const maxQty = Math.min(stock, 10);
  const imageSrc = getProductImageSrc(product.image_url);
  const productDescription =
    product.description ||
    `${product.name} in the CloudCart product catalog.`;

  return (
    <div className="product-detail-page">
      <SEO
        title={product.name}
        description={productDescription}
        keywords={[product.name, product.category_name, 'product details', 'CloudCart catalog']}
        canonical={`/products/${product.id}`}
        image={imageSrc}
        type="product"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: productDescription,
          category: product.category_name,
          image: imageSrc || undefined,
          offers: {
            '@type': 'Offer',
            price: Number(product.price).toFixed(2),
            priceCurrency: 'USD',
            availability: stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
          aggregateRating: reviews.length
            ? {
                '@type': 'AggregateRating',
                ratingValue: averageRating.toFixed(1),
                reviewCount: reviews.length,
              }
            : undefined,
        }}
      />
      <div className="page-shell">
        <nav className="breadcrumb-clean" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <i className="bi bi-chevron-right"></i>
          <Link to="/products">Products</Link>
          <i className="bi bi-chevron-right"></i>
          <span>{product.name}</span>
        </nav>

        <div className="detail-layout">
          <div className="product-gallery">
            {imageSrc ? (
              <>
                <img
                  src={imageSrc}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                    event.currentTarget.nextElementSibling?.classList.remove('d-none');
                  }}
                />
                <div className="detail-image-fallback d-none" aria-hidden="true">
                  <i className="bi bi-image"></i>
                </div>
              </>
            ) : (
              <div className="detail-image-fallback" aria-hidden="true">
                <i className="bi bi-image"></i>
              </div>
            )}
          </div>

          <section className="detail-summary">
            <span className="eyebrow">
              <i className="bi bi-tag"></i>
              {product.category_name}
            </span>

            <h1>{product.name}</h1>

            <div className="rating-row">
              {reviews.length > 0 ? (
                <>
                  <Stars rating={averageRating} />
                  <span>
                    {reviews.length} review{reviews.length === 1 ? '' : 's'}
                  </span>
                </>
              ) : (
                <span>No reviews yet</span>
              )}
            </div>

            <div className="detail-price">₹{Number(product.price).toFixed(2)}</div>

            <div className="description-block">
              <h2>Description</h2>
              <p>{product.description}</p>
            </div>

            <div className="availability-row">
              <span>Availability</span>
              {stock > 0 ? (
                <span className="status-pill success">
                  <i className="bi bi-check-circle"></i>
                  In stock ({stock})
                </span>
              ) : (
                <span className="status-pill danger">
                  <i className="bi bi-x-circle"></i>
                  Out of stock
                </span>
              )}
            </div>

            {stock > 0 && (
              <div className="detail-purchase-panel">
                <div className="purchase-row">
                  <div>
                    <div className="form-label mb-2">Quantity</div>
                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                        disabled={quantity >= maxQty}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="add-cart-btn"
                    onClick={handleAddToCart}
                    disabled={adding}
                  >
                    {adding ? 'Adding...' : 'Add to cart'}
                  </button>
                </div>
              </div>
            )}

            <div aria-live="polite">
              {successMsg && (
                <div className="feedback-banner success">
                  <i className="bi bi-check-circle"></i>
                  <span>{successMsg}</span>
                  <Link to="/cart">View cart</Link>
                </div>
              )}

              {errorMsg && product && (
                <div className="feedback-banner danger">
                  <i className="bi bi-exclamation-circle"></i>
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="reviews-section">
          <h2>Customer reviews</h2>

          {reviews.length === 0 ? (
            <div className="empty-state">
              <div>
                <span className="empty-state-icon">
                  <i className="bi bi-chat-left-text"></i>
                </span>
                <h3>No reviews yet</h3>
                <p>Reviews for this product will appear here once customers share feedback.</p>
              </div>
            </div>
          ) : (
            <div className="review-list">
              {reviews.map((review) => (
                <article className="review-card" key={review.id}>
                  <div className="review-header">
                    <div className="review-user">
                      <span className="review-avatar">
                        {review.username ? review.username.charAt(0).toUpperCase() : 'U'}
                      </span>
                      <span>{review.username || 'Customer'}</span>
                    </div>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Stars rating={review.rating} />
                  <p>{review.comment}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductDetails;
