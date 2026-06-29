import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiGrid, FiBriefcase, FiUsers, FiShoppingBag, FiFolder, FiList,
  FiDollarSign, FiInbox, FiSliders, FiCheck, FiX, FiTrendingUp, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/admin';
import { productService } from '../../services/product';
import { orderService } from '../../services/order';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './AdminPortal.module.css';

// ----------------------------------------------------
// 1. ADMIN DASHBOARD OVERVIEW
// ----------------------------------------------------
export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader text="Loading administration data..." />;

  const maxVal = Math.max(...stats.monthlyAnalytics.map(m => m.sales), 100);

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Super Admin Dashboard</h1>
          <p className={styles.subtitle}>Oversee platform activities, verify sellers, and audit fee commissions.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#EFF6FF', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--border-radius-md)', fontSize: '20px' }}><FiBriefcase /></div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalVendors}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Vendors</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--border-radius-md)', fontSize: '20px' }}><FiShoppingBag /></div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalProducts}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Products Listed</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#D1FAE5', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--border-radius-md)', fontSize: '20px' }}><FiTrendingUp /></div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>${stats.totalSales.toFixed(2)}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Platform Volume</p>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--border-radius-md)', fontSize: '20px' }}><FiDollarSign /></div>
          <div>
            <p style={{ fontSize: '24px', fontWeight: '700' }}>${stats.commissionEarned.toFixed(2)}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Commission Earned</p>
          </div>
        </div>
      </div>

      {/* Monthly Sales Volume */}
      <div className={styles.chartContainer}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>Platform Monthly GMV ($)</h3>
        <div className={styles.chart}>
          {stats.monthlyAnalytics.map((m, i) => {
            const pct = (m.sales / maxVal) * 100;
            return (
              <div key={i} className={styles.chartBarWrapper}>
                <div className={styles.chartBar} style={{ height: `${pct}%` }}>
                  <div className={styles.chartTooltip}>Sales: ${m.sales} (Rev: ${m.revenue.toFixed(0)})</div>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 2. PLATFORM ANALYTICS REPORT
// ----------------------------------------------------
export const AdminAnalytics = () => {
  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '16px' }}>Platform Analytics Report</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
        NovaCart tracks platform conversion ratios, active vendor distribution, commission rates, and refund ratios. Currently all metrics show high organic customer retention.
      </p>
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '32px', textAlign: 'center' }}>
        <FiAlertCircle style={{ fontSize: '48px', color: 'var(--primary-color)', marginBottom: '12px' }} />
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px' }}>Platform is Healthy</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Audits are synchronized with the primary ledger.</p>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. MANAGE VENDORS (APPROVAL QUEUES)
// ----------------------------------------------------
export const AdminVendors = () => {
  const { addToast } = useToast();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVendors = async () => {
    try {
      const data = await adminService.getVendors();
      setVendors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await adminService.updateVendorStatus(id, status);
      addToast(`Vendor application marked as ${status}!`, 'success');
      loadVendors();
    } catch (err) {
      addToast('Status update failed', 'error');
    }
  };

  if (loading) return <Loader text="Retrieving seller applications..." />;

  const pending = vendors.filter(v => v.status === 'Pending Approval');
  const active = vendors.filter(v => v.status === 'Approved');

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Manage Store Vendors</h1>

      {/* Pending Approval Section */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>Pending Registrations ({pending.length})</h3>
        {pending.length > 0 ? (
          <div className={styles.grid}>
            {pending.map(v => (
              <div key={v.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <strong style={{ fontSize: '16px' }}>{v.name}</strong>
                  <span className={`${styles.badge}`} style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>Pending</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Email: {v.email}<br />
                  Registration: {v.joined}
                </p>
                <div className={styles.btnGroup}>
                  <button onClick={() => handleStatusUpdate(v.id, 'Approved')} className={styles.approveBtn}>Approve Seller</button>
                  <button onClick={() => handleStatusUpdate(v.id, 'Rejected')} className={styles.rejectBtn}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-secondary)' }}>No pending vendor applications at the moment.</p>
        )}
      </section>

      {/* Active Approved Vendors */}
      <section>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', marginBottom: '16px', color: 'var(--text-primary)' }}>Approved Seller Accounts ({active.length})</h3>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px', fontSize: '13px' }}>Store Name</th>
                <th style={{ padding: '16px', fontSize: '13px' }}>Email</th>
                <th style={{ padding: '16px', fontSize: '13px' }}>Commission Rate</th>
                <th style={{ padding: '16px', fontSize: '13px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {active.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontWeight: '600' }}>{v.name}</td>
                  <td style={{ padding: '16px' }}>{v.email}</td>
                  <td style={{ padding: '16px' }}>{v.commissionRate || 10}%</td>
                  <td style={{ padding: '16px' }}>
                    <button onClick={() => handleStatusUpdate(v.id, 'Suspended')} style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600' }}>Suspend Store</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

// ----------------------------------------------------
// 4. MANAGE CUSTOMERS
// ----------------------------------------------------
export const AdminCustomers = () => {
  const [customers] = useState([
    { id: 'cust-1', name: 'John Doe', email: 'customer@gmail.com', joined: '2026-02-10', ordersCount: 12 },
    { id: 'cust-2', name: 'Sarah Connor', email: 'sarah@gmail.com', joined: '2026-04-15', ordersCount: 5 }
  ]);

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Registered Customers</h1>
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '16px' }}>Customer Name</th>
              <th style={{ padding: '16px' }}>Email</th>
              <th style={{ padding: '16px' }}>Joined Date</th>
              <th style={{ padding: '16px' }}>Total Purchases</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px', fontWeight: '600' }}>{c.name}</td>
                <td style={{ padding: '16px' }}>{c.email}</td>
                <td style={{ padding: '16px' }}>{c.joined}</td>
                <td style={{ padding: '16px', fontWeight: '600' }}>{c.ordersCount} orders</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 5. MANAGE PRODUCTS (MODERATION ACTION)
// ----------------------------------------------------
export const AdminProducts = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAllProducts = async () => {
    try {
      const data = await adminService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllProducts();
  }, []);

  const handleStatusUpdate = async (id, isApproved) => {
    try {
      await adminService.updateProductStatus(id, isApproved);
      addToast(isApproved ? 'Product approved and visible on site!' : 'Product rejected and hidden.', 'success');
      loadAllProducts();
    } catch (err) {
      addToast('Status update failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this listing from the catalog?')) {
      try {
        await adminService.deleteProduct(id);
        addToast('Listing deleted successfully', 'success');
        loadAllProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <Loader text="Loading catalog collections..." />;

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Platform Products Moderation</h1>
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '16px' }}>Item Title</th>
              <th style={{ padding: '16px' }}>Category</th>
              <th style={{ padding: '16px' }}>Seller Store</th>
              <th style={{ padding: '16px' }}>Price</th>
              <th style={{ padding: '16px' }}>Moderation</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px', fontWeight: '600' }}>
                  {p.name}
                  {!p.isApproved && <span style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '11px', backgroundColor: '#FEF3C7', color: '#92400E', borderRadius: '4px' }}>Pending Approval</span>}
                </td>
                <td style={{ padding: '16px' }}>{p.category}</td>
                <td style={{ padding: '16px' }}>{p.vendorName}</td>
                <td style={{ padding: '16px', fontWeight: '700', color: 'var(--primary-color)' }}>${p.price.toFixed(2)}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!p.isApproved ? (
                      <button onClick={() => handleStatusUpdate(p.id, true)} style={{ backgroundColor: '#10B981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Approve</button>
                    ) : (
                      <button onClick={() => handleStatusUpdate(p.id, false)} style={{ backgroundColor: '#F59E0B', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Revoke</button>
                    )}
                    <button onClick={() => handleDelete(p.id)} style={{ color: '#EF4444', fontSize: '13px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
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
// 6. MANAGE CATALOG (CATEGORIES & BRANDS CRUD)
// ----------------------------------------------------
export const AdminCatalog = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [catName, setCatName] = useState('');
  const [brandName, setBrandName] = useState('');

  const loadCatalog = async () => {
    const cats = await productService.getCategories();
    setCategories(cats);
    const brs = await productService.getBrands();
    setBrands(brs);
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      await adminService.addCategory(catName);
      addToast('Category published!', 'success');
      setCatName('');
      loadCatalog();
    } catch (err) {
      addToast('Category addition failed', 'error');
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    try {
      await adminService.addBrand(brandName);
      addToast('Brand published!', 'success');
      setBrandName('');
      loadCatalog();
    } catch (err) {
      addToast('Brand addition failed', 'error');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
      {/* Categories */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', marginBottom: '16px' }}>Add Catalog Category</h3>
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <input type="text" placeholder="Category Name" value={catName} onChange={(e) => setCatName(e.target.value)} style={{ flexGrow: 1, padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
          <button type="submit" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '10px 20px', borderRadius: 'var(--border-radius-md)', fontWeight: '600' }}>Add</button>
        </form>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map(c => <span key={c.id} style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--border-radius-full)', fontSize: '13px' }}>{c.name}</span>)}
        </div>
      </div>

      {/* Brands */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', marginBottom: '16px' }}>Add Store Brand</h3>
        <form onSubmit={handleAddBrand} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <input type="text" placeholder="Brand Manufacturer Name" value={brandName} onChange={(e) => setBrandName(e.target.value)} style={{ flexGrow: 1, padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
          <button type="submit" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '10px 20px', borderRadius: 'var(--border-radius-md)', fontWeight: '600' }}>Add</button>
        </form>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {brands.map(b => <span key={b.id} style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--border-radius-full)', fontSize: '13px' }}>{b.name}</span>)}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 7. MANAGE ORDERS
// ----------------------------------------------------
export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loader text="Loading platform transactions..." />;

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Platform Order Book</h1>
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
            <tr>
              <th style={{ padding: '16px' }}>Order ID</th>
              <th style={{ padding: '16px' }}>Purchaser</th>
              <th style={{ padding: '16px' }}>Total Amount</th>
              <th style={{ padding: '16px' }}>Payment</th>
              <th style={{ padding: '16px' }}>Tracking Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px' }}><strong>#{o.id}</strong></td>
                <td style={{ padding: '16px' }}>{o.customerName}</td>
                <td style={{ padding: '16px', fontWeight: '700' }}>${o.total.toFixed(2)}</td>
                <td style={{ padding: '16px' }}>{o.paymentMethod}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: 'var(--border-radius-sm)', backgroundColor: o.status === 'Delivered' ? '#D1FAE5' : '#FEF3C7', color: o.status === 'Delivered' ? '#065F46' : '#92400E' }}>{o.status}</span>
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
// 8. WITHDRAWAL QUEUES
// ----------------------------------------------------
export const AdminWithdrawals = () => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const data = await adminService.getWithdrawalRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await adminService.updateWithdrawalStatus(id, status);
      addToast(`Withdrawal marked as ${status}!`, 'success');
      loadRequests();
    } catch (err) {
      addToast('Update failed', 'error');
    }
  };

  if (loading) return <Loader text="Checking request ledger..." />;

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Seller Withdraw Queue</h1>
      {requests.length > 0 ? (
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '16px' }}>Vendor Store</th>
                <th style={{ padding: '16px' }}>Requested Amount</th>
                <th style={{ padding: '16px' }}>Date</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontWeight: '600' }}>{w.vendorName}</td>
                  <td style={{ padding: '16px', fontWeight: '700', color: 'var(--primary-color)' }}>${w.amount.toFixed(2)}</td>
                  <td style={{ padding: '16px' }}>{w.date}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: 'var(--border-radius-sm)', backgroundColor: w.status === 'Approved' ? '#D1FAE5' : '#FEF3C7', color: w.status === 'Approved' ? '#065F46' : '#92400E' }}>{w.status}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {w.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleStatus(w.id, 'Approved')} style={{ backgroundColor: '#10B981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Approve</button>
                        <button onClick={() => handleStatus(w.id, 'Rejected')} style={{ backgroundColor: '#EF4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Queue Empty" description="There are no seller withdrawals requests submitted." />
      )}
    </div>
  );
};

// ----------------------------------------------------
// 9. SUPPORT TICKETS LIST
// ----------------------------------------------------
export const AdminTickets = () => {
  const { addToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    try {
      const data = await adminService.getSupportTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCloseTicket = async (id) => {
    try {
      await adminService.updateTicketStatus(id, 'Closed');
      addToast('Support ticket resolved & closed!', 'success');
      loadTickets();
    } catch (err) {
      addToast('Update failed', 'error');
    }
  };

  if (loading) return <Loader text="Loading support logs..." />;

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Client Support Tickets</h1>
      {tickets.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {tickets.map(t => (
            <div key={t.id} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <strong style={{ fontSize: '16px' }}>{t.subject}</strong>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: 'var(--border-radius-sm)', backgroundColor: t.priority === 'High' ? '#FEE2E2' : '#EFF6FF', color: t.priority === 'High' ? '#991B1B' : '#1E40AF' }}>{t.priority} Priority</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: 'var(--border-radius-sm)', backgroundColor: t.status === 'Open' ? '#FEF3C7' : '#D1FAE5', color: t.status === 'Open' ? '#92400E' : '#065F46' }}>{t.status}</span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '10px' }}>"{t.message}"</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>Submitted by {t.customerName} on {t.date}</p>
              </div>
              {t.status === 'Open' && (
                <button onClick={() => handleCloseTicket(t.id)} style={{ backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '8px 16px', borderRadius: 'var(--border-radius-md)', fontSize: '13px', fontWeight: '600' }}>Mark Resolved</button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Inbox Clean" description="There are no open customer support tickets." />
      )}
    </div>
  );
};

// ----------------------------------------------------
// 10. PLATFORM COMMISSION SETTINGS
// ----------------------------------------------------
export const AdminSettings = () => {
  const { addToast } = useToast();
  const [commRate, setCommRate] = useState(10);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    addToast('Default platform commission rates adjusted!', 'success');
    setSaving(false);
  };

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Platform Commission Settings</h1>
      <div style={{ maxWidth: '500px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Global Transaction Commission Fee (%)</label>
            <input type="number" value={commRate} onChange={(e) => setCommRate(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
          </div>
          <button type="submit" disabled={saving} style={{ backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '10px 20px', borderRadius: 'var(--border-radius-md)', fontWeight: '600', alignSelf: 'start' }}>
            {saving ? 'Saving...' : 'Apply Default Rates'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminDashboard;
