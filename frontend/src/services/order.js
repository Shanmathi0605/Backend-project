import { api, isMockEnabled } from './api';
import { getDBTable, setDBTable } from './mockData';

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const orderService = {
  async placeOrder(orderData) {
    if (isMockEnabled) {
      await delay(1000);
      const orders = getDBTable('orders');
      
      const newOrder = {
        id: 'ord-' + Math.floor(1000 + Math.random() * 9000),
        customerId: orderData.customerId || 'customer-1',
        customerName: orderData.customerName || 'John Doe',
        date: new Date().toISOString().split('T')[0],
        total: orderData.total,
        status: 'Processing',
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress,
        items: orderData.items,
        timeline: [
          { status: 'Ordered', date: new Date().toLocaleString(), done: true },
          { status: 'Processed', date: new Date().toLocaleString(), done: true },
          { status: 'Shipped', date: '', done: false },
          { status: 'Delivered', date: '', done: false }
        ]
      };

      orders.unshift(newOrder);
      setDBTable('orders', orders);

      // Decrement inventory stock count for items bought
      const products = getDBTable('products');
      orderData.items.forEach(item => {
        const pIndex = products.findIndex(p => p.id === item.product.id);
        if (pIndex > -1) {
          const product = products[pIndex];
          const nextStock = Math.max(0, product.stock - item.quantity);
          products[pIndex] = {
            ...product,
            stock: nextStock,
            stockStatus: nextStock === 0 ? 'Out of Stock' : 'In Stock'
          };
        }
      });
      setDBTable('products', products);

      // Update Vendor Sales & Wallet balances
      const vendors = getDBTable('vendors');
      orderData.items.forEach(item => {
        const vIndex = vendors.findIndex(v => v.id === (item.product.vendorId || 'vendor-1'));
        if (vIndex > -1) {
          const vendor = vendors[vIndex];
          const itemPrice = item.product.price * (1 - (item.product.discount || 0) / 100) * item.quantity;
          const commission = (itemPrice * (vendor.commissionRate || 10)) / 100;
          const vendorEarning = itemPrice - commission;
          
          vendors[vIndex] = {
            ...vendor,
            sales: vendor.sales + itemPrice,
            walletBalance: vendor.walletBalance + vendorEarning
          };
        }
      });
      setDBTable('vendors', vendors);

      return newOrder;
    }
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  async getOrders(customerId) {
    if (isMockEnabled) {
      await delay(600);
      const orders = getDBTable('orders');
      if (customerId) {
        return orders.filter((o) => o.customerId === customerId);
      }
      return orders;
    }
    const res = await api.get('/orders', { params: { customerId } });
    return res.data;
  },

  async getOrderById(id) {
    if (isMockEnabled) {
      await delay(500);
      const order = getDBTable('orders').find((o) => o.id === id);
      if (!order) throw new Error('Order not found');
      return order;
    }
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  async trackOrder(orderId) {
    if (isMockEnabled) {
      await delay(600);
      const order = getDBTable('orders').find((o) => o.id === orderId);
      if (!order) throw new Error('Tracking number/Order not found');
      return order;
    }
    const res = await api.get(`/orders/track/${orderId}`);
    return res.data;
  },

  async submitSupportTicket(ticketData) {
    if (isMockEnabled) {
      await delay(800);
      const tickets = getDBTable('tickets');
      const newTicket = {
        id: 'tkt-' + Math.floor(100 + Math.random() * 900),
        customerName: ticketData.customerName || 'Anonymous',
        subject: ticketData.subject,
        priority: ticketData.priority || 'Medium',
        status: 'Open',
        message: ticketData.message,
        date: new Date().toISOString().split('T')[0]
      };
      tickets.unshift(newTicket);
      setDBTable('tickets', tickets);
      return newTicket;
    }
    const res = await api.post('/orders/support/tickets', ticketData);
    return res.data;
  }
};
