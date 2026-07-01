// Centered Mock Database for stateful multi-role demo using localStorage

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=300&auto=format&fit=crop' },
  { id: 'cat-2', name: 'Fashion & Apparel', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=300&auto=format&fit=crop' },
  { id: 'cat-3', name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=300&auto=format&fit=crop' },
  { id: 'cat-4', name: 'Sports & Outdoors', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=300&auto=format&fit=crop' },
  { id: 'cat-5', name: 'Beauty & Cosmetics', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=300&auto=format&fit=crop' }
];

const INITIAL_BRANDS = [
  { id: 'brand-1', name: 'Sony', image: 'https://images.unsplash.com/photo-1612810806563-4cb1a99a2037?q=80&w=200&auto=format&fit=crop' },
  { id: 'brand-2', name: 'Nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop' },
  { id: 'brand-3', name: 'Apple', image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=200&auto=format&fit=crop' },
  { id: 'brand-4', name: 'Samsung', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=200&auto=format&fit=crop' },
  { id: 'brand-5', name: 'Adidas', image: 'https://images.unsplash.com/photo-1518002171953-a080ee81be44?q=80&w=200&auto=format&fit=crop' }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Sony WH-1000XM4 Wireless Headphones',
    description: 'Industry-leading noise canceling wireless over-ear headphones with focal sound optimization and smart listening technology.',
    price: 348.00,
    discount: 15,
    category: 'Electronics',
    brand: 'Sony',
    rating: 4.8,
    reviewsCount: 124,
    stockStatus: 'In Stock',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Battery Life': 'Up to 30 hours',
      'Charging Time': '10 min charge for 5 hr playback',
      'Noise Cancelling': 'Dual Noise Sensor technology',
      'Weight': '254 grams'
    },
    vendorId: 'vendor-1',
    vendorName: 'TechNova Solutions',
    isApproved: true,
    variants: [
      { name: 'Color', options: ['Black', 'Silver', 'Midnight Blue'] }
    ],
    reviews: [
      { id: 'rev-1', user: 'Sarah Connor', rating: 5, date: '2026-05-12', comment: 'Absolutely amazing noise reduction! Battery lasts forever.' },
      { id: 'rev-2', user: 'Marcus Wright', rating: 4, date: '2026-05-18', comment: 'Very comfortable, but standard audio cable could be longer.' }
    ]
  },
  {
    id: 'prod-2',
    name: 'Nike Air Max 270 React',
    description: 'The Nike Air Max 270 React blends a stylish profile with advanced dual cushion support for all-day streetwear comfort.',
    price: 150.00,
    discount: 10,
    category: 'Fashion & Apparel',
    brand: 'Nike',
    rating: 4.6,
    reviewsCount: 89,
    stockStatus: 'In Stock',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Outer Material': 'Synthetic Mesh',
      'Closure': 'Lace-Up',
      'Sole': 'React Foam Rubber'
    },
    vendorId: 'vendor-1',
    vendorName: 'TechNova Solutions',
    isApproved: true,
    reviews: [
      { id: 'rev-3', user: 'Danny G', rating: 5, date: '2026-06-01', comment: 'Feels like walking on clouds.' }
    ]
  },
  {
    id: 'prod-3',
    name: 'Apple iPhone 15 Pro Max',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
    price: 1199.00,
    discount: 5,
    category: 'Electronics',
    brand: 'Apple',
    rating: 4.9,
    reviewsCount: 312,
    stockStatus: 'In Stock',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Display': '6.7-inch Super Retina XDR OLED',
      'Processor': 'A17 Pro chip',
      'Camera': '48MP Main | Ultra Wide | Telephoto',
      'Storage': '256GB'
    },
    vendorId: 'vendor-2',
    vendorName: 'FruitCorp Store',
    isApproved: true,
    reviews: []
  },
  {
    id: 'prod-4',
    name: 'Ultralight Outdoor Camping Tent',
    description: 'Waterproof, wind-resistant double-layer backpacking tent designed for 2 people. Easy setup and lightweight poles.',
    price: 89.99,
    discount: 0,
    category: 'Sports & Outdoors',
    brand: 'Brands',
    rating: 4.4,
    reviewsCount: 42,
    stockStatus: 'In Stock',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Capacity': '2 Person',
      'Material': '210T Waterproof Polyester',
      'Weight': '2.1 kg'
    },
    vendorId: 'vendor-1',
    vendorName: 'TechNova Solutions',
    isApproved: true,
    reviews: []
  },
  {
    id: 'prod-5',
    name: 'Premium Ceramic Non-Stick Pan',
    description: 'Eco-friendly nonstick skillet with soft-touch handle. Free of PFAS, PFOA, lead, and cadmium.',
    price: 45.00,
    discount: 20,
    category: 'Home & Kitchen',
    brand: 'Samsung',
    rating: 4.5,
    reviewsCount: 61,
    stockStatus: 'Out of Stock',
    stock: 0,
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop'
    ],
    specs: {
      'Diameter': '10 inches',
      'Induction Ready': 'Yes',
      'Dishwasher Safe': 'Handwash recommended'
    },
    vendorId: 'vendor-3',
    vendorName: 'KitchenPro',
    isApproved: true,
    reviews: []
  }
];

