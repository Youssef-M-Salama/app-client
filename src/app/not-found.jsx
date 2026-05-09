"use client";

import React from 'react';
import Link from 'next/link';
import styles from '@/styles/not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <i className="fa-solid fa-map-location-dot"></i>
        </div>
        
        <h1 className={styles.errorCode}>404</h1>
        
        <h2 className={styles.title}>عذراً، الصفحة غير موجودة</h2>
        
        <p className={styles.message}>
          يبدو أنك سلكت طريقاً خاطئاً. الصفحة التي تبحث عنها قد تم نقلها، 
          أو ربما لم تكن موجودة من الأساس.
        </p>
        
        <Link href="/" className={styles.homeButton}>
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
