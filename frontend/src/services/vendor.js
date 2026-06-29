import { api, isMockEnabled } from './api';
import { getDBTable, setDBTable } from './mockData';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const vendorService = {
  async getDashboardStats(vendorId) {
    if (isMockEnabled) {
      await delay(600);
      const products = getDBTable('products').filter(p => p.vendorId === vendorId);
      const orders = getDBTable('orders');
      const vendors = getDBTable('vendors');
      const vendorInfo = vendors.find(v => v.id === vendorId) || { walletBalance: 0, sales: 0 };

      // Calculate vendor orders
      const vendorOrders = orders.filter(o => 
        o.items.some(item => item.product.vendorId === vendorId)
      );

      return {
        totalProducts: products.length,
        totalSales: vendorInfo.sales,
        walletBalance: vendorInfo.walletBalance,
        totalOrders: vendorOrders.length,
        recentSales: [
          { month: 'Jan', amount: 320 },
          { month: 'Feb', amount: 450 },
          { month: 'Mar', amount: 680 },
          { month: 'Apr', amount: 890 },
          { month: 'May', amount: 1200 },
          { month: 'Jun', amount: vendorInfo.sales }
        ]
      };
    }
    const res = await api.get(`/vendor/${vendorId}/dashboard`);
    return res.data;
  },

  async getProducts(vendorId) {
    if (isMockEnabled) {
      await delay(500);
      return getDBTable('products').filter((p) => p.vendorId === vendorId);
    }
    const res = await api.get(`/vendor/${vendorId}/products`);
    return res.data;
  },

  async addProduct(vendorId, productData) {
    if (isMockEnabled) {
      await delay(800);
      const products = getDBTable('products');
      const vendors = getDBTable('vendors');
      const vendor = vendors.find(v => v.id === vendorId) || { name: 'Unknown Store' };
      
      const newProduct = {
        id: 'prod-' + Math.floor(100 + Math.random() * 900),
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        discount: parseFloat(productData.discount || 0),
        category: productData.category,
        brand: productData.brand || 'Generic',
        rating: 5.0,
        reviewsCount: 0,
        stockStatus: parseInt(productData.stock) > 0 ? 'In Stock' : 'Out of Stock',
        stock: parseInt(productData.stock || 0),
        images: productData.images && productData.images.length > 0 
          ? productData.images 
          : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'],
        specs: productData.specs || {},
        vendorId,
        vendorName: vendor.name,
        isApproved: true, // Defaulting to true for demo convenience
        reviews: []
      };

      products.unshift(newProduct);
      setDBTable('products', products);
      return newProduct;
    }
    const res = await api.post(`/vendor/${vendorId}/products`, productData);
    return res.data;
  },

  async editProduct(vendorId, productId, productData) {
    if (isMockEnabled) {
      await delay(800);
      const products = getDBTable('products');
      const index = products.findIndex((p) => p.id === productId && p.vendorId === vendorId);
      if (index === -1) throw new Error('Product not found or access denied');
      
      products[index] = {
        ...products[index],
        ...productData,
        price: parseFloat(productData.price),
        discount: parseFloat(productData.discount || 0),
        stock: parseInt(productData.stock || 0),
        stockStatus: parseInt(productData.stock) > 0 ? 'In Stock' : 'Out of Stock'
      };

      setDBTable('products', products);
      return products[index];
    }
    const res = await api.put(`/vendor/${vendorId}/products/${productId}`, productData);
    return res.data;
  },

  async deleteProduct(vendorId, productId) {
    if (isMockEnabled) {
      await delay(500);
      const products = getDBTable('products');
      const filtered = products.filter((p) => !(p.id === productId && p.vendorId === vendorId));
      setDBTable('products', filtered);
      return { success: true };
    }
    const res = await api.delete(`/vendor/${vendorId}/products/${productId}`);
    return res.data;
  },

  async getOrders(vendorId) {
    if (isMockEnabled) {
      await delay(600);
      const orders = getDBTable('orders');
      
      // Return orders where this vendor has items
      const vendorOrders = orders.filter(order =>
        order.items.some(item => item.product.vendorId === vendorId)
      ).map(order => ({
        ...order,
        // Filter items to show only this vendor's items to this vendor
        items: order.items.filter(item => item.product.vendorId === vendorId),
        // Calculate subtotal of just this vendor's items
        vendorTotal: order.items
          .filter(item => item.product.vendorId === vendorId)
          .reduce((sum, item) => {
            const price = item.product.price * (1 - (item.product.discount || 0) / 100);
            return sum + price * item.quantity;
          }, 0)
      }));

      return vendorOrders;
    }
    const res = await api.get(`/vendor/${vendorId}/orders`);
    return res.data;
  },

  async updateOrderStatus(vendorId, orderId, status) {
    if (isMockEnabled) {
      await delay(600);
      const orders = getDBTable('orders');
      const index = orders.findIndex(o => o.id === orderId);
      if (index === -1) throw new Error('Order not found');
      
      const order = orders[index];
      const timeStr = new Date().toLocaleString();
      const updatedTimeline = order.timeline.map(step => {
        if (step.status.toLowerCase() === status.toLowerCase()) {
          return { ...step, date: timeStr, done: true };
        }
        return step;
      });

      orders[index] = {
        ...order,
        status,
        timeline: updatedTimeline
      };

      setDBTable('orders', orders);
      return orders[index];
    }
    const res = await api.put(`/vendor/${vendorId}/orders/${orderId}`, { status });
    return res.data;
  },

  async requestWithdrawal(vendorId, amount) {
    if (isMockEnabled) {
      await delay(800);
      const vendors = getDBTable('vendors');
      const idx = vendors.findIndex(v => v.id === vendorId);
      if (idx === -1) throw new Error('Vendor not found');

      const currentBalance = vendors[idx].walletBalance;
      if (parseFloat(amount) > currentBalance) {
        throw new Error('Insufficient wallet balance');
      }

      vendors[idx].walletBalance -= parseFloat(amount);
      setDBTable('vendors', vendors);

      const withdrawals = JSON.parse(localStorage.getItem('db_withdrawals') || '[]');
      const req = {
        id: 'wdr-' + Math.floor(100 + Math.random() * 900),
        vendorId,
        vendorName: vendors[idx].name,
        amount: parseFloat(amount),
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      };
      withdrawals.unshift(req);
      localStorage.setItem('db_withdrawals', JSON.stringify(withdrawals));

      return req;
    }
    const res = await api.post(`/vendor/${vendorId}/withdraw`, { amount });
    return res.data;
  },

  async getWithdrawals(vendorId) {
    if (isMockEnabled) {
      await delay(400);
      const withdrawals = JSON.parse(localStorage.getItem('db_withdrawals') || '[]');
      return withdrawals.filter(w => w.vendorId === vendorId);
    }
    const res = await api.get(`/vendor/${vendorId}/withdrawals`);
    return res.data;
  },

  async getCoupons() {
    if (isMockEnabled) {
      await delay(400);
      return getDBTable('coupons');
    }
    const res = await api.get('/vendor/coupons');
    return res.data;
  },

  async createCoupon(couponData) {
    if (isMockEnabled) {
      await delay(600);
      const coupons = getDBTable('coupons');
      const nextCoupon = {
        code: couponData.code.toUpperCase(),
        discount: parseFloat(couponData.discount),
        type: couponData.type,
        expiry: couponData.expiry
      };
      coupons.push(nextCoupon);
      setDBTable('coupons', coupons);
      return nextCoupon;
    }
    const res = await api.post('/vendor/coupons', couponData);
    return res.data;
  }
};
