import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiGrid, FiUser, FiMapPin, FiHeart, FiShoppingBag, FiList, FiStar,
  FiSettings, FiPlus, FiTrash2, FiMap, FiCreditCard, FiCheckCircle, FiDollarSign,
  FiCamera, FiLock, FiEdit3, FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/order';
import { productService } from '../../services/product';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import { api } from '../../services/api';
import styles from './CustomerPortal.module.css';
import { motion } from 'framer-motion';

// ----------------------------------------------------
// 1. CUSTOMER DASHBOARD OVERVIEW
// ----------------------------------------------------
export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();
  const { cartItems } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders(user.id);
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user.id]);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingId.trim()) {
      navigate(`/customer/order-details/${trackingId.trim()}`);
    }
  };

  if (loading) return <Loader text="Loading customer overview..." />;

  const totalSpent = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Hello, {user.name}</h1>
          <p className={styles.subtitle}>Welcome to your customer dashboard. View purchase histories and track open orders.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}><FiList /></div>
          <div>
            <p className={styles.metricVal}>{orders.length}</p>
            <p className={styles.metricLabel}>Total Orders Placed</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ color: '#10B981', backgroundColor: '#D1FAE5' }}><FiDollarSign /></div>
          <div>
            <p className={styles.metricVal}>${totalSpent.toFixed(2)}</p>
            <p className={styles.metricLabel}>Total Spent (Delivered)</p>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ color: '#EF4444', backgroundColor: '#FEE2E2' }}><FiHeart /></div>
          <div>
            <p className={styles.metricVal}>{wishlistItems.length}</p>
            <p className={styles.metricLabel}>Saved in Wishlist</p>
          </div>
        </div>
      </div>

      {/* Grid: Track Order & Recent Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px' }}>
        {/* Track Order Input */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', marginBottom: '12px' }}>Track Order Status</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Input your order ID below (e.g. ord-1001) to verify current shipping timelines.</p>
          <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g. ord-1001"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              style={{ flexGrow: 1, padding: '12px 16px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)', fontSize: '14px' }}
              required
            />
            <button type="submit" className={styles.metricIcon} style={{ width: 'auto', padding: '0 20px', borderRadius: 'var(--border-radius-md)', backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', fontSize: '14px', fontWeight: '600' }}>
              Track Info
            </button>
          </form>
        </div>

        {/* Recent Orders List */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '24px' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', marginBottom: '16px' }}>Recent Order List</h3>
          {orders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.slice(0, 3).map(order => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}><Link to={`/customer/order-details/${order.id}`} style={{ color: 'var(--primary-color)' }}>#{order.id}</Link></p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{order.date}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 8px', borderRadius: 'var(--border-radius-sm)', backgroundColor: order.status === 'Delivered' ? '#D1FAE5' : '#FEF3C7', color: order.status === 'Delivered' ? '#065F46' : '#92400E' }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-secondary)' }}>No orders placed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 2. MY PROFILE
// ----------------------------------------------------
export const CustomerProfile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '123-456-7890');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [password, setPassword] = useState('');
  
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name field cannot be left blank', 'warning');
      return;
    }
    setUpdating(true);
    try {
      const payload = { name, email, phone, avatar };
      if (password) {
        if (password.length < 6) {
          addToast('Password must be at least 6 characters', 'warning');
          setUpdating(false);
          return;
        }
        payload.password = password;
      }
      await updateProfile(payload);
      setPassword(''); // Clear password field after success
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarClick = () => {
    document.getElementById('avatar-upload').click();
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUpdating(true);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatar(`http://localhost:5000${data}`);
      addToast('Image uploaded successfully! Click Save All Changes to apply.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Image upload failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Account Settings</h1>
          <p className={styles.subtitle}>Manage your personal information and security preferences.</p>
        </div>
      </div>

      <div className={styles.profileGrid}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper} onClick={handleAvatarClick} title="Click to change photo">
            <img src={avatar || 'https://via.placeholder.com/150'} alt="Profile" className={styles.profileAvatar} />
            <div className={styles.avatarOverlay}>
              <FiCamera size={24} />
            </div>
          </div>
          <input 
            type="file" 
            id="avatar-upload" 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={uploadFileHandler}
          />
          <h3 style={{ marginTop: '16px', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>{name}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>{email}</p>
          <span className={styles.roleBadge}>Customer</span>
        </div>

        <div className={styles.formSection}>
          <form onSubmit={handleUpdate} className={styles.profileForm}>
            
            <div className={styles.formGroupHeader}>
              <FiUser className={styles.formGroupIcon} />
              <h4>Personal Details</h4>
            </div>

            <div className={styles.inputGrid}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Phone Number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className={styles.inputGroup} style={{ marginBottom: '32px' }}>
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className={styles.formGroupHeader}>
              <FiLock className={styles.formGroupIcon} />
              <h4>Security</h4>
            </div>

            <div className={styles.inputGroup}>
              <label>New Password (leave blank to keep current)</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" disabled={updating} className={styles.primaryBtn}>
                {updating ? 'Saving Changes...' : 'Save All Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 3. ADDRESS MANAGEMENT
// ----------------------------------------------------
export const CustomerAddresses = () => {
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState([
    { id: 'addr-1', type: 'Shipping', street: '123 Main St, Apt 4B', city: 'New York', state: 'NY', zip: '10001', country: 'United States' },
    { id: 'addr-2', type: 'Billing', street: '456 Wall St', city: 'New York', state: 'NY', zip: '10005', country: 'United States' }
  ]);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZip, setNewZip] = useState('');
  const [newType, setNewType] = useState('Shipping');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newStreet.trim() || !newCity.trim() || !newZip.trim()) {
      addToast('Please fill out all address details', 'warning');
      return;
    }
    const newAddr = {
      id: Math.random().toString(36).substring(2, 9),
      type: newType,
      street: newStreet,
      city: newCity,
      state: newState,
      zip: newZip,
      country: 'United States'
    };
    setAddresses([...addresses, newAddr]);
    addToast('New address saved successfully!', 'success');
    setNewStreet('');
    setNewCity('');
    setNewState('');
    setNewZip('');
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
    addToast('Address removed', 'info');
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Address Management</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '10px 18px', borderRadius: 'var(--border-radius-full)', fontWeight: '600' }}>
          <FiPlus /> {showAddForm ? 'Cancel' : 'Add New Address'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', maxWidth: '600px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Address Type</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
                <option value="Shipping">Shipping</option>
                <option value="Billing">Billing</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Street Address *</label>
              <input type="text" value={newStreet} onChange={(e) => setNewStreet(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>City *</label>
              <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>State</label>
              <input type="text" value={newState} onChange={(e) => setNewState(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Zip Code *</label>
              <input type="text" value={newZip} onChange={(e) => setNewZip(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
            </div>
          </div>
          <button type="submit" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '10px 20px', borderRadius: 'var(--border-radius-md)', fontWeight: '600', alignSelf: 'start' }}>
            Save Address
          </button>
        </form>
      )}

      <div className={styles.addressGrid}>
        {addresses.map(addr => (
          <div key={addr.id} className={styles.addressCard}>
            <span className={styles.addressType}>{addr.type}</span>
            <p className={styles.addressText}>
              <strong>{addr.street}</strong><br />
              {addr.city}, {addr.state} {addr.zip}<br />
              {addr.country}
            </p>
            <div className={styles.addressActions}>
              <button onClick={() => handleDelete(addr.id)} className={styles.deleteBtn} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiTrash2 /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 4. MY WISHLIST
// ----------------------------------------------------
export const CustomerWishlist = () => {
  const { wishlistItems, clearWishlist, toggleWishlist } = useWishlist();

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>My Wishlist ({wishlistItems.length})</h1>
        {wishlistItems.length > 0 && (
          <button onClick={clearWishlist} style={{ color: '#EF4444', fontWeight: '600', fontSize: '14px' }}>
            Clear Wishlist
          </button>
        )}
      </div>

      {wishlistItems.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {wishlistItems.map((prod) => (
            <div key={prod.id || prod._id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ProductCard product={prod} />
              <button
                onClick={() => toggleWishlist(prod)}
                style={{
                  width: '100%',
                  backgroundColor: '#FEF2F2',
                  color: '#EF4444',
                  border: '1px solid #FCA5A5',
                  padding: '10px',
                  borderRadius: 'var(--border-radius-md)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s, transform 0.1s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FECACA'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <FiTrash2 /> Remove Item
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Wishlist is Empty"
          description="You haven't saved any items to your wishlist yet. Go browse catalog to find your favorite goods!"
        />
      )}
    </div>
  );
};

// ----------------------------------------------------
// 5. SHOPPING CART
// ----------------------------------------------------
export const CustomerCart = () => {
  const { cartItems, removeFromCart, updateQuantity, applyCoupon, coupon, removeCoupon, subtotal, discountAmount, shipping, total } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      applyCoupon(couponCode.trim());
      setCouponCode('');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 className={styles.title} style={{ marginBottom: '24px' }}>Shopping Cart</h1>
        <EmptyState
          title="Your Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore our latest discounts and shop now."
          actionText="Start Shopping"
          onAction={() => navigate('/shop')}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Shopping Cart</h1>
      <div className={styles.cartLayout}>
        {/* Cart items list */}
        <div className={styles.cartList}>
          {cartItems.map((item) => {
            const p = item.product;
            const price = p.price * (1 - (p.discount || 0) / 100);
            const pId = p.id || p._id; // Fallback for old carts
            return (
              <div key={pId} className={styles.cartItem}>
                <img src={p.images[0]} alt={p.name} className={styles.cartImg} />
                <div className={styles.cartInfo}>
                  <h4 className={styles.cartTitle}><Link to={`/product/${pId}`}>{p.name}</Link></h4>
                  <p className={styles.cartPrice}>${price.toFixed(2)}</p>
                </div>
                <div className={styles.cartActions}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => updateQuantity(pId, item.quantity - 1)} style={{ width: '32px', height: '32px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
                    <span style={{ fontWeight: '600', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(pId, item.quantity + 1)} style={{ width: '32px', height: '32px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(pId)} className={styles.cartRemove} title="Remove Item">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals and coupon */}
        <div className={styles.summaryCard}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '700' }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {coupon && (
              <div className={styles.summaryRow} style={{ color: '#10B981', fontWeight: '600' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Coupon ({coupon.code}) <button onClick={removeCoupon} style={{ color: '#EF4444', fontSize: '11px' }}>[Remove]</button>
                </span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>Shipping Fee</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total Price</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Coupon Input Form */}
          <form onSubmit={handleCouponSubmit} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input
              type="text"
              placeholder="e.g. SAVE10, WELCOME20"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              style={{ flexGrow: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', fontSize: '13px' }}
            />
            <button type="submit" style={{ backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '8px 16px', borderRadius: 'var(--border-radius-md)', fontSize: '13px', fontWeight: '600' }}>
              Apply
            </button>
          </form>

          <button onClick={() => navigate('/checkout')} className={styles.primaryBtn} style={{ width: '100%', marginTop: '8px' }}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 6. CHECKOUT FORM
// ----------------------------------------------------
export const CustomerCheckout = () => {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, subtotal, discountAmount, shipping, total } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');

  // Guard: redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=checkout', { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Guard: if cart is empty, send back to cart page
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems.length, navigate]);

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!name || !street || !city || !zip) {
      addToast('Please input all shipping information', 'warning');
      return;
    }

    // Save shipping details locally to read during payment step
    localStorage.setItem('checkout_shipping', JSON.stringify({ name, street, city, zip, phone }));
    navigate('/payment');
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', alignItems: 'center' }}>
        <Link to="/cart" style={{ color: 'var(--text-secondary)' }}>Cart</Link>
        <FiChevronRight size={12} />
        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Checkout</span>
        <FiChevronRight size={12} />
        <span>Payment</span>
      </div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Shipping Checkout</h1>
      <div className={styles.cartLayout}>
        {/* Shipping Form */}
        <form onSubmit={handleCheckoutSubmit} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--border-radius-lg)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '600' }}>Delivery Information</h3>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Recipient Full Name *</label>
            <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Delivery Street Address *</label>
            <input type="text" placeholder="123 Main St" value={street} onChange={(e) => setStreet(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>City *</label>
              <input type="text" placeholder="New York" value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Zip Code *</label>
              <input type="text" placeholder="10001" value={zip} onChange={(e) => setZip(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Contact Phone Number</label>
            <input type="text" placeholder="1234567890" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} />
          </div>
          <button type="submit" className={styles.primaryBtn} style={{ width: '100%' }}>
            Proceed to Payment Details
          </button>
        </form>

        {/* Pricing Summary */}
        <div className={styles.summaryCard}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '700' }}>Line Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cartItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                  {item.product.name} x {item.quantity}
                </span>
                <span>${(item.product.price * (1 - (item.product.discount || 0) / 100) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className={styles.summaryRow} style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className={styles.summaryRow} style={{ color: '#10B981' }}>
                <span>Discount</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>Shipping Fee</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total Price</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 7. PAYMENT GATEWAY SPLASH
// ----------------------------------------------------
export const CustomerPayment = () => {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, total, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  // Guard: redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=payment', { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Guard: if cart is empty (e.g. page refresh after order), send back to cart
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems.length, navigate]);

  // Wait for auth to resolve before rendering
  if (authLoading || !user) return <Loader text="Verifying session..." />;

  const handlePayment = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'Credit Card') {
      if (cardNumber.length < 16 || cardCvv.length < 3) {
        addToast('Invalid credit card format parameters', 'warning');
        return;
      }
    }

    setProcessing(true);
    try {
      const shippingAddress = JSON.parse(localStorage.getItem('checkout_shipping') || '{}');
      
      const orderData = {
        customerId: user.id,
        customerName: user.name,
        total,
        paymentMethod,
        shippingAddress,
        items: cartItems
      };

      if (paymentMethod === 'Razorpay') {
        // 1. Request a Razorpay order from the backend
        const res = await api.post('/payment/razorpay-order', { amount: total });
        const rzOrder = res.data;

        // 2. Configure Razorpay Options
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: rzOrder.amount,
          currency: rzOrder.currency,
          name: 'NovaCart Multi-Vendor',
          description: 'Order Payment',
          order_id: rzOrder.id,
          handler: async (response) => {
            setProcessing(true);
            try {
              // 3. Verify signature on backend
              await api.post('/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              // 4. Place the order in our database
              const placed = await orderService.placeOrder(orderData);
              localStorage.setItem('last_order_placed', JSON.stringify(placed));
              clearCart();
              addToast('Payment completed successfully via Razorpay!', 'success');
              navigate('/order-success');
            } catch (verifyErr) {
              addToast(verifyErr.message || 'Payment verification failed', 'error');
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#2563EB'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Cash on Delivery or Credit Card Mock
        const placed = await orderService.placeOrder(orderData);
        localStorage.setItem('last_order_placed', JSON.stringify(placed));
        clearCart();
        addToast(paymentMethod === 'Cash on Delivery' ? 'Order placed successfully!' : 'Payment authorization successful!', 'success');
        navigate('/order-success');
      }
    } catch (err) {
      addToast(err.message || 'Payment gateway authorization error', 'error');
    } finally {
      if (paymentMethod !== 'Razorpay') {
        setProcessing(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '60vh', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '500px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', alignItems: 'center' }}>
          <Link to="/cart" style={{ color: 'var(--text-secondary)' }}>Cart</Link>
          <FiChevronRight size={12} />
          <Link to="/checkout" style={{ color: 'var(--text-secondary)' }}>Checkout</Link>
          <FiChevronRight size={12} />
          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Payment</span>
        </div>
      </div>
      
      <div style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', padding: '36px', boxShadow: 'var(--shadow-lg)' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>Complete Payment Gateway</h2>
        
        <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Select Payment Tier</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
              {['Credit Card', 'Cash on Delivery', 'Razorpay'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--border-radius-md)',
                    border: paymentMethod === method ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    backgroundColor: paymentMethod === method ? '#EFF6FF' : 'var(--card-bg)',
                    color: paymentMethod === method ? 'var(--primary-color)' : 'var(--text-secondary)',
                    fontWeight: '600',
                    fontSize: '13px'
                  }}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'Credit Card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Card Number</label>
                <input type="text" placeholder="4111 2222 3333 4444" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} maxLength={19} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Expiry (MM/YY)</label>
                  <input type="text" placeholder="12/28" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>CVV</label>
                  <input type="text" placeholder="123" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} maxLength={4} required />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'Cash on Delivery' && (
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', fontStyle: 'italic' }}>
              Cash on Delivery checkout selection requires manual validation payment upon delivery package drops. No upfront card billing required.
            </p>
          )}

          {paymentMethod === 'Razorpay' && (
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', fontStyle: 'italic' }}>
              You will be redirected to the secure Razorpay payment gateway to complete your transaction. You can pay using UPI, credit/debit cards, net banking, or wallets.
            </p>
          )}

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>E-Wallet Billing Amount:</span>
            <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>${total.toFixed(2)}</span>
          </div>

          <button type="submit" disabled={processing} style={{ width: '100%', backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '14px', borderRadius: 'var(--border-radius-md)', fontWeight: '600', cursor: 'pointer' }}>
            {processing ? 'Authorizing Transactions...' : paymentMethod === 'Razorpay' ? 'Proceed with Razorpay' : `Pay $${total.toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 8. ORDER SUCCESS SPLASH
// ----------------------------------------------------
export const CustomerOrderSuccess = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('last_order_placed');
    if (saved) {
      setOrder(JSON.parse(saved));
    }
    setLoaded(true);
  }, []);

  if (!loaded) return <Loader text="Loading order details..." />;
  if (loaded && !order) {
    navigate('/', { replace: true });
    return null;
  }

  const firstItem = order.items && order.items[0] ? order.items[0] : null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#F9FAFB', padding: '40px 16px', minHeight: '80vh' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '32px', padding: '32px 24px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Illustration */}
        <div style={{ alignSelf: 'center', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '24px' }}>
          🛵
        </div>
        
        {/* Headings */}
        <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0', fontFamily: 'Outfit, sans-serif' }}>
          Order Status
        </h2>
        <p style={{ textAlign: 'center', fontSize: '15px', color: '#6B7280', margin: '0 0 32px 0' }}>
          Your package is on the way
        </p>
        
        {/* Item Card */}
        {firstItem && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: '#F3F4F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <img src={firstItem.product.images[0]} alt={firstItem.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 2px' }}>{firstItem.product.category || 'Product'}</p>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{firstItem.product.name}</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Qty : {firstItem.quantity}</p>
            </div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>
              ${order.total.toFixed(2)}
            </div>
          </div>
        )}
        
        {/* Order Summary Card */}
        <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '16px', padding: '20px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0' }}>Order Summary</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Order ID</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#111827' }}>{order._id || order.id || '153468790876'}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Shipping Address</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#111827', textAlign: 'right', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {order.shippingAddress?.street ? `${order.shippingAddress.street}, ${order.shippingAddress.city}` : '45 onye\'s house'}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #F3F4F6', paddingBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Tracking ID</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#111827' }}>{order._id || order.id || '153468790876'}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Estimated Delivery Date</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#111827' }}>
              {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' })}; 04:54pm
            </span>
          </div>
        </div>
        
        {/* Track Order Button */}
        <button 
          onClick={() => navigate(`/customer/order-details/${order._id || order.id || ''}`)}
          style={{ width: '100%', backgroundColor: '#111827', color: '#FFFFFF', padding: '16px', borderRadius: '100px', fontWeight: '600', fontSize: '15px', border: 'none', cursor: 'pointer', marginBottom: '16px', transition: 'background-color 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#111827'}
        >
          Track order
        </button>
        
        {/* Confirmed Text */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#10B981', margin: 0, fontWeight: '500' }}>
          Your order is confirmed and in transit
        </p>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 9. MY ORDERS
// ----------------------------------------------------
export const CustomerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await orderService.getOrders(user.id);
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user.id]);

  if (loading) return <Loader text="Loading orders list..." />;

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>My Orders</h1>
      {orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => (
            <div key={order.id} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Order ID: <strong>#{order.id}</strong></p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Placed Date: {order.date}</p>
                <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary-color)', marginTop: '6px' }}>Total Price: ${order.total.toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: 'var(--border-radius-sm)', backgroundColor: order.status === 'Delivered' ? '#D1FAE5' : '#FEF3C7', color: order.status === 'Delivered' ? '#065F46' : '#92400E', textTransform: 'uppercase' }}>
                  {order.status}
                </span>
                <Link to={`/customer/order-details/${order.id}`} style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: 'var(--border-radius-md)', fontSize: '13px', fontWeight: '600' }}>
                  Manage Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Orders Found"
          description="It looks like you haven't bought anything on this account yet."
        />
      )}
    </div>
  );
};

// ----------------------------------------------------
// 10. ORDER DETAILS & TIMELINE
// ----------------------------------------------------
export const CustomerOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError('Order details could not be found. Please check tracking ID.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <Loader text="Retrieving order timeline logs..." />;
  if (error || !order) return <ErrorState title="Order Query Failed" description={error} />;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Order Summary #{order.id}</h1>
        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-color)' }}>
          Payment Method: {order.paymentMethod}
        </span>
      </div>

      {/* Timeline tracker */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--border-radius-lg)', marginBottom: '32px' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '24px' }}>Delivery Tracking Progress</h3>
        <div className={styles.timeline}>
          {order.timeline.map((step, idx) => (
            <div key={idx} className={styles.timelineStep}>
              <div className={`${styles.timelineDot} ${step.done ? styles.timelineActive : ''}`}>
                {idx + 1}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.timelineLabel}>{step.status}</span>
                {step.done && <span className={styles.timelineDate}>{step.date || 'In Progress'}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Shipping address vs products purchased */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: '600' }}>Shipping Address</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Recipient: <strong>{order.shippingAddress?.name}</strong><br />
            Street: {order.shippingAddress?.street}<br />
            City: {order.shippingAddress?.city}, {order.shippingAddress?.zip}<br />
            Phone: {order.shippingAddress?.phone || 'N/A'}
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)' }}>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Items Purchased</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <img src={item.product.images[0]} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ flexGrow: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: '600' }}>{item.product.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Quantity: {item.quantity}</p>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>
                  ${(item.product.price * (1 - (item.product.discount || 0) / 100) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px', marginTop: '16px' }}>
            <span>Total Paid:</span>
            <span style={{ color: 'var(--primary-color)' }}>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// 11. REVIEWS & RATINGS LIST
// ----------------------------------------------------
export const CustomerReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const allProds = await productService.getProducts();
        // Compile all reviews written by customer
        const userReviews = [];
        allProds.forEach(prod => {
          if (prod.reviews) {
            prod.reviews.forEach(rev => {
              if (rev.user.toLowerCase().includes('buyer') || rev.user.toLowerCase().includes(user.name.toLowerCase())) {
                userReviews.push({ ...rev, product: prod });
              }
            });
          }
        });
        setReviews(userReviews);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [user.name]);

  if (loading) return <Loader text="Loading feedback logs..." />;

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>My Reviews & Ratings</h1>
      {reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.map(rev => (
            <div key={rev.id} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Product: <strong>{rev.product.name}</strong></p>
              <div style={{ display: 'flex', gap: '4px', margin: '8px 0', color: 'var(--accent-color)' }}>
                {[...Array(rev.rating)].map((_, i) => <FiStar key={i} style={{ fill: 'currentColor' }} />)}
              </div>
              <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-primary)' }}>"{rev.comment}"</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>Submitted Date: {rev.date}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Reviews Submitted"
          description="You haven't left review comments on any products yet. Go to details page of purchases to provide feedback!"
        />
      )}
    </div>
  );
};

// ----------------------------------------------------
// 12. SETTINGS & PASSWORD CHANGE
// ----------------------------------------------------
export const CustomerSettings = () => {
  const { addToast } = useToast();
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) {
      addToast('New password must exceed 6 characters', 'warning');
      return;
    }
    if (newPass !== confirmPass) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setSaving(true);
    // Mock API
    await new Promise(resolve => setTimeout(resolve, 800));
    addToast('Credentials updated successfully!', 'success');
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
    setSaving(false);
  };

  return (
    <div>
      <h1 className={styles.title} style={{ marginBottom: '24px' }}>Account Security Settings</h1>
      <div style={{ maxWidth: '600px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--border-radius-lg)' }}>
        <form onSubmit={handlePassChange} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Current Password</label>
            <input type="password" placeholder="••••••••" value={oldPass} onChange={(e) => setOldPass(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>New Password</label>
            <input type="password" placeholder="••••••••" value={newPass} onChange={(e) => setNewPass(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Confirm New Password</label>
            <input type="password" placeholder="••••••••" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
          </div>
          <button type="submit" disabled={saving} style={{ alignSelf: 'start', backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '12px 24px', borderRadius: 'var(--border-radius-md)', fontWeight: '600', cursor: 'pointer' }}>
            {saving ? 'Updating...' : 'Update Password Credentials'}
          </button>
        </form>
      </div>
    </div>
  );
};
