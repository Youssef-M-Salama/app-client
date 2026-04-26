"use client";

import { useEffect } from "react";
import styles from "@/styles/dashboard/browse.module.css";
import globalPostsStyles from "@/styles/dashboard/posts.module.css"; // Reuse the general modal overlay

export default function ApplyModal({ isOpen, onClose, onApply, itemData }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !itemData) return null;

  const priorityText = itemData.priority === "high" ? "قصوى" : "ضرورية";

  return (
    <div className={globalPostsStyles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        
        <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">
          ✕
        </button>

        <h2 className={styles.modalTitle}>الحصول على العرض</h2>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>اسم المؤسسة</label>
            <input 
              className={styles.formInput} 
              type="text" 
              value={itemData.title} 
              disabled 
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>أولوية الطلب</label>
            <input 
              className={styles.formInput} 
              type="text" 
              value={priorityText} 
              disabled 
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>رقم التواصل</label>
          <input 
            className={styles.formInput} 
            type="text" 
            value={itemData.phone} 
            disabled 
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>الموقع</label>
          <input 
            className={styles.formInput} 
            type="text" 
            value={itemData.location || "جاردن سيتي - القاهرة"} 
            disabled 
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>تفاصيل الطلب</label>
          <textarea 
            className={styles.formTextarea} 
            value={itemData.description} 
            disabled 
          />
        </div>

        <button 
          className={styles.submitApplyBtn}
          onClick={() => {
            onApply(itemData);
            onClose();
          }}
        >
          الحصول على العرض
        </button>

      </div>
    </div>
  );
}
