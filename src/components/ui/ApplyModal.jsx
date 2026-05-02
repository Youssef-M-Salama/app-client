"use client";

import { useEffect } from "react";
import styles from "@/styles/dashboard/browse.module.css";
import globalPostsStyles from "@/styles/dashboard/posts.module.css"; 
import { mapPriority } from "@/utils/enumMapper";

export default function ApplyModal({ isOpen, onClose, onApply, itemData, error, isSubmitting }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !itemData) return null;

  const orgName = itemData.charityName || itemData.donorOrganizationName || itemData.organizationName || itemData.name;
  const productName = itemData.productName;
  const priorityText = itemData.priority !== undefined ? mapPriority(itemData.priority) : "غير محدد";
  const location = itemData.city && itemData.governorate ? `${itemData.governorate} - ${itemData.city}` : (itemData.city || itemData.governorate || "غير متوفر");
  const phone = itemData.phone || itemData.contactPhone || "غير متوفر";
  const email = itemData.email || itemData.contactEmail || "غير متوفر";

  return (
    <div className={globalPostsStyles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" style={{maxHeight: '90vh', overflowY: 'auto'}}>
        
        <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق" disabled={isSubmitting}>
          ✕
        </button>

        <h2 className={styles.modalTitle}>تأكيد الطلب</h2>
        
        {error && <div style={{marginBottom: "15px", color: '#d32f2f', textAlign: 'center', fontWeight: '500', padding: '10px', background: '#ffebee', borderRadius: '4px'}}>{error}</div>}

        <p style={{ textAlign: "center", marginBottom: "24px", color: "#555", fontSize: "16px", lineHeight: "1.5" }}>
          هل أنت متأكد من رغبتك في التقديم على هذا الطلب المقدم من <strong>{orgName}</strong>؟
        </p>

        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "12px", marginBottom: "24px", border: "1px solid #eee" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500" }}>الطلب:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>{productName}</span>
            </div>
            {itemData.priority !== undefined && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#777", fontWeight: "500" }}>الأولوية:</span>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>{priorityText}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500" }}>الموقع:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>{location}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500" }}>رقم التواصل:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "15px", direction: "ltr" }}>{phone}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500" }}>البريد الإلكتروني:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>{email}</span>
            </div>
          </div>
          {itemData.description && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
              <span style={{ color: "#777", fontWeight: "500", display: "block", marginBottom: "8px" }}>التفاصيل:</span>
              <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                {itemData.description}
              </p>
            </div>
          )}
        </div>

        <button 
          className={globalPostsStyles.publishBtn}
          onClick={() => onApply(itemData)}
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting ? "جاري التأكيد..." : "تأكيد التقديم"}
        </button>

      </div>
    </div>
  );
}
