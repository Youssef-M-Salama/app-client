"use client";

import { useEffect } from "react";
import styles from "@/styles/dashboard/requests.module.css";
import globalPostsStyles from "@/styles/dashboard/posts.module.css";

export default function RequestActionModal({ isOpen, onClose, onConfirm, itemData, actionType, error, isSubmitting }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !itemData) return null;

  const isAccept = actionType === "accept";
  const orgName = itemData.charityName || itemData.donorOrganizationName || itemData.applicantName || itemData.organizationName || itemData.title || "المؤسسة";
  const productName = itemData.productName || itemData.offerTitle || itemData.charityNeedTitle || "طلب غير معروف";
  
  const icon = isAccept ? "✓" : "✕";
  const title = isAccept ? "تأكيد القبول" : "تأكيد الرفض";
  const description = isAccept 
    ? `هل أنت متأكد من قبول الطلب المقدم من "${orgName}" بخصوص "${productName}"؟`
    : `هل أنت متأكد من رفض الطلب المقدم من "${orgName}" بخصوص "${productName}"؟`;
  const confirmText = isAccept ? (isSubmitting ? "جاري القبول..." : "نعم، قبول") : (isSubmitting ? "جاري الرفض..." : "نعم، رفض");
  const confirmClass = isAccept ? styles.accept : styles.reject;

  return (
    <div className={globalPostsStyles.overlay} onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        
        <div className={`${styles.modalIcon} ${confirmClass}`}>
          {icon}
        </div>

        <h2 className={styles.modalTitle}>{title}</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}
        <p className={styles.modalDesc}>{description}</p>

        <div className={styles.modalActions}>
          <button 
            className={styles.modalCancelBtn} 
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </button>
          <button 
            className={`${styles.modalConfirmBtn} ${confirmClass}`}
            onClick={() => onConfirm(itemData, actionType)}
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
