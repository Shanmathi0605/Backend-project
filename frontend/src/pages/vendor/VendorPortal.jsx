import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiList, FiTag, FiTrendingUp, FiCreditCard,
  FiStar, FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiInfo
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { vendorService } from '../../services/vendor';
import { productService } from '../../services/product';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import { api } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './VendorPortal.module.css';

// ----------------------------------------------------
// 1. VENDOR DASHBOARD OVERVIEW & ANALYTICS
// ----------------------------------------------------
export const VendorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await vendorService.getDashboardStats(user.id);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.id]);

  if (loading) return <Loader text="Loading dashboard metrics..." />;

  // Find max sales month for graph scaling
  const maxSaleAmt = Math.max(...stats.recentSales.map((s) => s.amount), 100);

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {user.name}</h1>
          <p className={styles.subtitle}>Overview store performance metrics and client sales volumes.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#EFF6FF', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--border-radius-md)', fontSize: '20px' }}><FiShoppingBag /></div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalProducts}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Listed Products</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#D1FAE5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--border-radius-md)', fontSize: '20px' }}><FiTrendingUp /></div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>${stats.totalSales.toFixed(2)}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Sales volume</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--border-radius-md)', fontSize: '20px' }}><FiCreditCard /></div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>${stats.walletBalance.toFixed(2)}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Withdrawable Balance</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--border-radius-md)', fontSize: '20px' }}><FiList /></div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalOrders}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Customer Orders</p>
          </div>
        </div>
      </div>

      {/* Interactive Bar Chart */}
      <div className={styles.chartContainer} style={{ height: '400px' }}>
        <h3 className={styles.chartTitle}>Monthly Sales Volume ($)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.recentSales} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" name="Sales ($)" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 2. STORE PROFILE & SETTINGS
