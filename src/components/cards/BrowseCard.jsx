"use client";

import styles from "@/styles/dashboard/posts.module.css";
import { mapCategory, mapPriority, mapUnit, mapStatus } from "@/utils/enumMapper";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

export default function BrowseCard({ item, onApply }) {
  const isOffer = item.offerId !== undefined || item.donorOrganizationName !== undefined;
  const statusStr = mapStatus(item.status, isOffer);

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

  // Map API item to display values
  const orgName = item.charityName || item.donorOrganizationName || item.organizationName || item.name;
  const productName = item.productName;
  const description = item.description || "";
  const phone = item.phone || item.contactPhone || "غير متوفر";
  const whatsapp = item.whatsapp;
  const email = item.email || item.contactEmail || "غير متوفر";
  const imageUrl = item.productImage || FALLBACK_IMAGE;
  const location = item.city && item.governorate ? `${item.governorate} - ${item.city}` : (item.city || item.governorate || "غير متوفر");

  const categoryStr = item.category !== undefined ? mapCategory(item.category) : "";

  return (
    <div className={styles.card}>
      <div className={styles.cardImageWrapper}>
        <img src={imageUrl} alt={productName} />
        {categoryStr && <div className={styles.statusBadge} style={{ right: 'auto', left: '10px' }}>{categoryStr}</div>}
        {item.status !== 1 && (
          <div className={styles.statusBadge} style={{ backgroundColor: getStatusColor(item.status) }}>
            {statusStr}
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{productName}</h3>
        <p className={styles.cardCategory}>{orgName}</p>

        <div className={styles.cardDetails}>
          <span>الكمية: {(item.quantity || 1).toLocaleString("ar-EG")} {mapUnit(item.unit)}</span>
          {!isOffer && item.priority !== undefined && (
            <span className={styles[`priority${item.priority}`]}>
              الأولوية: {mapPriority(item.priority)}
            </span>
          )}
        </div>

        <p className={styles.cardDesc}>{description}</p>

        <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
          <button
            className={styles.publishBtn}
            onClick={() => onApply(item)}
          >
            الحصول على الطلب
          </button>
        </div>
      </div>
    </div>
  );
}
