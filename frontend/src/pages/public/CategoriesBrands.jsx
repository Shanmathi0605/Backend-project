import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { productService } from '../../services/product';
import Loader from '../../components/Loader/Loader';
import styles from './Home.module.css';

export const CategoriesBrands = () => {
  const location = useLocation();
  const isBrandsPage = location.pathname.includes('brands');

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cats, brs] = await Promise.all([
          productService.getCategories(),
          productService.getBrands()
        ]);
        setCategories(cats);
        setBrands(brs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}><Loader text="Loading Catalog Data..." /></div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {isBrandsPage ? (
        <section>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className={styles.sectionTitle} style={{ fontSize: '36px' }}>Our Brand Partners</h1>
            <p className={styles.sectionSubtitle}>We partner with the world's most trusted manufacturers to deliver genuine items</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/shop?brand=${encodeURIComponent(brand.name)}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '32px 24px',
                  transition: 'all var(--transition-fast)'
                }}
                className={styles.categoryCard}
              >
                <img
                  src={brand.image}
                  alt={brand.name}
                  style={{ height: '60px', objectFit: 'contain' }}
                />
                <span className={styles.categoryName} style={{ fontSize: '18px' }}>{brand.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className={styles.sectionTitle} style={{ fontSize: '36px' }}>Catalog Categories</h1>
            <p className={styles.sectionSubtitle}>Find products structured by department and usage</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-lg)',
                  overflow: 'hidden',
                  transition: 'all var(--transition-fast)'
                }}
                className={styles.categoryCard}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <span className={styles.categoryName} style={{ fontSize: '18px' }}>{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
export default CategoriesBrands;
