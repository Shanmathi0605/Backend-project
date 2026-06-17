import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid, FiUser, FiMapPin, FiHeart, FiShoppingBag, FiList, FiStar,
  FiSettings, FiBriefcase, FiTag, FiTrendingUp, FiCreditCard, FiMessageSquare,
  FiSliders, FiUsers, FiFolder, FiDollarSign, FiInbox, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

export const Sidebar = ({ isOpen }) => {
  const { user, role } = useAuth();

  const getMenuLinks = () => {
    switch (role) {
      case 'customer':
        return [
          { label: 'Dashboard', path: '/customer', icon: <FiGrid className={styles.icon} />, end: true },
          { label: 'My Profile', path: '/customer/profile', icon: <FiUser className={styles.icon} /> },
          { label: 'Addresses', path: '/customer/addresses', icon: <FiMapPin className={styles.icon} /> },
          { label: 'Wishlist', path: '/customer/wishlist', icon: <FiHeart className={styles.icon} /> },
          { label: 'Shopping Cart', path: '/customer/cart', icon: <FiShoppingBag className={styles.icon} /> },
          { label: 'My Orders', path: '/customer/orders', icon: <FiList className={styles.icon} /> },
          { label: 'Reviews & Ratings', path: '/customer/reviews', icon: <FiStar className={styles.icon} /> },
          { label: 'Account Settings', path: '/customer/settings', icon: <FiSettings className={styles.icon} /> },
        ];
      case 'vendor':
        return [
          { label: 'Dashboard', path: '/vendor', icon: <FiGrid className={styles.icon} />, end: true },
          { label: 'Store Profile', path: '/vendor/store-profile', icon: <FiBriefcase className={styles.icon} /> },
          { label: 'Manage Products', path: '/vendor/products', icon: <FiShoppingBag className={styles.icon} /> },
          { label: 'Inventory', path: '/vendor/inventory', icon: <FiList className={styles.icon} /> },
          { label: 'Orders List', path: '/vendor/orders', icon: <FiList className={styles.icon} /> },
          { label: 'Coupons Management', path: '/vendor/coupons', icon: <FiTag className={styles.icon} /> },
          { label: 'Sales Analytics', path: '/vendor/analytics', icon: <FiTrendingUp className={styles.icon} /> },
          { label: 'Wallet & Withdrawals', path: '/vendor/wallet', icon: <FiCreditCard className={styles.icon} /> },
          { label: 'Store Reviews', path: '/vendor/reviews', icon: <FiStar className={styles.icon} /> },
        ];
      case 'admin':
        return [
          { label: 'Dashboard Overview', path: '/admin', icon: <FiGrid className={styles.icon} />, end: true },
          { label: 'Sales Analytics', path: '/admin/analytics', icon: <FiTrendingUp className={styles.icon} /> },
          { label: 'Manage Vendors', path: '/admin/vendors', icon: <FiBriefcase className={styles.icon} /> },
          { label: 'Manage Customers', path: '/admin/customers', icon: <FiUsers className={styles.icon} /> },
          { label: 'Manage Products', path: '/admin/products', icon: <FiShoppingBag className={styles.icon} /> },
          { label: 'Manage Catalog', path: '/admin/catalog', icon: <FiFolder className={styles.icon} /> },
          { label: 'Manage Orders', path: '/admin/orders', icon: <FiList className={styles.icon} /> },
          { label: 'Withdrawal Queue', path: '/admin/withdrawals', icon: <FiDollarSign className={styles.icon} /> },
          { label: 'Support Tickets', path: '/admin/tickets', icon: <FiInbox className={styles.icon} /> },
          { label: 'Platform Settings', path: '/admin/settings', icon: <FiSliders className={styles.icon} /> },
        ];
      default:
        return [];
    }
  };

  const links = getMenuLinks();

  if (!role) return null;

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <div>
        <div className={styles.profileCard}>
          <img src={user?.avatar} alt={user?.name} className={styles.avatar} />
          <div className={styles.profileInfo}>
            <p className={styles.name}>{user?.name}</p>
            <span className={styles.role}>{user?.role}</span>
          </div>
        </div>

        <div className={styles.roleSection}>
          <p className={styles.roleTitle}>{role} Panel</p>
          <ul className={styles.menuList}>
            {links.map((link, idx) => (
              <li key={idx}>
                <NavLink
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) =>
                    isActive ? `${styles.menuLink} ${styles.activeMenuLink}` : styles.menuLink
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
