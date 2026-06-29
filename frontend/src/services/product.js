import { api, isMockEnabled } from './api';
import { getDBTable, setDBTable } from './mockData';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const productService = {
  async getCategories() {
    if (isMockEnabled) {
      await delay(300);
      return getDBTable('categories');
    }
    const res = await api.get('/products/categories');
    return res.data;
  },

  async getBrands() {
    if (isMockEnabled) {
      await delay(300);
      return getDBTable('brands');
    }
    const res = await api.get('/products/brands');
    return res.data;
  },

  async getProducts(filters = {}) {
    if (isMockEnabled) {
      await delay(600);
      let products = getDBTable('products').filter(p => p.isApproved);
      
      const { search, category, brand, rating, minPrice, maxPrice, availability, sort } = filters;
      
      if (search) {
        const query = search.toLowerCase();
        products = products.filter(
          p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
        );
      }
      
      if (category) {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      
      if (brand) {
        products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
      }
      
      if (rating) {
        products = products.filter(p => p.rating >= parseFloat(rating));
      }
      
      if (minPrice !== undefined && minPrice !== '') {
        products = products.filter(p => {
          const discountPrice = p.price * (1 - (p.discount || 0) / 100);
          return discountPrice >= parseFloat(minPrice);
        });
      }
      
      if (maxPrice !== undefined && maxPrice !== '') {
        products = products.filter(p => {
          const discountPrice = p.price * (1 - (p.discount || 0) / 100);
          return discountPrice <= parseFloat(maxPrice);
        });
      }
      
      if (availability) {
        if (availability === 'in-stock') {
          products = products.filter(p => p.stockStatus === 'In Stock');
        } else if (availability === 'out-of-stock') {
          products = products.filter(p => p.stockStatus === 'Out of Stock');
        }
      }

      if (sort) {
        if (sort === 'price-low') {
          products.sort((a, b) => {
            const pa = a.price * (1 - (a.discount || 0) / 100);
            const pb = b.price * (1 - (b.discount || 0) / 100);
            return pa - pb;
          });
        } else if (sort === 'price-high') {
          products.sort((a, b) => {
            const pa = a.price * (1 - (a.discount || 0) / 100);
            const pb = b.price * (1 - (b.discount || 0) / 100);
            return pb - pa;
          });
        } else if (sort === 'rating') {
          products.sort((a, b) => b.rating - a.rating);
        } else if (sort === 'newest') {
          products.reverse(); // Mock simple recency
        }
      }

      return products;
    }
    const res = await api.get('/products', { params: filters });
    return res.data;
  },

  async getProductById(id) {
    if (isMockEnabled) {
      await delay(500);
      const product = getDBTable('products').find((p) => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    }
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  async addReview(productId, reviewData) {
    if (isMockEnabled) {
      await delay(600);
      const products = getDBTable('products');
      const index = products.findIndex((p) => p.id === productId);
      if (index === -1) throw new Error('Product not found');
      
      const newReview = {
        id: Math.random().toString(36).substring(2, 9),
        user: reviewData.user || 'Anonymous',
        rating: parseInt(reviewData.rating),
        comment: reviewData.comment,
        date: new Date().toISOString().split('T')[0]
      };

      const product = products[index];
      const reviews = product.reviews ? [...product.reviews, newReview] : [newReview];
      const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

      products[index] = {
        ...product,
        reviews,
        rating: parseFloat(avgRating),
        reviewsCount: reviews.length
      };

      setDBTable('products', products);
      return newReview;
    }
    const res = await api.post(`/products/${productId}/reviews`, reviewData);
    return res.data;
  }
};
