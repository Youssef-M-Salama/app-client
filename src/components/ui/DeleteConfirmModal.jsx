"use client";

import { useEffect } from "react";
import styles from "@/styles/dashboard/posts.module.css";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, postTitle }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${styles.deleteModal}`} role="dialog" aria-modal="true">
        <span className={styles.deleteIcon}>🗑️</span>
        <p className={styles.deleteText}>حذف المنشور</p>
        <p className={styles.deleteSubText}>
          هل أنت متأكد من حذف &quot;{postTitle}&quot;؟<br />لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className={styles.deleteActions}>
          <button id="cancel-delete-btn" className={styles.cancelBtn} onClick={onClose}>
            إلغاء
          </button>
          <button id="confirm-delete-btn" className={styles.confirmDeleteBtn} onClick={onConfirm}>
            نعم، احذف
          </button>
        </div>
      </div>
    </div>
  );
}
