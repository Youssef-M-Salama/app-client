"use client";

import { useEffect } from "react";
import styles from "@/styles/dashboard/requests.module.css";
import globalPostsStyles from "@/styles/dashboard/posts.module.css"; // Reuse the general modal overlay

export default function RequestActionModal({ isOpen, onClose, onConfirm, itemData, actionType }) {
  // actionType can be "accept" or "reject"
  
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !itemData) return null;

  const isAccept = actionType === "accept";
  
  const icon = isAccept ? "✓" : "✕";
  const title = isAccept ? "تأكيد القبول" : "تأكيد الرفض";
  const description = isAccept 
    ? `هل أنت متأكد من قبول الطلب المقدم من "${itemData.title}"؟`
    : `هل أنت متأكد من رفض الطلب المقدم من "${itemData.title}"؟`;
  const confirmText = isAccept ? "نعم، قبول" : "نعم، رفض";
  const confirmClass = isAccept ? styles.accept : styles.reject;

  return (
    <div className={globalPostsStyles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        
        <div className={`${styles.modalIcon} ${confirmClass}`}>
          {icon}
        </div>

        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalDesc}>{description}</p>

        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            إلغاء
          </button>
          <button 
            className={`${styles.modalConfirmBtn} ${confirmClass}`}
            onClick={() => {
              onConfirm(itemData, actionType);
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
