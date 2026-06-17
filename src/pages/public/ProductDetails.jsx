import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiHeart, FiShoppingBag, FiStar, FiChevronLeft } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { productService } from '../../services/product';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import styles from './ProductDetails.module.css';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery & Detail Interactive States
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProductData = async () => {
    setLoading(true);
    setError(null);
    try {
      const prod = await productService.getProductById(id);
      setProduct(prod);
      setActiveImage(prod.images[0]);
      setQuantity(1);

      // Load related products from same category
      const allProds = await productService.getProducts({ category: prod.category });
      setRelatedProducts(allProds.filter((p) => p.id !== prod.id).slice(0, 4));
    } catch (err) {
      setError('Product details could not be retrieved.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [id]);

  const handleQtyChange = (type) => {
    if (type === 'dec') {
      setQuantity((prev) => Math.max(1, prev - 1));
    } else if (type === 'inc') {
      setQuantity((prev) => Math.min(product.stock, prev + 1));
    }
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/customer/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      addToast('Please enter a review comment', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      const newReview = await productService.addReview(product.id, {
        user: 'Anonymous Buyer',
        rating: reviewRating,
        comment: reviewComment,
      });

      // Reload product details in UI to update averages
      const updatedProd = await productService.getProductById(product.id);
      setProduct(updatedProd);
      setReviewComment('');
      setReviewRating(5);
      addToast('Review posted successfully!', 'success');
    } catch (err) {
      addToast('Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}><Loader text="Retrieving product specifications..." /></div>;
  if (error || !product) return <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}><ErrorState title="Product Not Found" description={error || 'The requested product is missing.'} onAction={loadProductData} /></div>;

  const isWishlisted = isInWishlist(product.id);
  const discountPrice = product.price * (1 - (product.discount || 0) / 100);

  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumb}>
        <Link to="/">Home</Link>
        <FiChevronRight />
        <Link to="/shop">Shop</Link>
        <FiChevronRight />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
        <FiChevronRight />
        <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
      </div>

      <div className={styles.productGrid}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrapper}>
            <img src={activeImage} alt={product.name} className={styles.mainImage} />
          </div>
          {product.images.length > 1 && (
            <div className={styles.thumbnails}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumbnailBtn} ${activeImage === img ? styles.thumbnailActive : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt="" className={styles.thumbnailImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className={styles.details}>
          <div className={styles.badgeRow}>
            <span className={styles.vendorTag}>Store: {product.vendorName}</span>
            <span
              className={`${styles.stockBadge} ${
                product.stock > 0 ? styles.inStock : styles.outOfStock
              }`}
            >
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.brand}>Brand: <strong>{product.brand}</strong></p>

          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  style={{
                    color: i < Math.floor(product.rating) ? 'var(--accent-color)' : '#E5E7EB',
                  }}
                />
              ))}
            </div>
            <span className={styles.ratingVal}>{product.rating.toFixed(1)}</span>
            <span className={styles.reviewsCount}>({product.reviewsCount} Customer Reviews)</span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>${discountPrice.toFixed(2)}</span>
            {product.discount > 0 && (
              <>
                <span className={styles.oldPrice}>${product.price.toFixed(2)}</span>
                <span className={styles.discount}>Save {product.discount}%</span>
              </>
            )}
          </div>

          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {product.description}
          </p>

          <div className={styles.actions}>
            {product.stock > 0 ? (
              <>
                <div className={styles.qtyRow}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>Quantity:</span>
                  <div className={styles.qtySelector}>
                    <button className={styles.qtyBtn} onClick={() => handleQtyChange('dec')}>-</button>
                    <span className={styles.qtyVal}>{quantity}</span>
                    <button className={styles.qtyBtn} onClick={() => handleQtyChange('inc')}>+</button>
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    ({product.stock} units available)
                  </span>
                </div>

                <div className={styles.buttonGroup}>
                  <button className={styles.btnPrimary} onClick={() => addToCart(product, quantity)}>
                    <FiShoppingBag /> Add to Cart
                  </button>
                  <button className={styles.btnSecondary} onClick={handleBuyNow}>
                    Buy Now
                  </button>
                  <button
                    className={`${styles.btnWishlist} ${isWishlisted ? styles.wishlistActive : ''}`}
                    onClick={() => toggleWishlist(product)}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <FiHeart style={{ fill: isWishlisted ? 'currentColor' : 'none' }} />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className={`${styles.btnPrimary} ${styles.outOfStock}`} style={{ width: '100%' }} disabled>
                  Out of Stock
                </button>
                <button
                  className={`${styles.btnWishlist} ${isWishlisted ? styles.wishlistActive : ''}`}
                  onClick={() => toggleWishlist(product)}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <FiHeart style={{ fill: isWishlisted ? 'currentColor' : 'none' }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Specifications & Reviews */}
      <section className={styles.tabsSection}>
        <div className={styles.tabHeader}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'description' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Detailed Specifications
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews & Ratings ({product.reviews?.length || 0})
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'description' ? (
            <div>
              <p>{product.description}</p>
              {Object.keys(product.specs).length > 0 ? (
                <table className={styles.specTable}>
                  <tbody>
                    {Object.entries(product.specs).map(([key, val], idx) => (
                      <tr key={idx} className={styles.specRow}>
                        <td className={styles.specName}>{key}</td>
                        <td className={styles.specVal}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ marginTop: '12px', fontStyle: 'italic' }}>No extra specifications listed for this item.</p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {/* Form to submit review */}
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px', backgroundColor: 'var(--card-bg)', padding: '24px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)' }}>
                <h4 className={styles.specName} style={{ background: 'none', padding: 0 }}>Write a Review</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Your Rating:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        style={{ fontSize: '18px', color: star <= reviewRating ? 'var(--accent-color)' : '#D1D5DB' }}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Share details of your experience with this item..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', fontSize: '14px' }}
                />
                <button type="submit" disabled={submittingReview} className={styles.btnPrimary} style={{ alignSelf: 'start', padding: '10px 24px', fontSize: '14px' }}>
                  Submit Feedback
                </button>
              </form>

              {/* Reviews Items */}
              <div className={styles.reviewsList}>
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className={styles.reviewItem}>
                      <div className={styles.reviewMeta}>
                        <span className={styles.reviewer}>{rev.user}</span>
                        <span className={styles.reviewDate}>{rev.date}</span>
                      </div>
                      <div className={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} style={{ color: i < rev.rating ? 'var(--accent-color)' : '#E5E7EB' }} />
                        ))}
                      </div>
                      <p className={styles.comment}>{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>There are no reviews yet for this product. Be the first to leave one!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className={styles.title} style={{ fontSize: '24px', marginBottom: '24px' }}>Related Products</h2>
          <div className={styles.productGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
export default ProductDetails;