// ----------------------------------------------------
export const VendorStoreProfile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [storeName, setStoreName] = useState(user.storeName || 'TechNova Solutions');
  const [desc, setDesc] = useState(user.storeDescription || 'Premium electronics store delivering genuine goods.');
  const [logo, setLogo] = useState(user.storeLogo || 'https://images.unsplash.com/photo-1612810806563-4cb1a99a2037?q=80&w=200&auto=format&fit=crop');
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      addToast('Store Name field is required', 'warning');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ storeName, storeDescription: desc, storeLogo: logo });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Store Profile & Settings</h1>
      </div>
      <div style={{ maxWidth: '600px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--border-radius-lg)' }}>
        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Store Name</label>
            <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Store Logo Link</label>
            <input type="text" value={logo} onChange={(e) => setLogo(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Store Description</label>
            <textarea rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', fontSize: '14px' }} />
          </div>
          <button type="submit" disabled={saving} style={{ alignSelf: 'start', backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '12px 24px', borderRadius: 'var(--border-radius-md)', fontWeight: '600', cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. MANAGE PRODUCTS (LIST, CREATE, EDIT)
// ----------------------------------------------------
export const VendorProducts = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDiscount, setPDiscount] = useState('');
  const [pStock, setPStock] = useState('');
  const [pCategory, setPCategory] = useState('Electronics');
  const [pBrand, setPBrand] = useState('Generic');
  const [pImage, setPImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pVariants, setPVariants] = useState([]);

  const loadProducts = async () => {
    try {
      const data = await vendorService.getProducts(user.id);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [user.id]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setPName('');
    setPDesc('');
    setPPrice('');
    setPDiscount('');
    setPStock('');
    setPCategory('Electronics');
    setPBrand('Generic');
    setPImage('');
    setPVariants([]);
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setPName(p.name);
    setPDesc(p.description);
    setPPrice(p.price.toString());
    setPDiscount((p.discount || 0).toString());
    setPStock(p.stock.toString());
    setPCategory(p.category);
    setPBrand(p.brand);
    setPImage(p.images && p.images[0] ? p.images[0] : '');
    setPVariants(p.variants ? p.variants.map(v => ({ name: v.name, options: v.options.join(', ') })) : []);
    setShowModal(true);
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPImage(`http://localhost:5000${data}`);
      addToast('Image uploaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pName.trim() || !pPrice.trim() || !pStock.trim()) {
      addToast('Please fill out all product details', 'warning');
      return;
    }

    const payload = {
      name: pName,
      description: pDesc,
      price: pPrice,
      discount: pDiscount,
      stock: pStock,
      category: pCategory,
      brand: pBrand,
      images: pImage ? [pImage] : [],
      variants: pVariants.filter(v => v.name.trim()).map(v => ({
        name: v.name.trim(),
        options: v.options.split(',').map(o => o.trim()).filter(Boolean)
      }))
    };

    try {
      if (editingId) {
        await vendorService.editProduct(user.id, editingId, payload);
        addToast('Product details updated!', 'success');
      } else {
        await vendorService.addProduct(user.id, payload);
        addToast('New product added to catalog!', 'success');
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Action failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await vendorService.deleteProduct(user.id, id);
        addToast('Product listing deleted', 'info');
        loadProducts();
      } catch (err) {
        addToast('Deletion failed', 'error');
      }
    }
  };

  if (loading) return <Loader text="Loading catalog listings..." />;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Products</h1>
          <p className={styles.subtitle}>List, edit or remove catalog offerings from your vendor dashboard.</p>
        </div>
        <button onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '10px 20px', borderRadius: 'var(--border-radius-full)', fontWeight: '600' }}>
          <FiPlus /> Add New Product
        </button>
      </div>

      {/* Products list table */}
      {products.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Item Image</th>
                <th>Product Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><img src={p.images[0]} alt="" className={styles.tableImg} /></td>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                    {p.name}
                    {!p.isApproved && <span style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '11px', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '4px', verticalAlign: 'middle' }}>Pending Approval</span>}
                  </td>
                  <td>{p.category}</td>
                  <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>${p.price.toFixed(2)}</td>
                  <td>
                    <span style={{ fontWeight: '600', color: p.stock > 0 ? '#065F46' : '#991B1B' }}>
                      {p.stock > 0 ? `${p.stock} units` : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCol}>
                      <button onClick={() => handleOpenEdit(p)} className={styles.editLink} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiEdit2 /> Edit
                      </button>
                      <button onClick={() => handleDelete(p.id)} className={styles.deleteBtn} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No products listed"
          description="It looks like you haven't added any products to your catalog yet."
          actionText="Create Listing"
          onAction={handleOpenAdd}
        />
      )}

      {/* Modal Popup */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: '700' }}>
                {editingId ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ fontSize: '20px' }}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Product Title *</label>
                <input type="text" value={pName} onChange={(e) => setPName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Product Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {pImage && <img src={pImage} alt="Preview" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }} />}
                  <input type="file" accept="image/*" onChange={uploadFileHandler} disabled={uploadingImage} style={{ flexGrow: 1, padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} />
                </div>
                {uploadingImage && <p style={{ fontSize: '12px', color: 'var(--primary-color)', marginTop: '4px' }}>Uploading image...</p>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Description</label>
                <textarea rows={3} value={pDesc} onChange={(e) => setPDesc(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Category</label>
                  <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                    <option value="Beauty & Cosmetics">Beauty & Cosmetics</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Brand Manufacturer</label>
                  <input type="text" value={pBrand} onChange={(e) => setPBrand(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Price ($) *</label>
                  <input type="number" step="0.01" value={pPrice} onChange={(e) => setPPrice(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Discount (%)</label>
                  <input type="number" value={pDiscount} onChange={(e) => setPDiscount(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Initial Stock *</label>
                  <input type="number" value={pStock} onChange={(e) => setPStock(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
                </div>
              </div>
              
              {/* Product Variants Section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>Product Variants (Optional)</label>
                  <button type="button" onClick={() => setPVariants([...pVariants, { name: '', options: '' }])} style={{ fontSize: '12px', padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-color)', cursor: 'pointer' }}>+ Add Variant</button>
                </div>
                {pVariants.map((v, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>Variant Name (e.g. Size)</label>
                      <input type="text" value={v.name} onChange={(e) => {
                        const newV = [...pVariants];
                        newV[i].name = e.target.value;
                        setPVariants(newV);
                      }} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>Options (comma separated)</label>
                      <input type="text" placeholder="S, M, L, XL" value={v.options} onChange={(e) => {
                        const newV = [...pVariants];
                        newV[i].options = e.target.value;
                        setPVariants(newV);
                      }} style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} />
                    </div>
                    <button type="button" onClick={() => setPVariants(pVariants.filter((_, idx) => idx !== i))} style={{ padding: '8px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 /></button>
                  </div>
                ))}
                {pVariants.length === 0 && <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No variants added. Product will be sold as a single standard item.</p>}
              </div>

              <button type="submit" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '12px', borderRadius: 'var(--border-radius-md)', fontWeight: '600', marginTop: '12px' }}>
                {editingId ? 'Save Changes' : 'Publish Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// 4. INVENTORY STOCK LEVELS
// ----------------------------------------------------
export const VendorInventory = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = async () => {
    try {
      const data = await vendorService.getProducts(user.id);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [user.id]);

  const handleStockAdjust = async (p, amount) => {
    const nextStock = Math.max(0, p.stock + amount);
    try {
      await vendorService.editProduct(user.id, p.id, {
        ...p,
        stock: nextStock
      });
      addToast('Inventory count adjusted!', 'success');
      loadInventory();
    } catch (err) {
      addToast('Adjustment failed', 'error');
    }
  };

  if (loading) return <Loader text="Loading inventory counts..." />;

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Inventory Management</h1>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Quick Adjust</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.name}</td>
                <td>{p.category}</td>
                <td style={{ fontWeight: '700' }}>{p.stock} units</td>
                <td>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: 'var(--border-radius-sm)', backgroundColor: p.stock > 0 ? '#D1FAE5' : '#FEE2E2', color: p.stock > 0 ? '#065F46' : '#991B1B' }}>
                    {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleStockAdjust(p, -1)} style={{ padding: '4px 10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontWeight: 'bold' }}>-1</button>
                    <button onClick={() => handleStockAdjust(p, 5)} style={{ padding: '4px 10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontWeight: 'bold' }}>+5</button>
                    <button onClick={() => handleStockAdjust(p, 10)} style={{ padding: '4px 10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontWeight: 'bold' }}>+10</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 5. VENDOR ORDERS LIST & SHIPPING
// ----------------------------------------------------
export const VendorOrders = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await vendorService.getOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user.id]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await vendorService.updateOrderStatus(user.id, orderId, newStatus);
      addToast(`Order marked as ${newStatus}!`, 'success');
      loadOrders();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  if (loading) return <Loader text="Loading seller orders..." />;

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Customer Orders</h1>
      {orders.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Purchaser</th>
                <th>Items Ordered</th>
                <th>Order Total</th>
                <th>Current Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><strong>#{o.id}</strong></td>
                  <td>{o.customerName}</td>
                  <td>
                    {o.items.map((it, i) => (
                      <div key={i} style={{ fontSize: '13px' }}>{it.product.name} x {it.quantity}</div>
                    ))}
                  </td>
                  <td style={{ fontWeight: '700' }}>${o.vendorTotal.toFixed(2)}</td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: 'var(--border-radius-sm)', backgroundColor: o.status === 'Delivered' ? '#D1FAE5' : '#FEF3C7', color: o.status === 'Delivered' ? '#065F46' : '#92400E' }}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                      style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', fontSize: '13px' }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No Sales Orders"
          description="It looks like clients haven't purchased items from your shop inventory yet."
        />
      )}
    </div>
  );
};

// ----------------------------------------------------
// 6. VENDOR COUPONS MANAGEMENT
// ----------------------------------------------------
export const VendorCoupons = () => {
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [type, setType] = useState('percentage');
  const [expiry, setExpiry] = useState('');

  const loadCoupons = async () => {
    try {
      const data = await vendorService.getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!code.trim() || !discount.trim() || !expiry.trim()) {
      addToast('Please complete coupon inputs', 'warning');
      return;
    }
    try {
      await vendorService.createCoupon({ code, discount, type, expiry });
      addToast('Promo Coupon created successfully!', 'success');
      setCode('');
      setDiscount('');
      loadCoupons();
    } catch (err) {
      addToast('Coupon creation failed', 'error');
    }
  };

  if (loading) return <Loader text="Loading active promos..." />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '32px' }}>
      {/* Creation form */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)', alignSelf: 'start' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', marginBottom: '16px' }}>Create New Promo Code</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Voucher Code</label>
            <input type="text" placeholder="e.g. FLASH25" value={code} onChange={(e) => setCode(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Discount Value</label>
              <input type="number" placeholder="10 or 20" value={discount} onChange={(e) => setDiscount(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
                <option value="percentage">% Percent</option>
                <option value="flat">$ Flat</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Expiry Date</label>
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
          </div>
          <button type="submit" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '12px', borderRadius: 'var(--border-radius-md)', fontWeight: '600' }}>
            Generate Coupon
          </button>
        </form>
      </div>

      {/* Coupons lists */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c, idx) => (
              <tr key={idx}>
                <td><strong>{c.code}</strong></td>
                <td>{c.type === 'percentage' ? `${c.discount}% Off` : `$${c.discount} Off`}</td>
                <td>{c.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 7. WALLET WALLET BALANCE & WITHDRAWALS
// ----------------------------------------------------
export const VendorWallet = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [loading, setLoading] = useState(true);

  const loadWallet = async () => {
    try {
      const stats = await vendorService.getDashboardStats(user.id);
      setBalance(stats.walletBalance);
      const list = await vendorService.getWithdrawals(user.id);
      setWithdrawals(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, [user.id]);

  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();
    if (!withdrawAmt || parseFloat(withdrawAmt) <= 0) {
      addToast('Please input a valid positive amount', 'warning');
      return;
    }

    try {
      await vendorService.requestWithdrawal(user.id, withdrawAmt);
      addToast('Withdrawal request submitted for approval!', 'success');
      setWithdrawAmt('');
      loadWallet();
    } catch (err) {
      addToast(err.message || 'Withdrawal failed', 'error');
    }
  };

  if (loading) return <Loader text="Checking wallet audit..." />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '32px' }}>
      {/* Request and details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Available Store Balance</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '36px', fontWeight: '800', color: 'var(--primary-color)', margin: '8px 0' }}>
            ${balance.toFixed(2)}
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Deductions for order cancellations can apply.</p>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Request Balance Withdrawal</h3>
          <form onSubmit={handleWithdrawalRequest} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="number"
              placeholder="$ Amount"
              value={withdrawAmt}
              onChange={(e) => setWithdrawAmt(e.target.value)}
              style={{ flexGrow: 1, padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}
              required
            />
            <button type="submit" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '10px 20px', borderRadius: 'var(--border-radius-md)', fontWeight: '600' }}>
              Request
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', marginBottom: '16px' }}>Withdrawal Request History</h3>
        {withdrawals.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {withdrawals.map((w) => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontWeight: '600' }}>${w.amount.toFixed(2)}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Requested: {w.date}</p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 8px', borderRadius: 'var(--border-radius-sm)', backgroundColor: w.status === 'Approved' ? '#D1FAE5' : '#FEF3C7', color: w.status === 'Approved' ? '#065F46' : '#92400E' }}>
                    {w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-secondary)' }}>No withdrawals requested yet.</p>
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 8. STORE REVIEWS FEEDBACK LIST
// ----------------------------------------------------
export const VendorReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const prods = await vendorService.getProducts(user.id);
        const compiled = [];
        prods.forEach(p => {
          if (p.reviews) {
            p.reviews.forEach(r => compiled.push({ ...r, productTitle: p.name }));
          }
        });
        setReviews(compiled);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [user.id]);

  if (loading) return <Loader text="Loading store comments..." />;

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Customer Feedback Reviews</h1>
      {reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map(r => (
            <div key={r.id} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Product: <strong>{r.productTitle}</strong></p>
              <div style={{ display: 'flex', gap: '4px', color: 'var(--accent-color)' }}>
                {[...Array(r.rating)].map((_, i) => <FaStar key={i} />)}
              </div>
              <p style={{ fontSize: '14px', fontStyle: 'italic' }}>"{r.comment}"</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', alignSelf: 'flex-end' }}>{r.date} by {r.user}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No reviews left"
          description="Customers haven't submitted ratings or review comments on your items yet."
        />
      )}
    </div>
  );
};
export default VendorDashboard;
