"use client";

import styles from "@/styles/dashboard/posts.module.css";
import { mapCategory, mapPriority } from "@/utils/enumMapper";

export default function BrowseCard({ item, onApply }) {
  // Map API item to display values
  const orgName = item.charityName || item.donorOrganizationName || item.organizationName || item.name;
  const productName = item.productName;
  const description = item.description || "";
  const phone = item.phone || item.contactPhone || "غير متوفر";
  const email = item.email || item.contactEmail || "غير متوفر";
  const imageUrl = item.productImage || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80";
  const location = item.city && item.governorate ? `${item.governorate} - ${item.city}` : (item.city || item.governorate || "غير متوفر");
  
  const categoryStr = item.category !== undefined ? mapCategory(item.category) : "";

  return (
    <div className={styles.card}>
      <div className={styles.cardImageWrapper}>
        <img src={imageUrl} alt={productName} />
        {categoryStr && <div className={styles.statusBadge}>{categoryStr}</div>}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{productName}</h3>
        <p className={styles.cardCategory}>{orgName}</p>
        
        <div className={styles.cardDetails}>
          {item.priority !== undefined && (
            <span className={styles[`priority${item.priority}`]}>
              الأولوية: {mapPriority(item.priority)}
            </span>
          )}
          <span>الكمية: {item.quantity || 1}</span>
          <span>الموقع: {location}</span>
          <span>البريد: {email}</span>
          <span>هاتف: <span style={{ direction: 'ltr', display: 'inline-block' }}>{phone}</span></span>
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
