"use client";

import styles from "@/styles/dashboard/requests.module.css";

export default function RequestListCard({ request, onAccept, onReject }) {
  // request: { id, logo, title, date, description, phone, location, typeLabel }

  return (
    <div className={styles.card}>
      <span className={styles.cardDate}>{request.date}</span>

      <div className={styles.cardHeader}>
        <div className={styles.logoWrapper}>
          {request.logo ? (
            <img src={request.logo} alt={request.title} className={styles.logoImg} />
          ) : (
            <span style={{ fontSize: '24px', color: '#ccc' }}>🏢</span>
          )}
        </div>
        <h3 className={styles.cardTitle}>{request.title}</h3>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.contentLabel}>{request.typeLabel}</div>
        <p className={styles.contentDesc}>{request.description}</p>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.infoGroup}>
          <span className={styles.infoItem}>رقم التواصل {request.phone}</span>
          <span className={styles.infoItem}>الموقع: {request.location}</span>
        </div>

        <div className={styles.actionButtons}>
          <button 
            className={styles.btnAccept}
            onClick={() => onAccept(request)}
          >
            قبول
          </button>
          <button 
            className={styles.btnReject}
            onClick={() => onReject(request)}
          >
            رفض
          </button>
        </div>
      </div>
    </div>
  );
}
