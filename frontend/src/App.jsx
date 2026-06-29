import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import VendorLayout from './layouts/VendorLayout';
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Public Pages
import Home from './pages/public/Home';
import Shop from './pages/public/Shop';
import ProductDetails from './pages/public/ProductDetails';
import CategoriesBrands from './pages/public/CategoriesBrands';
import AuthPages from './pages/public/AuthPages';
import StaticPages from './pages/public/StaticPages';
import Deals from './pages/public/Deals';

// Customer Pages
import {
  CustomerDashboard,
  CustomerProfile,
  CustomerOrders,
  CustomerAddresses,
  CustomerWishlist,
  CustomerCart,
  CustomerCheckout,
  CustomerPayment,
  CustomerOrderSuccess,
  CustomerOrderDetails
} from './pages/customer/CustomerPortal';

// Vendor Pages
import {
  VendorDashboard,
  VendorStoreProfile,
  VendorProducts,
  VendorInventory,
  VendorOrders,
  VendorCoupons,
  VendorWallet,
  VendorReviews
} from './pages/vendor/VendorPortal';

// Admin Pages
import {
  AdminDashboard,
  AdminAnalytics,
  AdminVendors,
  AdminCustomers,
  AdminProducts,
  AdminCatalog,
  AdminOrders,
  AdminWithdrawals,
  AdminTickets,
  AdminSettings
} from './pages/admin/AdminPortal';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="product/:id" element={<ProductDetails />} />
                  <Route path="categories" element={<CategoriesBrands />} />
                  <Route path="brands" element={<CategoriesBrands />} />
                  <Route path="deals" element={<Deals />} />
                  <Route path="cart" element={<CustomerCart />} />
                  <Route path="checkout" element={<CustomerCheckout />} />
                  <Route path="payment" element={<CustomerPayment />} />
                  <Route path="order-success" element={<CustomerOrderSuccess />} />
                  <Route path="order-details/:id" element={<CustomerOrderDetails />} />
                  
                  {/* Static CMS Pages */}
                  <Route path="about" element={<StaticPages />} />
                  <Route path="contact" element={<StaticPages />} />
                  <Route path="faq" element={<StaticPages />} />
                  <Route path="privacy" element={<StaticPages />} />
                  <Route path="terms" element={<StaticPages />} />

                  {/* Auth Forms */}
                  <Route path="login" element={<AuthPages />} />
                  <Route path="register" element={<AuthPages />} />
                  <Route path="forgot-password" element={<AuthPages />} />
                  <Route path="reset-password" element={<AuthPages />} />
                </Route>

                {/* Customer Dashboard Portal */}
                <Route path="/customer" element={<CustomerLayout />}>
                  <Route index element={<CustomerDashboard />} />
                  <Route path="profile" element={<CustomerProfile />} />
                  <Route path="orders" element={<CustomerOrders />} />
                  <Route path="addresses" element={<CustomerAddresses />} />
                  <Route path="wishlist" element={<CustomerWishlist />} />
                  <Route path="order-details/:id" element={<CustomerOrderDetails />} />
                </Route>

                {/* Vendor Dashboard Portal */}
                <Route path="/vendor" element={<VendorLayout />}>
                  <Route index element={<VendorDashboard />} />
                  <Route path="store-profile" element={<VendorStoreProfile />} />
                  <Route path="products" element={<VendorProducts />} />
                  <Route path="inventory" element={<VendorInventory />} />
                  <Route path="orders" element={<VendorOrders />} />
                  <Route path="coupons" element={<VendorCoupons />} />
                  <Route path="analytics" element={<VendorDashboard />} /> {/* Analytics view */}
                  <Route path="wallet" element={<VendorWallet />} />
                  <Route path="reviews" element={<VendorReviews />} />
                </Route>

                {/* Super Admin Dashboard Portal */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="vendors" element={<AdminVendors />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="catalog" element={<AdminCatalog />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="withdrawals" element={<AdminWithdrawals />} />
                  <Route path="tickets" element={<AdminTickets />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Wildcard Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
