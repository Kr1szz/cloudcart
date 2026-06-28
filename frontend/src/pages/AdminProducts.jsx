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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.5px', color: '#1c1c1e' },
  addBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.6rem 1.25rem', borderRadius: '12px', fontWeight: '600', fontSize: '0.88rem',
    background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', color: '#fff',
    border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
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
  productImg: {
    width: '48px', height: '48px', borderRadius: '10px', objectFit: 'contain',
    background: '#f2f2f7', padding: '3px',
  },
  productName: { fontWeight: '600', color: '#1c1c1e', display: 'block' },
  productId: { fontSize: '0.75rem', color: '#8e8e93', fontFamily: 'monospace' },
  stockBadge: (inStock) => ({
    display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '50px',
    fontSize: '0.72rem', fontWeight: '600',
    background: inStock ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 59, 48, 0.12)',
    color: inStock ? '#34C759' : '#FF3B30',
  }),
  iconBtn: (color) => ({
    width: '34px', height: '34px', borderRadius: '10px', border: 'none', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: `rgba(${color}, 0.1)`, transition: 'background 0.15s ease', fontSize: '0.9rem',
  }),
  /* Modal */
  modalHeader: {
    background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
    color: '#fff', borderBottom: 'none', padding: '1.25rem 1.5rem',
    borderRadius: '16px 16px 0 0',
  },
  modalTitle: { fontWeight: '700', fontSize: '1.05rem' },
  modalBody: { padding: '1.5rem' },
  formLabel: {
    fontSize: '0.78rem', fontWeight: '600', color: '#3a3a3c',
    marginBottom: '0.35rem', display: 'block',
  },
  formInput: {
    width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
    border: '1.5px solid #e5e5ea', fontSize: '0.88rem', outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    background: '#fafafa', boxSizing: 'border-box',
  },
  formSelect: {
    width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
    border: '1.5px solid #e5e5ea', fontSize: '0.88rem', outline: 'none',
    background: '#fafafa', boxSizing: 'border-box', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%238e8e93'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.9rem center',
  },
  formTextarea: {
    width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px',
    border: '1.5px solid #e5e5ea', fontSize: '0.88rem', outline: 'none',
    background: '#fafafa', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box',
  },
  formFile: {
    width: '100%', padding: '0.6rem 0.9rem', borderRadius: '10px',
    border: '1.5px solid #e5e5ea', fontSize: '0.85rem', background: '#fafafa', boxSizing: 'border-box',
  },
  formHint: { fontSize: '0.75rem', color: '#8e8e93', marginTop: '0.3rem' },
  alertError: {
    background: 'rgba(255, 59, 48, 0.08)', color: '#FF3B30',
    borderRadius: '10px', padding: '0.65rem 0.9rem', fontSize: '0.82rem', fontWeight: '500',
    display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem',
  },
  alertSuccess: {
    background: 'rgba(52, 199, 89, 0.08)', color: '#34C759',
    borderRadius: '10px', padding: '0.65rem 0.9rem', fontSize: '0.82rem', fontWeight: '500',
    display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem',
  },
  modalFooter: { borderTop: 'none', padding: '0.75rem 1.5rem 1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' },
  cancelBtn: {
    padding: '0.5rem 1.1rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem',
    background: '#f2f2f7', color: '#3a3a3c', border: 'none', cursor: 'pointer',
  },
  submitBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1.25rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem',
    background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)', color: '#fff',
    border: 'none', cursor: 'pointer', boxShadow: '0 3px 10px rgba(0, 122, 255, 0.25)',
  },
  emptyText: { textAlign: 'center', padding: '2.5rem', color: '#8e8e93', fontSize: '0.88rem' },
  spinner: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem 0' },
};

