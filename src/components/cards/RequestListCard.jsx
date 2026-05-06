"use client";

import styles from "@/styles/dashboard/posts.module.css";
import { mapApplicationStatus, mapUnit } from "@/utils/enumMapper";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

export default function RequestListCard({ request, onAccept, onReject, role, isSent = false }) {
  const id = request.id || request.needApplicationId || request.offerApplicationId;
  const orgName = isSent 
    ? (request.organizationName || request.charityName || request.donorOrganizationName)
    : (request.applicantName || request.charityName || request.donorOrganizationName || request.organizationName);
  
  const date = request.createdAt ? new Date(request.createdAt).toLocaleDateString("ar-EG") : "";
  const phone = request.contactPhone || request.phone;
  const email = request.email || request.contactEmail;
  const location = request.city && request.governorate ? `${request.governorate} - ${request.city}` : (request.city || request.governorate || "غير متوفر");
  const logo = request.productImage || FALLBACK_IMAGE;
  
  const productName = request.productName;
  
  let typeLabel = "";
  if (isSent) {
    typeLabel = role === "Charity" ? "طلب على عرض:" : "طلب على احتياج:";
  } else {
    typeLabel = role === "Charity" ? "طلب على احتياجك:" : "طلب على عرضك:";
  }

  const statusStr = request.status !== undefined ? mapApplicationStatus(request.status) : "";
  const isPending = request.status === 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardImageWrapper}>
        <img src={logo} alt={orgName} />
        {statusStr && (
          <div className={styles.statusBadge} style={{ backgroundColor: isPending ? '#e67e22' : (request.status === 1 ? '#27ae60' : '#c0392b') }}>
            {statusStr}
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{productName}</h3>
        <p className={styles.cardCategory}>{typeLabel} {orgName}</p>

        <div className={styles.cardDetails}>
          {request.quantity !== undefined && (
            <span>الكمية: {request.quantity} {mapUnit(request.unit)}</span>
          )}
          <span>الموقع: {location}</span>
          <span>البريد: {email}</span>
          <span>رقم التواصل: <span style={{ direction: 'ltr', display: 'inline-block' }}>{phone}</span></span>
        </div>

        <p className={styles.cardDesc}>{request.description || request.message}</p>
        <p className={styles.timestamp}>{date ? `تاريخ الطلب: ${date}` : ""}</p>
        
        {!isSent && isPending && (
          <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '10px' }}>
            <button 
              className={styles.publishBtn}
              onClick={() => onAccept(request)}
              style={{ background: '#27ae60', flex: 1, margin: 0 }}
            >
              قبول
            </button>
            <button 
              className={styles.publishBtn}
              onClick={() => onReject(request)}
              style={{ background: '#c0392b', flex: 1, margin: 0 }}
            >
              رفض
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