const INITIAL_VENDORS = [
  { id: 'vendor-1', name: 'TechNova Solutions', email: 'vendor@gmail.com', status: 'Approved', joined: '2026-01-15', commissionRate: 10, walletBalance: 450.00, sales: 2400 },
  { id: 'vendor-2', name: 'FruitCorp Store', email: 'apple@vendor.com', status: 'Approved', joined: '2026-03-10', commissionRate: 8, walletBalance: 1200.00, sales: 12400 },
  { id: 'vendor-3', name: 'KitchenPro', email: 'kitchen@vendor.com', status: 'Pending Approval', joined: '2026-06-01', commissionRate: 12, walletBalance: 0, sales: 0 }
];

const INITIAL_ORDERS = [
  {
    id: 'ord-1001',
    customerId: 'customer-1',
    customerName: 'John Doe',
    date: '2026-06-10',
    total: 310.80,
    status: 'Delivered',
    paymentMethod: 'Credit Card',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '1234567890'
    },
    items: [
      {
        product: {
          id: 'prod-1',
          name: 'Sony WH-1000XM4 Wireless Headphones',
          price: 348.00,
          discount: 15,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop']
        },
        quantity: 1
      }
    ],
    timeline: [
      { status: 'Ordered', date: '2026-06-10 10:30 AM', done: true },
      { status: 'Processed', date: '2026-06-10 02:00 PM', done: true },
      { status: 'Shipped', date: '2026-06-11 09:00 AM', done: true },
      { status: 'Delivered', date: '2026-06-13 04:15 PM', done: true }
    ]
  },
  {
    id: 'ord-1002',
    customerId: 'customer-1',
    customerName: 'John Doe',
    date: '2026-06-15',
    total: 135.00,
    status: 'Processing',
    paymentMethod: 'UPI',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      phone: '1234567890'
    },
    items: [
      {
        product: {
          id: 'prod-2',
          name: 'Nike Air Max 270 React',
          price: 150.00,
          discount: 10,
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop']
        },
        quantity: 1
      }
    ],
    timeline: [
      { status: 'Ordered', date: '2026-06-15 11:15 AM', done: true },
      { status: 'Processed', date: '2026-06-15 03:00 PM', done: true },
      { status: 'Shipped', date: '', done: false },
      { status: 'Delivered', date: '', done: false }
    ]
  }
];

const INITIAL_SUPPORT_TICKETS = [
  { id: 'tkt-1', customerName: 'John Doe', subject: 'Refund delay on cancelled item', priority: 'High', status: 'Open', message: 'I requested a refund 3 days ago for order #1003 but have not received it.', date: '2026-06-14' },
  { id: 'tkt-2', customerName: 'Sarah Connor', subject: 'How to register as a bulk seller', priority: 'Medium', status: 'Closed', message: 'Do you offer lower commissions for high volume stores?', date: '2026-06-08' }
];

export const initDB = () => {
  if (!localStorage.getItem('db_categories')) {
    localStorage.setItem('db_categories', JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem('db_brands')) {
    localStorage.setItem('db_brands', JSON.stringify(INITIAL_BRANDS));
  }
  if (!localStorage.getItem('db_products')) {
    localStorage.setItem('db_products', JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem('db_vendors')) {
    localStorage.setItem('db_vendors', JSON.stringify(INITIAL_VENDORS));
  }
  if (!localStorage.getItem('db_orders')) {
    localStorage.setItem('db_orders', JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem('db_tickets')) {
    localStorage.setItem('db_tickets', JSON.stringify(INITIAL_SUPPORT_TICKETS));
  }
  if (!localStorage.getItem('db_coupons')) {
    localStorage.setItem('db_coupons', JSON.stringify([
      { code: 'SAVE10', discount: 10, type: 'percentage', expiry: '2026-12-31' },
      { code: 'WELCOME20', discount: 20, type: 'flat', expiry: '2026-12-31' }
    ]));
  }
};

// Seed db immediately on import
initDB();

export const getDBTable = (table) => {
  initDB();
  return JSON.parse(localStorage.getItem(`db_${table}`));
};

export const setDBTable = (table, data) => {
  localStorage.setItem(`db_${table}`, JSON.stringify(data));
};