const AdminProducts = () => {
  const { user, isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editMode, setEditMode] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) navigate('/login');
      else if (!isAdmin) navigate('/');
    }
  }, [isAuthenticated, isAdmin, authLoading]);

  const fetchProductsAndCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/products?limit=100');
      setProducts(res.data.products);
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Error fetching admin products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchProductsAndCategories();
    }
  }, [isAuthenticated, isAdmin]);

  const resetForm = () => {
    setEditMode(false);
    setSelectedProductId(null);
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setCategoryId('');
    setImageFile(null);
    setFormError('');
    setFormSuccess('');
    const fileInput = document.getElementById('productImage');
    if (fileInput) fileInput.value = '';
  };

  const openAddModal = () => {
    resetForm();
    const modal = new window.bootstrap.Modal(document.getElementById('productFormModal'));
    modal.show();
  };

  const openEditModal = (prod) => {
    resetForm();
    setEditMode(true);
    setSelectedProductId(prod.id);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price);
    setStock(prod.stock);
    setCategoryId(prod.category_id);

    const modal = new window.bootstrap.Modal(document.getElementById('productFormModal'));
    modal.show();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !price || !stock || !categoryId) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      setFormSuccess('');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('category_id', categoryId);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      let res;
      if (editMode) {
        res = await axios.put(`/api/products/${selectedProductId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFormSuccess('Product updated successfully!');
      } else {
        res = await axios.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFormSuccess('Product created successfully!');
      }

      await fetchProductsAndCategories();

      setTimeout(() => {
        const modalEl = document.getElementById('productFormModal');
        const modal = window.bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        resetForm();
      }, 1500);

    } catch (err) {
      console.error('Submit error:', err);
      setFormError(err.response?.data?.message || 'Failed to submit form.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This will remove all RDS listings and the S3 image file.')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/products/${id}`);
      await fetchProductsAndCategories();
      alert('Product deleted successfully.');
    } catch (err) {
      console.error('Delete error:', err.message);
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && products.length === 0) {
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
        <span style={ios.breadcrumbActive}>Products</span>
      </nav>

      {/* Header */}
      <div style={ios.header}>
        <h1 style={ios.title}>Products</h1>
        <button onClick={openAddModal} style={ios.addBtn}>
          <i className="bi bi-plus-circle"></i> Add Product
        </button>
      </div>

      {/* Products Table */}
      <div style={ios.sectionCard}>
        {products.length === 0 ? (
          <p style={ios.emptyText}>No products found in the catalog.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={ios.table}>
              <thead>
                <tr>
                  <th style={ios.th}>Product</th>
                  <th style={ios.th}>Category</th>
                  <th style={ios.th}>Price</th>
                  <th style={{ ...ios.th, textAlign: 'center' }}>Stock</th>
                  <th style={{ ...ios.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id}>
                    <td style={ios.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {prod.image_url ? (
                          <img
                            src={prod.image_url.startsWith('http') ? prod.image_url : `${window.location.origin}${prod.image_url}`}
                            alt={prod.name}
                            style={ios.productImg}
                            onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23f2f2f7%22/><text x=%2250%25%22 y=%2250%25%22 font-size=%2210%22 fill=%22%23aaa%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22>No</text></svg>' }}
                          />
                        ) : (
                          <div style={{ ...ios.productImg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-image" style={{ color: '#c7c7cc' }}></i>
                          </div>
                        )}
                        <div style={{ maxWidth: '250px' }}>
                          <span style={ios.productName}>{prod.name}</span>
                          <span style={ios.productId}>ID: #{prod.id}</span>
                        </div>
                      </div>
                    </td>
                    <td style={ios.td}>{prod.category_name}</td>
                    <td style={{ ...ios.td, fontWeight: '600', color: '#007AFF' }}>₹{Number(prod.price).toFixed(2)}</td>
                    <td style={{ ...ios.td, textAlign: 'center' }}>
                      <span style={ios.stockBadge(prod.stock > 0)}>
                        {prod.stock > 0 ? `${prod.stock} Units` : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ ...ios.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => openEditModal(prod)}
                          style={ios.iconBtn('142, 142, 147')}
                          title="Edit"
                        >
                          <i className="bi bi-pencil" style={{ color: '#8e8e93' }}></i>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          style={ios.iconBtn('255, 59, 48')}
                          title="Delete"
                        >
                          <i className="bi bi-trash" style={{ color: '#FF3B30' }}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bootstrap Modal for Add/Edit */}
      <div className="modal fade" id="productFormModal" tabIndex="-1" aria-labelledby="productFormModalLabel" aria-hidden="true" data-bs-backdrop="static">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="modal-header" style={ios.modalHeader}>
              <h5 className="modal-title" id="productFormModalLabel" style={ios.modalTitle}>
                {editMode ? 'Edit Product' : 'Add New Product'}
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body" style={ios.modalBody}>
                {formError && (
                  <div style={ios.alertError}>
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div style={ios.alertSuccess}>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={ios.formLabel}>Product Name *</label>
                    <input
                      type="text"
                      style={ios.formInput}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={(e) => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e5ea'; e.target.style.boxShadow = 'none'; }}
                      required
                    />
                  </div>
                  <div>
                    <label style={ios.formLabel}>Category *</label>
                    <select
                      style={ios.formSelect}
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      onFocus={(e) => { e.target.style.borderColor = '#007AFF'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e5ea'; }}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={ios.formLabel}>Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      style={ios.formInput}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      onFocus={(e) => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e5ea'; e.target.style.boxShadow = 'none'; }}
                      required
                    />
                  </div>
                  <div>
                    <label style={ios.formLabel}>Stock *</label>
                    <input
                      type="number"
                      style={ios.formInput}
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      onFocus={(e) => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e5ea'; e.target.style.boxShadow = 'none'; }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={ios.formLabel}>Description *</label>
                  <textarea
                    style={ios.formTextarea}
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onFocus={(e) => { e.target.style.borderColor = '#007AFF'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e5ea'; e.target.style.boxShadow = 'none'; }}
                    required
                  ></textarea>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={ios.formLabel}>Product Image {!editMode && '*'}</label>
                  <input
                    type="file"
                    id="productImage"
                    className="form-control"
                    style={ios.formFile}
                    onChange={(e) => setImageFile(e.target.files[0])}
                    required={!editMode}
                  />
                  <div style={ios.formHint}>JPG, PNG, or WEBP only (max 5MB). Stored in AWS S3.</div>
                </div>
              </div>

              <div className="modal-footer" style={ios.modalFooter}>
                <button type="button" style={ios.cancelBtn} data-bs-dismiss="modal" onClick={resetForm}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ ...ios.submitBtn, opacity: submitting ? 0.7 : 1 }}>
                  {submitting && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                  <span>{editMode ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
