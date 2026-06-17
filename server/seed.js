import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Models
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Brand from './models/Brand.js';
import Coupon from './models/Coupon.js';
import Order from './models/Order.js';
import SupportTicket from './models/SupportTicket.js';

// Load Env
dotenv.config();

const categories = [
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=300&auto=format&fit=crop' },
  { name: 'Fashion & Apparel', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=300&auto=format&fit=crop' },
  { name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=300&auto=format&fit=crop' },
  { name: 'Sports & Outdoors', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=300&auto=format&fit=crop' },
  { name: 'Beauty & Cosmetics', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=300&auto=format&fit=crop' }
];

const brands = [
  { name: 'Sony', image: 'https://images.unsplash.com/photo-1612810806563-4cb1a99a2037?q=80&w=200&auto=format&fit=crop' },
  { name: 'Nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop' },
  { name: 'Apple', image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=200&auto=format&fit=crop' },
  { name: 'Samsung', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=200&auto=format&fit=crop' },
  { name: 'Adidas', image: 'https://images.unsplash.com/photo-1518002171953-a080ee81be44?q=80&w=200&auto=format&fit=crop' }
];

const coupons = [
  { code: 'SAVE10', discount: 10, type: 'percentage', expiry: '2026-12-31' },
  { code: 'WELCOME20', discount: 20, type: 'flat', expiry: '2026-12-31' }
];

const seedData = async () => {
  try {
    await connectDB();

    // Drop collections to clear legacy indices and data
    const collections = ['users', 'products', 'categories', 'brands', 'coupons', 'orders', 'supporttickets'];
    for (const colName of collections) {
      try {
        await mongoose.connection.db.dropCollection(colName);
        console.log(`Collection ${colName} dropped.`);
      } catch (err) {
        // Ignore if collection does not exist
      }
    }

    console.log('Database cleared.');

    // Seed Categories
    await Category.insertMany(categories);
    console.log('Categories seeded.');

    // Seed Brands
    await Brand.insertMany(brands);
    console.log('Brands seeded.');

    // Seed Coupons
    await Coupon.insertMany(coupons);
    console.log('Coupons seeded.');

    // Seed Test Accounts (Pre-hashed passwords triggered by save hooks)
    const customer = await User.create({
      name: 'John Doe',
      email: 'customer@test.com',
      password: 'password123',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
    });

    const vendor = await User.create({
      name: 'TechNova Solutions',
      email: 'vendor@test.com',
      password: 'password123',
      role: 'vendor',
      storeName: 'TechNova Solutions',
      storeDescription: 'Premium technology gadgets and noise cancelling audio setups.',
      storeLogo: 'https://images.unsplash.com/photo-1612810806563-4cb1a99a2037?q=80&w=200&auto=format&fit=crop',
      walletBalance: 450.00,
      sales: 2400
    });

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'
    });

    console.log('Test role accounts seeded.');

    // Seed Products
    const products = [
      {
        name: 'Sony WH-1000XM4 Wireless Headphones',
        description: 'Industry-leading noise canceling wireless over-ear headphones with focal sound optimization and smart listening technology.',
        price: 348.00,
        discount: 15,
        category: 'Electronics',
        brand: 'Sony',
        rating: 4.8,
        reviewsCount: 2,
        stock: 45,
        stockStatus: 'In Stock',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=600&auto=format&fit=crop'
        ],
        specs: {
          'Battery Life': 'Up to 30 hours',
          'Noise Cancelling': 'Dual Noise Sensor technology',
          'Weight': '254 grams'
        },
        vendorId: vendor._id,
        vendorName: vendor.storeName,
        reviews: [
          { user: 'Sarah Connor', rating: 5, comment: 'Absolutely amazing noise reduction! Battery lasts forever.' },
          { user: 'Marcus Wright', rating: 4, comment: 'Very comfortable, but standard audio cable could be longer.' }
        ]
      },
      {
        name: 'Nike Air Max 270 React',
        description: 'The Nike Air Max 270 React blends a stylish profile with advanced dual cushion support for all-day streetwear comfort.',
        price: 150.00,
        discount: 10,
        category: 'Fashion & Apparel',
        brand: 'Nike',
        rating: 4.6,
        reviewsCount: 1,
        stock: 22,
        stockStatus: 'In Stock',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop'
        ],
        specs: {
          'Outer Material': 'Synthetic Mesh',
          'Closure': 'Lace-Up',
          'Sole': 'React Foam Rubber'
        },
        vendorId: vendor._id,
        vendorName: vendor.storeName,
        reviews: [
          { user: 'Danny G', rating: 5, comment: 'Feels like walking on clouds.' }
        ]
      },
      {
        name: 'Apple iPhone 15 Pro Max',
        description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
        price: 1199.00,
        discount: 5,
        category: 'Electronics',
        brand: 'Apple',
        rating: 5.0,
        reviewsCount: 0,
        stock: 15,
        stockStatus: 'In Stock',
        images: [
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop'
        ],
        specs: {
          'Display': '6.7-inch Super Retina XDR OLED',
          'Processor': 'A17 Pro chip',
          'Storage': '256GB'
        },
        vendorId: vendor._id,
        vendorName: vendor.storeName,
        reviews: []
      }
    ];

    await Product.insertMany(products);
    console.log('Catalog products seeded.');

    // Seed Ticket
    await SupportTicket.create({
      customerName: 'John Doe',
      subject: 'Refund delay on cancelled item',
      priority: 'High',
      message: 'I requested a refund 3 days ago for order #1003 but have not received it yet.',
      status: 'Open'
    });
    console.log('Tickets seeded.');

    console.log('Database Seeding Completed Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
