import React from 'react';
import { Link } from 'react-router-dom';
import { FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcApplePay } from 'react-icons/fa';
import { FiShoppingBag } from 'react-icons/fi';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.colBrand}>
          <Link to="/" className={styles.logo}>
            <FiShoppingBag />
            <span>Nova<span className={styles.logoText}>Cart</span></span>
          </Link>
          <p className={styles.brandDesc}>
            Experience a modern premium multi-vendor shopping destination. Discover curated brands, exclusive items, and seamless customer service.
          </p>
        </div>
        <div>
          <h4 className={styles.heading}>Shop</h4>
          <ul className={styles.links}>
            <li className={styles.linkItem}><Link to="/shop">All Products</Link></li>
            <li className={styles.linkItem}><Link to="/categories">Categories</Link></li>
            <li className={styles.linkItem}><Link to="/deals">Hot Deals</Link></li>
            <li className={styles.linkItem}><Link to="/brands">Our Brands</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={styles.heading}>Company</h4>
          <ul className={styles.links}>
            <li className={styles.linkItem}><Link to="/about">About Us</Link></li>
            <li className={styles.linkItem}><Link to="/contact">Contact Support</Link></li>
            <li className={styles.linkItem}><Link to="/faq">Frequently Asked FAQs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={styles.heading}>Legal</h4>
          <ul className={styles.links}>
            <li className={styles.linkItem}><Link to="/privacy">Privacy Policy</Link></li>
            <li className={styles.linkItem}><Link to="/terms">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>
      <div className={styles.bottomBar}>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} NovaCart Multi-Vendor. All Rights Reserved.
        </p>
        <div className={styles.payments}>
          <FaCcVisa title="Visa" />
          <FaCcMastercard title="Mastercard" />
          <FaCcPaypal title="Paypal" />
          <FaCcApplePay title="Apple Pay" />
        </div>
      </div>
    </footer>
  );
};
export default Footer;
