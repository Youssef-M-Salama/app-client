import React from 'react';
import styles from '@/styles/profile/ProfileBanner.module.css';

export default function ProfileBanner({ imageUrl, onEdit, onDelete }) {
  return (
    <div className={styles.bannerContainer}>
      <img src={imageUrl} alt="Profile banner" className={styles.bannerImage} />
      <div className={styles.imageActions}>
        <button className={styles.editBtn} onClick={onEdit}>تعديل الصورة</button>
        <button className={styles.deleteBtn} onClick={onDelete}>حذف الصورة</button>
      </div>
    </div>
  );
}
