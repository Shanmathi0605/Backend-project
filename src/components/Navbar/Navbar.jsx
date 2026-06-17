import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiUser, FiSearch, FiLogOut, FiChevronDown, FiLayers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import styles from './Navbar.module.css';

export const Navbar = () => {
  const { user, logout, login, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleDemoRoleSwitch = async (role) => {
    setRoleMenuOpen(false);
    if (role === 'guest') {
      logout();
      navigate('/');
    } else {
      await login(`${role}@test.com`, 'password123', role);
      if (role === 'customer') navigate('/customer');
      if (role === 'vendor') navigate('/vendor');
      if (role === 'admin') navigate('/admin');
    }
  };

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <FiShoppingBag />
          <span>Nova<span className={styles.logoText}>Cart</span></span>
        </Link>

        {/* Navigation Links */}
        <ul className={styles.navLinks}>
          <li className={`${styles.navLink} ${isLinkActive('/') ? styles.activeLink : ''}`}>
            <Link to="/">Home</Link>
          </li>
          <li className={`${styles.navLink} ${isLinkActive('/shop') ? styles.activeLink : ''}`}>
            <Link to="/shop">Shop</Link>
          </li>
          <li className={`${styles.navLink} ${isLinkActive('/categories') ? styles.activeLink : ''}`}>
            <Link to="/categories">Categories</Link>
          </li>
          <li className={`${styles.navLink} ${isLinkActive('/deals') ? styles.activeLink : ''}`}>
            <Link to="/deals">Deals</Link>
          </li>
          <li className={`${styles.navLink} ${isLinkActive('/brands') ? styles.activeLink : ''}`}>
            <Link to="/brands">Brands</Link>
          </li>
        </ul>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className={styles.searchWrapper}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 40px 10px 16px',
                borderRadius: 'var(--border-radius-full)',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                backgroundColor: 'var(--bg-color)',
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: '14px',
                fontSize: '16px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FiSearch />
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className={styles.actions}>
          {/* Quick Role Switcher (For Demo & Sandbox testing) */}
          <div className={styles.profileMenu}>
            <button className={styles.demoSwitcher} onClick={() => setRoleMenuOpen(!roleMenuOpen)}>
              <FiLayers />
              <span>Sandbox Roles</span>
              <FiChevronDown />
            </button>
            {roleMenuOpen && (
              <div className={styles.dropdown} style={{ width: '180px' }}>
                <button className={styles.dropdownItem} onClick={() => handleDemoRoleSwitch('customer')}>
                  Customer View
                </button>
                <button className={styles.dropdownItem} onClick={() => handleDemoRoleSwitch('vendor')}>
                  Vendor View
                </button>
                <button className={styles.dropdownItem} onClick={() => handleDemoRoleSwitch('admin')}>
                  Admin View
                </button>
                <div className={styles.dropdownDivider} />
                <button className={styles.dropdownItem} onClick={() => handleDemoRoleSwitch('guest')}>
                  Clear Session
                </button>
              </div>
            )}
          </div>

          <Link to="/customer/wishlist" className={styles.actionBtn} title="Wishlist">
            <FiHeart />
            {wishlistItems.length > 0 && <span className={styles.badge}>{wishlistItems.length}</span>}
          </Link>

          <Link to="/customer/cart" className={styles.actionBtn} title="Shopping Cart">
            <FiShoppingBag />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

          {/* User Account */}
          <div className={styles.profileMenu}>
            {isAuthenticated ? (
              <>
                <button className={styles.avatarBtn} onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <img src={user.avatar} alt={user.name} className={styles.avatar} />
                  <span className={styles.userName}>{user.name}</span>
                  <FiChevronDown />
                </button>
                {dropdownOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.userName} style={{ display: 'block' }}>{user.name}</p>
                      <span className={styles.userEmail}>{user.email}</span>
                      <div>
                        <span className={`${styles.userRoleBadge} ${styles['role_' + user.role]}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    {user.role === 'customer' && (
                      <>
                        <Link to="/customer" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          My Dashboard
                        </Link>
                        <Link to="/customer/profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          My Profile
                        </Link>
                        <Link to="/customer/orders" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          My Orders
                        </Link>
                      </>
                    )}
                    {user.role === 'vendor' && (
                      <>
                        <Link to="/vendor" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          Vendor Dashboard
                        </Link>
                        <Link to="/vendor/store-profile" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          Store Profile
                        </Link>
                        <Link to="/vendor/products" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          Manage Products
                        </Link>
                      </>
                    )}
                    {user.role === 'admin' && (
                      <>
                        <Link to="/admin" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          Admin Dashboard
                        </Link>
                        <Link to="/admin/vendors" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          Manage Vendors
                        </Link>
                        <Link to="/admin/analytics" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          Site Analytics
                        </Link>
                      </>
                    )}
                    <div className={styles.dropdownDivider} />
                    <button
                      className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                        navigate('/');
                      }}
                    >
                      <FiLogOut />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.guestBtns}>
                <Link to="/login" className={styles.loginLink}>Login</Link>
                <Link to="/register" className={styles.registerLink}>Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
