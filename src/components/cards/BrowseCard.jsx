"use client";

import styles from "@/styles/dashboard/posts.module.css";
import { mapCategory, mapPriority, mapUnit } from "@/utils/enumMapper";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

export default function BrowseCard({ item, onApply }) {
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
          <span>الكمية: {item.quantity || 1} {mapUnit(item.unit)}</span>
          <span>الموقع: {location}</span>
          <span>البريد: {email}</span>
          <span>هاتف: <span style={{ direction: 'ltr', display: 'inline-block' }}>{phone}</span></span>
          {whatsapp && (
            <span>
              <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', marginLeft: '4px' }}></i>
              واتساب:{" "}
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ direction: 'ltr', display: 'inline-block', color: '#25D366', fontWeight: '600', textDecoration: 'none' }}
              >
                {whatsapp}
              </a>
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
