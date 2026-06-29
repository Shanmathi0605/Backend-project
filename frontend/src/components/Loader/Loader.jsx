import React from 'react';
import styles from './Loader.module.css';

export const Loader = ({ text = 'Loading data...' }) => {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p className={styles.text}>{text}</p>
    </div>
  );
};
export default Loader;
