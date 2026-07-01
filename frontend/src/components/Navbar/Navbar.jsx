import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiUser, FiSearch, FiLogOut, FiChevronDown, FiLayers, FiMenu, FiX } from 'react-icons/fi';
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      let email = `${role}@test.com`;
      if (role === 'admin') email = 'smily.shanvi6597@gmail.com';
      if (role === 'vendor') email = 'smily.shanvi6597+vendor@gmail.com';
      
      await login(email, 'password123', role);
      if (role === 'customer') navigate('/');
      if (role === 'vendor') navigate('/vendor');
      if (role === 'admin') navigate('/admin');
    }
  };

  const isLinkActive = (path) => {
    return location.pathname === path;
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isVendorOrAdmin = user?.role === 'vendor' || user?.role === 'admin';

  return (
    <nav className={styles.navbar}>
      <div className={styles.container} style={isVendorOrAdmin ? { maxWidth: '100%', padding: '0 24px' } : {}}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <FiShoppingBag />
          <span>Nova<span className={styles.logoText}>Cart</span></span>
        </Link>



        {!isVendorOrAdmin && (
          <>
            {/* Navigation Links */}
            <ul className={`${styles.navLinks} ${mobileMenuOpen ? styles.mobileMenu : ''}`}>
              <button 
                className={styles.closeMenuBtn}
                onClick={() => setMobileMenuOpen(false)}
                title="Close Menu"
              >
                <FiX />
              </button>
          <li className={`${styles.navLink} ${isLinkActive('/') ? styles.activeLink : ''}`}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          </li>
          <li className={`${styles.navLink} ${isLinkActive('/shop') ? styles.activeLink : ''}`}>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
          </li>
          <li className={`${styles.navLink} ${isLinkActive('/categories') ? styles.activeLink : ''}`}>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)}>Categories</Link>
          </li>
          <li className={`${styles.navLink} ${isLinkActive('/deals') ? styles.activeLink : ''}`}>
            <Link to="/deals" onClick={() => setMobileMenuOpen(false)}>Deals</Link>
          </li>
          <li className={`${styles.navLink} ${isLinkActive('/brands') ? styles.activeLink : ''}`}>
            <Link to="/brands" onClick={() => setMobileMenuOpen(false)}>Brands</Link>
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
          </>
        )}

        {/* Action Buttons */}
        <div className={styles.actions}>
          {!isVendorOrAdmin && (
            <>
              <Link to="/customer/wishlist" className={styles.actionBtn} title="Wishlist">
            <FiHeart />
            {wishlistItems.length > 0 && <span className={styles.badge}>{wishlistItems.length}</span>}
          </Link>

          <Link to="/cart" className={styles.actionBtn} title="Shopping Cart">
            <FiShoppingBag />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>
            </>
          )}

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
                        <Link to="/customer/orders" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          My Orders
                        </Link>
                        <div 
                          className={styles.dropdownItem} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSettingsOpen(!settingsOpen);
                          }}
                          style={{ justifyContent: 'space-between', cursor: 'pointer' }}
                        >
                          <span>Settings</span>
                          <FiChevronDown style={{ transform: settingsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                        {settingsOpen && (
                          <Link to="/customer/profile" className={styles.dropdownItem} style={{ paddingLeft: '32px', fontSize: '13px', backgroundColor: 'var(--bg-color)' }} onClick={() => setDropdownOpen(false)}>
                            My Profile
                          </Link>
                        )}
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

          {!isVendorOrAdmin && (
            <button 
              className={styles.hamburgerBtn} 
              onClick={() => setMobileMenuOpen(true)}
            >
              <FiMenu />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
