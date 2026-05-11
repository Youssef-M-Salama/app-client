"use client";

import { useEffect } from "react";
import styles from "@/styles/dashboard/requests.module.css";
import globalPostsStyles from "@/styles/dashboard/posts.module.css";
import { mapUnit } from "@/utils/enumMapper";

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
  
  const icon = isAccept ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-xmark"></i>;
  const title = isAccept ? "تأكيد القبول" : "تأكيد الرفض";
  const description = isAccept 
    ? `هل أنت متأكد من قبول الطلب المقدم من "${orgName}" بخصوص "${productName}"؟`
    : `هل أنت متأكد من رفض الطلب المقدم من "${orgName}" بخصوص "${productName}"؟`;
  const confirmText = isAccept ? (isSubmitting ? "جاري القبول..." : "نعم، قبول") : (isSubmitting ? "جاري الرفض..." : "نعم، رفض");
  const confirmClass = isAccept ? styles.accept : styles.reject;

  const phone = itemData.contactPhone || itemData.phone;
  const whatsapp = itemData.whatsapp;
  const email = itemData.email || itemData.contactEmail;
  const location = itemData.city && itemData.governorate ? `${itemData.governorate} - ${itemData.city}` : (itemData.city || itemData.governorate || "غير متوفر");
  const quantity = itemData.quantity;
  const unitStr = itemData.unit !== undefined ? mapUnit(itemData.unit) : "";

  return (
    <div className={globalPostsStyles.overlay} onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        
        <div className={`${styles.modalIcon} ${confirmClass}`}>
          {icon}
        </div>

        <h2 className={styles.modalTitle}>{title}</h2>
        {error && <div style={{ color: '#d32f2f', marginBottom: '10px', fontSize: '14px', background: '#ffebee', padding: '8px', borderRadius: '4px', textAlign: 'center' }}><i className="fa-solid fa-triangle-exclamation" style={{ marginLeft: "8px" }}></i> {error}</div>}
        <p className={styles.modalDesc} style={{marginBottom: "16px"}}>{description}</p>

        <div style={{ background: "#f9f9f9", padding: "16px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #eee", textAlign: "right" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {quantity !== undefined && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#777", fontWeight: "500", fontSize: "14px" }}>الكمية:</span>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "14px" }}>{Number(quantity).toLocaleString("ar-EG")} {unitStr}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500", fontSize: "14px" }}>الموقع:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "14px" }}>{location}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500", fontSize: "14px" }}>رقم التواصل:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "14px", direction: "ltr" }}>{phone || "غير متوفر"}</span>
            </div>
            {whatsapp && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#777", fontWeight: "500", fontSize: "14px" }}>
                  <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', marginLeft: '4px' }}></i>
                  واتساب:
                </span>
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: '600', color: '#25D366', fontSize: '14px', direction: 'ltr', textDecoration: 'none' }}
                >
                  {whatsapp}
                </a>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500", fontSize: "14px" }}>البريد:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "14px" }}>{email || "غير متوفر"}</span>
            </div>
          </div>
          
          {(itemData.description || itemData.message) && (
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #eee" }}>
              <span style={{ color: "#777", fontWeight: "500", display: "block", marginBottom: "4px", fontSize: "14px" }}>رسالة مقدم الطلب:</span>
              <p style={{ color: "#555", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
                {itemData.description || itemData.message}
              </p>
            </div>
          )}
        </div>

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
