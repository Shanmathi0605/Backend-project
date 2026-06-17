import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import styles from './ProductCard.module.css';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);
  const discountPrice = product.price * (1 - (product.discount || 0) / 100);

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {product.discount > 0 && (
          <span className={styles.badge}>-{product.discount}%</span>
        )}
        <button
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistActive : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <FiHeart style={{ fill: isWishlisted ? 'currentColor' : 'none' }} />
        </button>
        <Link to={`/product/${product.id}`}>
          <img src={product.images[0]} alt={product.name} className={styles.image} />
        </Link>
      </div>

      <div className={styles.content}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.name}>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                style={{
                  color: i < Math.floor(product.rating || 5) ? 'var(--accent-color)' : '#E5E7EB',
                }}
              />
            ))}
          </div>
          <span className={styles.ratingVal}>{product.rating || '5.0'}</span>
          <span className={styles.reviewsCount}>({product.reviewsCount || 0})</span>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>${discountPrice.toFixed(2)}</span>
          {product.discount > 0 && (
            <span className={styles.oldPrice}>${product.price.toFixed(2)}</span>
          )}
        </div>

        <div className={styles.footerActions}>
          {product.stock > 0 ? (
            <button
              className={styles.addToCartBtn}
              onClick={(e) => {
                e.preventDefault();
                addToCart(product, 1);
              }}
            >
              <FiShoppingCart />
              <span>Add To Cart</span>
            </button>
          ) : (
            <button className={`${styles.addToCartBtn} ${styles.outOfStock}`} disabled>
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
