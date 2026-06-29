import { api, isMockEnabled } from './api';
import { getDBTable, setDBTable } from './mockData';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const adminService = {
  async getDashboardStats() {
    if (isMockEnabled) {
      await delay(600);
      const vendors = getDBTable('vendors');
      const products = getDBTable('products');
      const orders = getDBTable('orders');
      const tickets = getDBTable('tickets');

      const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
      // Calculate platform commission (assume 10% average commission)
      const commissionEarned = totalSales * 0.10;

      return {
        totalVendors: vendors.length,
        totalProducts: products.length,
        totalSales,
        commissionEarned,
        openTickets: tickets.filter(t => t.status === 'Open').length,
        monthlyAnalytics: [
          { month: 'Jan', sales: 12000, revenue: 1200 },
          { month: 'Feb', sales: 15000, revenue: 1500 },
          { month: 'Mar', sales: 18000, revenue: 1800 },
          { month: 'Apr', sales: 22000, revenue: 2200 },
          { month: 'May', sales: 28000, revenue: 2800 },
          { month: 'Jun', sales: totalSales, revenue: commissionEarned }
        ]
      };
    }
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getVendors() {
    if (isMockEnabled) {
      await delay(500);
      return getDBTable('vendors');
    }
    const res = await api.get('/admin/vendors');
    return res.data;
  },

  async updateVendorStatus(vendorId, status) {
    if (isMockEnabled) {
      await delay(600);
      const vendors = getDBTable('vendors');
      const index = vendors.findIndex(v => v.id === vendorId);
      if (index === -1) throw new Error('Vendor not found');
      vendors[index] = { ...vendors[index], status };
      setDBTable('vendors', vendors);
      return vendors[index];
    }
    const res = await api.put(`/admin/vendors/${vendorId}/status`, { status });
    return res.data;
  },

  async getAllProducts() {
    if (isMockEnabled) {
      await delay(500);
      return getDBTable('products');
    }
    const res = await api.get('/admin/products');
    return res.data;
  },

  async updateProductStatus(productId, isApproved) {
    if (isMockEnabled) {
      await delay(600);
      const products = getDBTable('products');
      const index = products.findIndex(p => p.id === productId);
      if (index === -1) throw new Error('Product not found');
      products[index] = { ...products[index], isApproved };
      setDBTable('products', products);
      return products[index];
    }
    const res = await api.put(`/admin/products/${productId}/status`, { isApproved });
    return res.data;
  },

  async deleteProduct(productId) {
    if (isMockEnabled) {
      await delay(500);
      const products = getDBTable('products');
      const filtered = products.filter(p => p.id !== productId);
      setDBTable('products', filtered);
      return { success: true };
    }
    const res = await api.delete(`/admin/products/${productId}`);
    return res.data;
  },

  async getWithdrawalRequests() {
    if (isMockEnabled) {
      await delay(500);
      return JSON.parse(localStorage.getItem('db_withdrawals') || '[]');
    }
    const res = await api.get('/admin/withdrawals');
    return res.data;
  },

  async updateWithdrawalStatus(withdrawalId, status) {
    if (isMockEnabled) {
      await delay(600);
      const withdrawals = JSON.parse(localStorage.getItem('db_withdrawals') || '[]');
      const index = withdrawals.findIndex(w => w.id === withdrawalId);
      if (index === -1) throw new Error('Withdrawal request not found');

      withdrawals[index] = { ...withdrawals[index], status };
      localStorage.setItem('db_withdrawals', JSON.stringify(withdrawals));

      // If rejected, refund the vendor's wallet balance
      if (status === 'Rejected') {
        const vendors = getDBTable('vendors');
        const vIdx = vendors.findIndex(v => v.id === withdrawals[index].vendorId);
        if (vIdx > -1) {
          vendors[vIdx].walletBalance += withdrawals[index].amount;
          setDBTable('vendors', vendors);
        }
      }

      return withdrawals[index];
    }
    const res = await api.put(`/admin/withdrawals/${withdrawalId}`, { status });
    return res.data;
  },

  async getSupportTickets() {
    if (isMockEnabled) {
      await delay(500);
      return getDBTable('tickets');
    }
    const res = await api.get('/admin/tickets');
    return res.data;
  },

  async updateTicketStatus(ticketId, status) {
    if (isMockEnabled) {
      await delay(400);
      const tickets = getDBTable('tickets');
      const idx = tickets.findIndex(t => t.id === ticketId);
      if (idx === -1) throw new Error('Ticket not found');
      tickets[idx] = { ...tickets[idx], status };
      setDBTable('tickets', tickets);
      return tickets[idx];
    }
    const res = await api.put(`/admin/tickets/${ticketId}`, { status });
    return res.data;
  },

  async addCategory(name, image) {
    if (isMockEnabled) {
      await delay(500);
      const categories = getDBTable('categories');
      const newCat = {
        id: 'cat-' + Math.floor(100 + Math.random() * 900),
        name,
        image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop'
      };
      categories.push(newCat);
      setDBTable('categories', categories);
      return newCat;
    }
    const res = await api.post('/admin/categories', { name, image });
    return res.data;
  },

  async addBrand(name, image) {
    if (isMockEnabled) {
      await delay(500);
      const brands = getDBTable('brands');
      const newBrand = {
        id: 'brand-' + Math.floor(100 + Math.random() * 900),
        name,
        image: image || 'https://images.unsplash.com/photo-1612810806563-4cb1a99a2037?q=80&w=200&auto=format&fit=crop'
      };
      brands.push(newBrand);
      setDBTable('brands', brands);
      return newBrand;
    }
    const res = await api.post('/admin/brands', { name, image });
    return res.data;
  }
};
