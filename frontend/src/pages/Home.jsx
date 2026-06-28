import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard, { getCategoryVisualIcon, getProductImageSrc } from '../components/ProductCard';
import SEO, { homeStructuredData } from '../components/SEO';

const categoryIconFor = (name = '') => {
  const value = name.toLowerCase();
  if (value.includes('electronics') || value.includes('tech')) return 'bi-laptop';
  if (value.includes('apparel') || value.includes('fashion')) return 'bi-bag';
  if (value.includes('home')) return 'bi-house-door';
  if (value.includes('book')) return 'bi-book';
  if (value.includes('sport')) return 'bi-activity';
  if (value.includes('beauty')) return 'bi-stars';
  if (value.includes('toy')) return 'bi-controller';
  if (value.includes('food')) return 'bi-basket';
  return 'bi-grid';
};

const benefits = [
  {
    icon: 'bi-truck',
    title: 'Free delivery',
    text: 'Simple shipping at checkout with clear order tracking.',
  },
  {
    icon: 'bi-shield-check',
    title: 'Secure account flow',
    text: 'Protected sign in, cart sync, and checkout confirmation.',
  },
  {
    icon: 'bi-receipt',
    title: 'Order records',
    text: 'Receipts, invoices, and order history stay easy to find.',
  },
];

const makeKpis = (catalogTotal, categoriesCount) => [
  {
    value: catalogTotal ? `${catalogTotal}` : 'Live',
    label: 'catalog items',
    detail: 'Searchable products with detail pages',
  },
  {
    value: categoriesCount ? `${categoriesCount}` : '5',
    label: 'shopping categories',
    detail: 'Clear category paths for faster discovery',
  },
  {
    value: '3',
    label: 'checkout signals',
    detail: 'Cart, receipt, and order history workflows',
  },
  {
    value: 'AWS',
    label: 'service layer',
    detail: 'Designed around cloud storage and messaging',
  },
];

const SkeletonGrid = ({ count = 4 }) => (
  <div className="skeleton-grid" aria-label="Loading products">
    {Array.from({ length: count }, (_, index) => (
      <div className="skeleton-card" key={index}>
        <div className="skeleton-media"></div>
        <div className="skeleton-body">
          <div className="skeleton-line short"></div>
          <div className="skeleton-line medium"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
    ))}
  </div>
);

const HeroFeature = ({ product }) => {
  if (!product) {
    return (
      <div className="hero-feature-tile">
        <div className="hero-feature-image">
          <i className="bi bi-box-seam"></i>
        </div>
        <div className="hero-feature-content">
          <span>Catalog</span>
          <strong>Curated products across everyday categories</strong>
          <p>Browse the latest listings</p>
        </div>
      </div>
    );
  }

  const imageSrc = getProductImageSrc(product.image_url);
  const visualIcon = getCategoryVisualIcon(product.category_name);

  return (
    <Link to={`/products/${product.id}`} className="hero-feature-tile">
      <div className="hero-feature-image">
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
        <i className={`bi ${visualIcon}${imageSrc ? ' d-none' : ''}`}></i>
      </div>
      <div className="hero-feature-content">
        <span>{product.category_name || 'Featured'}</span>
        <strong>{product.name}</strong>
        <p>₹{Number(product.price).toFixed(2)}</p>
      </div>
    </Link>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/products?limit=8', { timeout: 5000 });
        setProducts(res.data.products || []);
        setCategories(res.data.categories || []);
        setCatalogTotal(res.data.pagination?.total || res.data.products?.length || 0);
      } catch (err) {
        console.error('Error fetching home data:', err.message);
        setProducts([]);
        setCategories([]);
        setCatalogTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const heroProducts = useMemo(() => {
    if (products.length >= 3) return products.slice(0, 3);
    return [...products, ...Array.from({ length: 3 - products.length }, () => null)].slice(0, 3);
  }, [products]);

  const kpis = useMemo(
    () => makeKpis(catalogTotal, categories.length),
    [catalogTotal, categories.length]
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = search.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="home-page">
      <SEO
        title="Cloud Commerce Storefront"
        description="CloudCart is a polished cloud commerce storefront with searchable products, category browsing, cart, checkout, invoices, and customer account flows."
        keywords={['online store UI', 'product catalog', 'checkout UX', 'cloud storefront']}
        canonical="/"
        structuredData={homeStructuredData()}
      />

      <section className="hero-section">
        <div className="page-shell hero-layout">
          <div className="hero-copy">
            <span className="eyebrow">
              <i className="bi bi-cloud-check"></i>
              Cloud commerce demo
            </span>
            <h1>CloudCart</h1>
            <p>
              Browse a clean product catalog, keep a persistent cart, and move
              through checkout with a polished retail experience.
            </p>

            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary-custom">
                <i className="bi bi-bag"></i>
                Shop products
              </Link>
              <Link to="/products?sort=newest" className="btn btn-ghost">
                New arrivals
              </Link>
            </div>

            <form className="hero-search" onSubmit={handleSearchSubmit}>
              <i className="bi bi-search" aria-hidden="true"></i>
              <input
                type="search"
                placeholder="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search products"
              />
              <button type="submit">Search</button>
            </form>
          </div>

          <div className="hero-showcase" aria-label="Featured products">
            {heroProducts.map((product, index) => (
              <HeroFeature key={product?.id || `hero-${index}`} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="kpi-section" aria-label="CloudCart performance indicators">
        <div className="page-shell kpi-grid">
          {kpis.map((kpi) => (
            <div className="kpi-card" key={kpi.label}>
              <strong>{kpi.value}</strong>
              <span>{kpi.label}</span>
              <p>{kpi.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="page-shell">
          <div className="section-heading">
            <div>
              <h2>Shop by category</h2>
              <p>Start with the collections that matter most to you.</p>
            </div>
          </div>

          <div className="category-strip">
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  className="category-chip"
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                >
                  <i className={`bi ${categoryIconFor(category.name)}`}></i>
                  <span>{category.name}</span>
                </Link>
              ))
            ) : (
              ['Electronics', 'Apparel', 'Home', 'Books'].map((category) => (
                <Link
                  key={category}
                  className="category-chip"
                  to={`/products?category=${encodeURIComponent(category)}`}
                >
                  <i className={`bi ${categoryIconFor(category)}`}></i>
                  <span>{category}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="page-shell">
          <div className="section-heading">
            <div>
              <h2>Featured products</h2>
              <p>A quick look at the latest items in the catalog.</p>
            </div>
            <Link to="/products" className="btn btn-ghost">
              View all
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {loading ? (
            <SkeletonGrid />
          ) : products.length > 0 ? (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div>
                <span className="empty-state-icon">
                  <i className="bi bi-box"></i>
                </span>
                <h2>No products available</h2>
                <p>The catalog could not be loaded right now. Please try again later.</p>
                <Link to="/products" className="btn btn-primary-custom">
                  Browse catalog
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section-block">
        <div className="page-shell benefit-grid">
          {benefits.map((benefit) => (
            <div className="benefit-item" key={benefit.title}>
              <i className={`bi ${benefit.icon}`}></i>
              <div>
                <strong>{benefit.title}</strong>
                <p>{benefit.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
