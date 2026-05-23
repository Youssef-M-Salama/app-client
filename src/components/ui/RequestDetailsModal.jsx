"use client";

import { useEffect } from "react";
import styles from "@/styles/dashboard/browse.module.css";
import globalPostsStyles from "@/styles/dashboard/posts.module.css";
import { mapApplicationStatus, mapUnit } from "@/utils/enumMapper";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

export default function RequestDetailsModal({ isOpen, onClose, request, role, isSent = false }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !request) return null;

  const orgName = isSent
    ? (request.organizationName || request.charityName || request.donorOrganizationName)
    : (request.applicantName || request.charityName || request.donorOrganizationName || request.organizationName);

  const date = request.createdAt ? new Date(request.createdAt).toLocaleDateString("ar-EG") : "";
  const phone = request.contactPhone || request.phone;
  const whatsapp = request.whatsapp;
  const email = request.email || request.contactEmail;
  const location = request.city && request.governorate ? `${request.governorate} - ${request.city}` : (request.city || request.governorate || "غير متوفر");
  const logo = request.productImage || FALLBACK_IMAGE;

  const productName = request.productName;
  const parentDescription = request.needDescription || request.offerDescription;

  let typeLabel = "";
  if (isSent) {
    typeLabel = role === "Charity" ? "جهة العرض:" : "جهة الاحتياج:";
  } else {
    typeLabel = role === "Charity" ? "مقدم الطلب:" : "مقدم الطلب:";
  }

  const currentStatus = request.status !== undefined ? request.status : request.Status;
  const parentStatus = request.needStatus !== undefined ? request.needStatus : request.offerStatus;
  
  const isFulfilled = parentStatus === 3;
  
  const statusStr = isFulfilled 
    ? "مكتمل" 
    : (currentStatus !== undefined ? mapApplicationStatus(currentStatus) : "");

  const getStatusColor = (status, fulfilled = false) => {
    if (fulfilled) return 'var(--color-status-fulfilled)';
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
          تفاصيل الطلب
        </h2>

        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", background: "#fdfdfd", borderRadius: "12px", border: "1px solid #eee", padding: "10px" }}>
          <img src={logo} alt={productName} style={{ maxWidth: "100%", maxHeight: "250px", objectFit: "contain", borderRadius: "8px" }} />
        </div>

        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "12px", marginBottom: "24px", border: "1px solid #eee", textAlign: "right" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ color: "#777", fontWeight: "500", flexShrink: 0 }}>اسم المنتج:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "15px", wordWrap: "break-word", whiteSpace: "normal", overflowWrap: "break-word", textAlign: "left" }}>{productName}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500" }}>{typeLabel}</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>{orgName}</span>
            </div>
            {request.quantity !== undefined && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#777", fontWeight: "500" }}>الكمية المطلوبة:</span>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>{Number(request.quantity).toLocaleString("ar-EG")} {mapUnit(request.unit)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500" }}>حالة الطلب:</span>
              <span style={{ fontWeight: "600", color: getStatusColor(currentStatus, isFulfilled), fontSize: "15px" }}>{statusStr}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#777", fontWeight: "500" }}>تاريخ الطلب:</span>
              <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>
                {date || "غير متوفر"}
              </span>
            </div>
          </div>

          <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
            <h4 style={{ color: "#333", marginBottom: "12px", fontSize: "16px" }}>بيانات التواصل</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#777", fontWeight: "500" }}>الهاتف:</span>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "15px", direction: "ltr" }}>{phone || "غير متوفر"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#777", fontWeight: "500" }}>الواتساب:</span>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "15px", direction: "ltr" }}>{whatsapp || "غير متوفر"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#777", fontWeight: "500" }}>البريد الإلكتروني:</span>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>{email || "غير متوفر"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#777", fontWeight: "500" }}>العنوان:</span>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>{location}</span>
              </div>
            </div>
          </div>

          {(request.description || request.message) && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
              <span style={{ color: "#777", fontWeight: "500", display: "block", marginBottom: "8px" }}>رسالة الطلب:</span>
              <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.7", margin: 0, whiteSpace: "pre-wrap", wordWrap: "break-word", overflowWrap: "break-word" }}>
                {request.description || request.message}
              </p>
            </div>
          )}

          {parentDescription && (
             <div style={{ marginTop: '16px', padding: '10px 12px', background: '#f3f0fa', borderRadius: '8px', borderRight: '3px solid #6F2DBD' }}>
              <span style={{ fontSize: '13px', color: '#6F2DBD', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                {request.needDescription ? 'وصف الاحتياج الأساسي:' : 'وصف العرض الأساسي:'}
              </span>
              <p style={{ margin: 0, fontSize: '14px', color: '#444', lineHeight: '1.7', whiteSpace: "pre-wrap", wordWrap: "break-word", overflowWrap: "break-word" }}>{parentDescription}</p>
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
