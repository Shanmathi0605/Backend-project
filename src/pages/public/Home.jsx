import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMail } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { productService } from '../../services/product';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import { useToast } from '../../context/ToastContext';
import styles from './Home.module.css';

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const { addToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods, brs] = await Promise.all([
        productService.getCategories(),
        productService.getProducts(),
        productService.getBrands()
      ]);
      setCategories(cats);
      setProducts(prods);
      setBrands(brs);
    } catch (err) {
      setError('Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter a valid email address', 'warning');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast('Please enter a valid email format', 'error');
      return;
    }
    addToast('Thank you for subscribing to our newsletter!', 'success');
    setEmail('');
  };

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}><Loader text="Loading NovaCart Store..." /></div>;
  if (error) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}><ErrorState title="Store Unavailable" description={error} onAction={loadData} /></div>;

  // Filter sections
  const flashSaleProducts = products.filter(p => p.discount >= 10).slice(0, 4);
  const featuredProducts = products.filter(p => p.rating >= 4.6).slice(0, 4);
  const newestProducts = [...products].reverse().slice(0, 4);

  return (
    <div className={styles.home}>
      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <span className={styles.heroSubtitle}>Exclusive Summer Deals</span>
            <h1 className={styles.heroTitle}>Upgrade Your Daily Tech & Lifestyle</h1>
            <p className={styles.heroDesc}>
              Explore our premium curated list of gadgets, lifestyle products, and sporting goods. Enjoy rapid shipping, 30 days return window, and 100% genuine products guarantee.
            </p>
            <Link to="/shop" className={styles.heroBtn}>
              <span>Shop Collections</span>
              <FiArrowRight />
            </Link>
          </div>
          <div className={styles.heroImageWrapper}>
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop"
              alt="Premium lifestyle shoes"
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Browse Categories</h2>
            <p className={styles.sectionSubtitle}>Find products structured by industry and usage</p>
          </div>
          <Link to="/categories" className={styles.viewAll}>
            <span>View All</span>
            <FiArrowRight />
          </Link>
        </div>
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <Link key={cat.id} to={`/shop?category=${encodeURIComponent(cat.name)}`} className={styles.categoryCard}>
              <img src={cat.image} alt={cat.name} className={styles.categoryIcon} />
              <span className={styles.categoryName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot Flash Sales */}
      {flashSaleProducts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Flash Sale Deals</h2>
              <p className={styles.sectionSubtitle}>Exclusive high-percentage markdowns. Act fast!</p>
            </div>
            <Link to="/deals" className={styles.viewAll}>
              <span>View All Deals</span>
              <FiArrowRight />
            </Link>
          </div>
          <div className={styles.productGrid}>
            {flashSaleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Featured Products</h2>
              <p className={styles.sectionSubtitle}>Top customer-rated premium picks in our catalog</p>
            </div>
            <Link to="/shop?sort=rating" className={styles.viewAll}>
              <span>Browse All</span>
              <FiArrowRight />
            </Link>
          </div>
          <div className={styles.productGrid}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newestProducts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>New Arrivals</h2>
              <p className={styles.sectionSubtitle}>Newly added selections to keep you ahead of trends</p>
            </div>
            <Link to="/shop?sort=newest" className={styles.viewAll}>
              <span>Check All</span>
              <FiArrowRight />
            </Link>
          </div>
          <div className={styles.productGrid}>
            {newestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Top Brands */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Premium Store Partners</h2>
            <p className={styles.sectionSubtitle}>Explore genuine catalog products from verified brands</p>
          </div>
          <Link to="/brands" className={styles.viewAll}>
            <span>View Brands</span>
            <FiArrowRight />
          </Link>
        </div>
        <div className={styles.brandList}>
          {brands.map((brand) => (
            <Link key={brand.id} to={`/shop?brand=${encodeURIComponent(brand.name)}`}>
              <img src={brand.image} alt={brand.name} className={styles.brandLogo} title={brand.name} />
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.section}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 className={styles.sectionTitle}>What Customers Say</h2>
          <p className={styles.sectionSubtitle}>Read verified ratings and reviews left by buyers</p>
        </div>
        <div className={styles.reviewsGrid}>
          <div className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="Sarah Connor" className={styles.reviewAvatar} />
              <div>
                <p className={styles.reviewUser}>Sarah Connor</p>
                <div className={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                </div>
              </div>
            </div>
            <p className={styles.reviewComment}>
              "The noise canceling on WH-1000XM4 headphones is completely next level. The item arrived in pristine condition, and checkout was a absolute breeze. Will shop again!"
            </p>
          </div>
          <div className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" alt="Marcus Wright" className={styles.reviewAvatar} />
              <div>
                <p className={styles.reviewUser}>Marcus Wright</p>
                <div className={styles.reviewRating}>
                  {[...Array(4)].map((_, i) => <FaStar key={i} />)}
                  <FaStar style={{ color: '#E5E7EB' }} />
                </div>
              </div>
            </div>
            <p className={styles.reviewComment}>
              "Ordered Nike React sneakers. Fast delivery (just 2 days to NYC). The sizes fit perfectly. Very happy with the store support chat team too."
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className={`${styles.section} ${styles.newsletter}`}>
        <h2 className={styles.newsletterTitle}>Stay In the Loop</h2>
        <p className={styles.newsletterDesc}>
          Subscribe to our premium email newsletter to receive custom product launches, exclusive voucher coupons, and seasonal sales info.
        </p>
        <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
          <input
            type="email"
            placeholder="Enter your email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.newsletterInput}
          />
          <button type="submit" className={styles.newsletterBtn}>
            Subscribe Now
          </button>
        </form>
      </section>
    </div>
  );
};
export default Home;
