"use client";

import styles from "@/styles/dashboard/posts.module.css";
import { mapApplicationStatus } from "@/utils/enumMapper";

export default function RequestListCard({ request, onAccept, onReject, role, isSent = false }) {
  const id = request.id || request.needApplicationId || request.offerApplicationId;
  const orgName = isSent 
    ? (request.organizationName || request.charityName || request.donorOrganizationName)
    : (request.applicantName || request.charityName || request.donorOrganizationName || request.organizationName);
  
  const date = request.createdAt ? new Date(request.createdAt).toLocaleDateString("ar-EG") : "";
  const phone = request.contactPhone || request.phone;
  const email = request.email || request.contactEmail;
  const location = request.city && request.governorate ? `${request.governorate} - ${request.city}` : (request.city || request.governorate || "غير متوفر");
  const logo = request.productImage || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80";
  
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
