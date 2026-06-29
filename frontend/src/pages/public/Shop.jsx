import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { productService } from '../../services/product';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './Shop.module.css';

const ITEMS_PER_PAGE = 6;

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Sync URL parameters
  const searchQuery = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlBrand = searchParams.get('brand') || '';

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedBrand, setSelectedBrand] = useState(urlBrand);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [availability, setAvailability] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Load metadata once
    const loadMetadata = async () => {
      try {
        const [cats, brs] = await Promise.all([
          productService.getCategories(),
          productService.getBrands()
        ]);
        setCategories(cats);
        setBrands(brs);
      } catch (err) {
        console.error('Failed to load filter parameters', err);
      }
    };
    loadMetadata();
  }, []);

  useEffect(() => {
    // Sync filter states from URL search parameters dynamically
    setSelectedCategory(urlCategory);
    setSelectedBrand(urlBrand);

    // Reset other filters when a new category or brand query is received
    if (urlCategory || urlBrand) {
      setMinPrice('');
      setMaxPrice('');
      setSelectedRating('');
      setAvailability('');
    }
  }, [urlCategory, urlBrand]);

  useEffect(() => {
    let isMounted = true;

    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts({
          search: searchQuery,
          category: selectedCategory,
          brand: selectedBrand,
          minPrice,
          maxPrice,
          rating: selectedRating,
          availability,
          sort: sortBy
        });
        if (isMounted) {
          setProducts(data);
          setCurrentPage(1); // Reset to page 1 on new filter
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFilteredProducts();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory, selectedBrand, minPrice, maxPrice, selectedRating, availability, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedRating('');
    setAvailability('');
    setSortBy('newest');
    setSearchParams({}); // Clear url search query
  };

  // Pagination Logic
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Sidebar Filters */}
        <aside className={styles.filters}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <span className={styles.filterTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
              <FiFilter /> Filters
            </span>
            <button
              onClick={handleResetFilters}
              style={{ fontSize: '13px', color: 'var(--primary-color)', fontWeight: '600' }}
            >
              Clear All
            </button>
          </div>

          {/* Categories */}
          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Category</h4>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.sortSelect}
              style={{ width: '100%' }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Brands */}
          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Brand</h4>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className={styles.sortSelect}
              style={{ width: '100%' }}
            >
              <option value="">All Brands</option>
              {brands.map((br) => (
                <option key={br.id} value={br.name}>{br.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Price Range ($)</h4>
            <div className={styles.priceInputs}>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={styles.priceInput}
              />
              <span style={{ color: 'var(--text-secondary)' }}>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={styles.priceInput}
              />
            </div>
          </div>

          {/* Ratings */}
          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Minimum Rating</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['4', '3', '2'].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(selectedRating === star ? '' : star)}
                  className={`${styles.ratingBtn} ${selectedRating === star ? styles.ratingActive : ''}`}
                >
                  <FaStar />
                  <span>{star} Stars & Above</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <div className={styles.filterSection}>
            <h4 className={styles.filterTitle}>Availability</h4>
            <ul className={styles.filterList}>
              <li className={styles.filterItem}>
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={availability === 'in-stock'}
                  onChange={(e) => setAvailability(e.target.checked ? 'in-stock' : '')}
                />
                <label htmlFor="inStockCheck">Exclude Out of Stock</label>
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={styles.main}>
          <div className={styles.mainHeader}>
            <div>
              <p className={styles.resultCount}>
                Showing {products.length} products {searchQuery && `matching "${searchQuery}"`}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center' }}>
              <Loader text="Filtering products..." />
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className={styles.productsGrid}>
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={`${styles.pageBtn} ${styles.pageNavBtn}`}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <FiChevronLeft /> Prev
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.pageActive : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className={`${styles.pageBtn} ${styles.pageNavBtn}`}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center' }}>
              <EmptyState
                title="No Products Found"
                description="We couldn't find any products matching your specific filters. Try widening your filters or search terms."
                actionText="Reset All Filters"
                onAction={handleResetFilters}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default Shop;
