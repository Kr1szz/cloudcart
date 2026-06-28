import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

const SkeletonGrid = ({ count = 6 }) => (
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

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSort(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      const queryParams = new URLSearchParams();
      const currentSearch = searchParams.get('search') || '';
      const currentCategory = searchParams.get('category') || '';
      const currentMinPrice = searchParams.get('minPrice') || '';
      const currentMaxPrice = searchParams.get('maxPrice') || '';
      const currentSort = searchParams.get('sort') || 'newest';
      const currentPage = Number(searchParams.get('page')) || 1;

      if (currentSearch) queryParams.set('search', currentSearch);
      if (currentCategory) queryParams.set('category', currentCategory);
      if (currentMinPrice) queryParams.set('minPrice', currentMinPrice);
      if (currentMaxPrice) queryParams.set('maxPrice', currentMaxPrice);
      if (currentSort) queryParams.set('sort', currentSort);
      queryParams.set('page', currentPage);
      queryParams.set('limit', 9);

      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/api/products?${queryParams.toString()}`, { timeout: 5000 });
        setProducts(res.data.products || []);
        setCategories(res.data.categories || []);
        setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
      } catch (err) {
        console.error('Error fetching products:', err.message);
        setProducts([]);
        setError('Unable to load products right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const hasActiveFilters = useMemo(
    () => Boolean(search || category || minPrice || maxPrice || sort !== 'newest'),
    [search, category, minPrice, maxPrice, sort]
  );

  const applyFilters = (event) => {
    event.preventDefault();
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sort) params.sort = sort;
    params.page = 1;
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const params = Object.fromEntries(searchParams.entries());
    params.page = newPage;
    setSearchParams(params);
  };

  return (
    <div className="catalog-page">
      <SEO
        title="Browse Products"
        description="Browse CloudCart products by keyword, category, price range, and newest arrivals in a clean cloud commerce catalog."
        keywords={['product catalog', 'browse products', 'ecommerce filters', 'online shopping']}
        canonical="/products"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'CloudCart Product Catalog',
          description: 'Browse products by keyword, category, price, and newest arrivals.',
        }}
      />

      <div className="page-shell">
        <header className="catalog-header">
          <div>
            <span className="eyebrow">
              <i className="bi bi-grid"></i>
              Product catalog
            </span>
            <h1>Browse products</h1>
            <p>Filter, sort, and inspect items with a cleaner shopping flow.</p>
          </div>
          {!loading && (
            <span className="catalog-count">
              {pagination.total || products.length} product{(pagination.total || products.length) === 1 ? '' : 's'}
            </span>
          )}
        </header>

        <div className="catalog-layout">
          <aside className="filter-panel">
            <div className="filter-panel-header">
              <h2>Filters</h2>
              {hasActiveFilters && (
                <button className="link-button" type="button" onClick={handleClearFilters}>
                  Clear
                </button>
              )}
            </div>

            <form onSubmit={applyFilters}>
              <div className="filter-group">
                <label htmlFor="catalogSearch">Search</label>
                <input
                  id="catalogSearch"
                  className="form-control"
                  type="search"
                  placeholder="Product name"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="filter-group">
                <label htmlFor="catalogCategory">Category</label>
                <select
                  id="catalogCategory"
                  className="form-select"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Price range</label>
                <div className="price-range">
                  <input
                    className="form-control"
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    aria-label="Minimum price"
                  />
                  <input
                    className="form-control"
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    aria-label="Maximum price"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label htmlFor="catalogSort">Sort by</label>
                <select
                  id="catalogSort"
                  className="form-select"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="newest">Newest arrivals</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary-custom w-100">
                Apply filters
              </button>
            </form>
          </aside>

          <main className="catalog-results">
            {loading ? (
              <SkeletonGrid />
            ) : error ? (
              <div className="empty-state">
                <div>
                  <span className="empty-state-icon">
                    <i className="bi bi-exclamation-circle"></i>
                  </span>
                  <h2>Products unavailable</h2>
                  <p>{error}</p>
                  <button className="btn btn-primary-custom" type="button" onClick={handleClearFilters}>
                    Reset catalog
                  </button>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div>
                  <span className="empty-state-icon">
                    <i className="bi bi-search"></i>
                  </span>
                  <h2>No products found</h2>
                  <p>Try a different search term, category, or price range.</p>
                  <button className="btn btn-primary-custom" type="button" onClick={handleClearFilters}>
                    View all products
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <nav className="pagination-clean" aria-label="Product pages">
                    <button
                      className="page-btn"
                      type="button"
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Previous
                    </button>

                    {Array.from({ length: pagination.pages }, (_, index) => index + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        className={`page-btn${pagination.page === pageNum ? ' active' : ''}`}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        aria-current={pagination.page === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      className="page-btn"
                      type="button"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
