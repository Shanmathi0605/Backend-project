import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiSend, FiChevronDown } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';

export const StaticPages = () => {
  const location = useLocation();
  const { addToast } = useToast();
  const isAbout = location.pathname === '/about';
  const isContact = location.pathname === '/contact';
  const isFaq = location.pathname === '/faq';
  const isPrivacy = location.pathname === '/privacy';
  const isTerms = location.pathname === '/terms';

  // Contact Form States
  const [cName, setCName] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cSubject, setCSubject] = useState('');
  const [cMsg, setCMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // FAQ Accordion States
  const [faqOpen, setFaqOpen] = useState({});

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!cName.trim() || !cEmail.trim() || !cMsg.trim()) {
      addToast('Please fill out all required contact fields', 'warning');
      return;
    }
    setSubmitting(true);
    // Mock API
    await new Promise(resolve => setTimeout(resolve, 800));
    addToast('Your inquiry has been sent! We will reply within 24 hours.', 'success');
    setCName('');
    setCEmail('');
    setCSubject('');
    setCMsg('');
    setSubmitting(false);
  };

  const faqs = [
    { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. Shipping is free for orders exceeding $150!' },
    { q: 'What is the return policy?', a: 'We offer a 30-day return window on all unused items. Simply initiate a return request from your customer dashboard portal.' },
    { q: 'How do I register as a seller?', a: 'Go to our Register page, select the "Store Vendor / Seller" role, provide your store details, and submit! Once approved by our administrators, you will gain listing privileges.' },
    { q: 'Is payment security guaranteed?', a: 'Yes! NovaCart uses fully encrypted Stripe/PayPal token gateways, meaning we never store credit card numbers on our servers.' }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {isAbout && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '40px', fontWeight: '800' }}>About NovaCart</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginTop: '12px' }}>The next generation multi-vendor e-commerce platform built for speed and security.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', marginBottom: '16px' }}>Our Mission</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '15px' }}>
                At NovaCart, we strive to bridge the gap between premium niche manufacturers and global customers. We offer vendors a highly optimized store portal to manage inventories, control coupon deals, and withdraw earnings. Concurrently, customers get standard catalog filters, simplified checkouts, order trackers, and direct customer support.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop"
              alt="Workspace"
              style={{ width: '100%', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)' }}
            />
          </div>
        </section>
      )}

      {isContact && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '40px', fontWeight: '800' }}>Contact Customer Support</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginTop: '12px' }}>Have any inquiries or experiencing ordering issues? Let us know!</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '48px' }}>
            {/* Details Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <FiMail style={{ fontSize: '24px', color: 'var(--primary-color)' }} />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600' }}>Email Us</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>support@novacart.com</p>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <FiPhone style={{ fontSize: '24px', color: 'var(--primary-color)' }} />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600' }}>Call Center</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>+1 (800) 123-4567</p>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--border-radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <FiMapPin style={{ fontSize: '24px', color: 'var(--primary-color)' }} />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600' }}>Headquarters</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>100 Pine Street, San Francisco, CA</p>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <form onSubmit={handleContactSubmit} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--border-radius-lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Your Name *</label>
                  <input type="text" placeholder="Name" value={cName} onChange={(e) => setCName(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Email Address *</label>
                  <input type="email" placeholder="email@address.com" value={cEmail} onChange={(e) => setCEmail(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Subject</label>
                <input type="text" placeholder="Inquiry category" value={cSubject} onChange={(e) => setCSubject(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Message *</label>
                <textarea rows={5} placeholder="State your inquiry..." value={cMsg} onChange={(e) => setCMsg(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', fontSize: '14px' }} required />
              </div>
              <button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'start', backgroundColor: 'var(--primary-color)', color: 'var(--card-bg)', padding: '12px 24px', borderRadius: 'var(--border-radius-md)', fontWeight: '600' }}>
                <FiSend /> Send Message
              </button>
            </form>
          </div>
        </section>
      )}

      {isFaq && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '40px', fontWeight: '800' }}>Frequently Asked Questions</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginTop: '12px' }}>Find quick answers to common operations and shipping rules.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'left' }}
                >
                  <span>{faq.q}</span>
                  <FiChevronDown style={{ transform: faqOpen[idx] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform var(--transition-fast)' }} />
                </button>
                {faqOpen[idx] && (
                  <div style={{ padding: '0 24px 20px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {isPrivacy && (
        <section style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '36px', marginBottom: '24px' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Last Updated: June 17, 2026</p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            NovaCart is committed to protecting your personal data. This privacy policy explains how we collect, store, and utilize details when you access our multi-vendor catalog, complete transactions, or registers as store sellers.
          </p>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', margin: '24px 0 12px' }}>1. Data Collection</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            We gather basic parameters: name, email address, physical mailing addresses (billing/shipping), payment details handled securely via processors, and account role profiles.
          </p>
        </section>
      )}

      {isTerms && (
        <section style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '36px', marginBottom: '24px' }}>Terms & Conditions</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Last Updated: June 17, 2026</p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            By registering, purchasing items, or listing products on NovaCart, you represent compliance with our platform-wide terms of usage.
          </p>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', margin: '24px 0 12px' }}>1. Catalog Listings & Vendor Sales</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            All vendors must list accurate product specifications, stock numbers, and pricing levels. Platform-wide commissions will be deducted automatically from orders upon release.
          </p>
        </section>
      )}
    </div>
  );
};
export default StaticPages;
