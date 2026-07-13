import React, { useState, useEffect } from 'react';
import { productService } from '../../services/product';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './Deals.module.css';

export const Deals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock Timer State
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      const dealsOnly = data.filter(p => p.discount && p.discount > 0);
      setProducts(dealsOnly);
    } catch (err) {
      console.error('Error fetching deals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
    
    // Countdown timer logic
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
            else hours = 23;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (val) => val.toString().padStart(2, '0');

  return (
    <div className={styles.dealsContainer}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <h1 className={styles.heroTitle}>Flash Deals</h1>
        <p className={styles.heroSubtitle}>
          Unbeatable discounts on top products. Hurry, these deals won't last long!
        </p>
        
        <div className={styles.timer}>
          <div className={styles.timeBox}>
            <span className={styles.timeValue}>{formatTime(timeLeft.hours)}</span>
            <span className={styles.timeLabel}>Hours</span>
          </div>
          <div className={styles.timeBox}>
            <span className={styles.timeValue}>{formatTime(timeLeft.minutes)}</span>
            <span className={styles.timeLabel}>Mins</span>
          </div>
          <div className={styles.timeBox}>
            <span className={styles.timeValue}>{formatTime(timeLeft.seconds)}</span>
            <span className={styles.timeLabel}>Secs</span>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Top Offers For You</h2>

      {loading ? (
        <Loader />
      ) : products.length > 0 ? (
        <div className={styles.dealsGrid}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <EmptyState 
            title="No Deals Available" 
            message="Check back later for exciting discounts!"
          />
        </div>
      )}
    </div>
  );
};

export default Deals;
