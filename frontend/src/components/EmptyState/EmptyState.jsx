import React from 'react';
import { FiInbox } from 'react-icons/fi';
import styles from './EmptyState.module.css';

export const EmptyState = ({
  title = 'No items found',
  description = 'There are no items matching your criteria or currently available in this list.',
  actionText,
  onAction,
  icon
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        {icon || <FiInbox />}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionText && onAction && (
        <button className={styles.actionBtn} onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
export default EmptyState;
