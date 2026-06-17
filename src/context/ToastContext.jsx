import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import styles from './Toast.module.css';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className={styles.icon} />;
      case 'error':
        return <FiAlertCircle className={styles.icon} />;
      case 'warning':
        return <FiAlertCircle className={styles.icon} />;
      case 'info':
      default:
        return <FiInfo className={styles.icon} />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className={styles.container}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]}`}
            style={{ '--duration': `${toast.duration}ms` }}
          >
            {getIcon(toast.type)}
            <div className={styles.content}>
              <p className={styles.message}>{toast.message}</p>
            </div>
            <button className={styles.closeBtn} onClick={() => removeToast(toast.id)}>
              <FiX />
            </button>
            <div className={styles.progressBar} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
