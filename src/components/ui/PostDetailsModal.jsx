"use client";

import { useEffect } from "react";
import styles from "@/styles/dashboard/browse.module.css";
import globalPostsStyles from "@/styles/dashboard/posts.module.css";
import { mapCategory, mapStatus, mapPriority, mapUnit } from "@/utils/enumMapper";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

export default function PostDetailsModal({ isOpen, onClose, post, role }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !post) return null;

  const isOffer = role === "DonorOrganization";
  const title = post.productName || post.title;
  const categoryStr = mapCategory(post.category);
  const statusStr = mapStatus(post.status, isOffer);
  const imageUrl = post.productImage || FALLBACK_IMAGE;

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'var(--color-status-pending)';
      case 1: return 'var(--color-status-approved)';
      case 2: return 'var(--color-status-rejected)';
      case 3: return 'var(--color-status-fulfilled)';
      case 4: return 'var(--color-status-expired)';
      default: return '#333';
    }
  };

  return (
    <div className={globalPostsStyles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

        <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">
          ✕
        </button>

        <h2 className={styles.modalTitle} style={{ wordWrap: "break-word", whiteSpace: "normal", overflowWrap: "break-word" }}>
          تفاصيل المنشور
        </h2>

        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", background: "#fdfdfd", borderRadius: "12px", border: "1px solid #eee", padding: "10px" }}>
          <img src={imageUrl} alt={title} style={{ maxWidth: "100%", maxHeight: "250px", objectFit: "contain", borderRadius: "8px" }} />
        </div>

        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "12px", marginBottom: "24px", border: "1px solid #eee", textAlign: "right" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ color: "#777", fontWeight: "500", flexShrink: 0 }}>العنوان:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "15px", wordWrap: "break-word", whiteSpace: "normal", overflowWrap: "break-word", textAlign: "left" }}>{title}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500" }}>الفئة:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>{categoryStr}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500" }}>الحالة:</span>
              <span style={{ fontWeight: "600", color: getStatusColor(post.status), fontSize: "15px" }}>{statusStr}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500" }}>الكمية:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>{post.quantity?.toLocaleString("ar-EG")} {mapUnit(post.unit)}</span>
            </div>
            {!isOffer && post.priority !== undefined && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#777", fontWeight: "500" }}>الأولوية:</span>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>{mapPriority(post.priority)}</span>
              </div>
            )}
            {isOffer && post.expiryDate && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#777", fontWeight: "500" }}>تاريخ الانتهاء:</span>
                <span style={{ fontWeight: "600", color: "#d32f2f", fontSize: "15px" }}>{new Date(post.expiryDate).toLocaleDateString("ar-EG")}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500" }}>تاريخ النشر:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString("ar-EG") : "غير متوفر"}
              </span>
            </div>
          </div>

          {post.description && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
              <span style={{ color: "#777", fontWeight: "500", display: "block", marginBottom: "8px" }}>التفاصيل:</span>
              <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.7", margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word", overflowWrap: "break-word" }}>
                {post.description}
              </p>
            </div>
          )}
        </div>

        <button
          className={globalPostsStyles.cancelBtn}
          style={{ width: "100%", padding: "12px", fontWeight: "bold", background: "#f0f0f0", border: "none", borderRadius: "8px", cursor: "pointer" }}
          onClick={onClose}
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}
