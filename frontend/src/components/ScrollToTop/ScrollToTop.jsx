import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import styles from './ScrollToTop.module.css';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Scroll to top automatically when the route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly when button is clicked
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <button
      className={`${styles.scrollBtn} ${isVisible ? styles.visible : ''}`}
      onClick={scrollToTop}
      title="Scroll to Top"
    >
      <FiArrowUp />
    </button>
  );
};

export default ScrollToTop;
