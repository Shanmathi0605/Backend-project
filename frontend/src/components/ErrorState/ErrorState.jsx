import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import styles from './ErrorState.module.css';

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'An error occurred while fetching the requested content. Please check your network connection and try again.',
  actionText = 'Retry Request',
  onAction
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <FiAlertTriangle />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {onAction && (
        <button className={styles.actionBtn} onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
export default ErrorState;
