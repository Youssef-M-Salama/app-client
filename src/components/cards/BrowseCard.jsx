"use client";

import styles from "@/styles/dashboard/browse.module.css";

export default function BrowseCard({ item, onApply }) {
  // item: { id, logo, title, description, phone, priority, type }
  // priority can be "high" (قصوى) or "medium" (ضرورية)

  const priorityClass = item.priority === "high" ? styles.priorityHigh : styles.priorityMedium;
  const priorityText = item.priority === "high" ? "قصوى" : "ضرورية";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        {/* Placeholder for logo if we don't have one */}
        {item.logo ? (
          <img src={item.logo} alt={item.title} className={styles.cardLogo} />
        ) : (
          <div style={{ fontSize: '40px', color: '#ccc' }}>🏢</div>
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        
        <p className={styles.cardDesc}>
          {item.description}
        </p>
        
        <p className={styles.cardContact}>
          رقم التواصل {item.phone}
        </p>

        <button className={styles.readMoreBtn}>عرض المزيد من التفاصيل</button>

        <div className={styles.cardFooter}>
          <div className={`${styles.priorityTag} ${priorityClass}`}>
            {priorityText}
          </div>
          <button 
            className={styles.applyBtn}
            onClick={() => onApply(item)}
          >
            الحصول على الطلب
          </button>
        </div>
      </div>
    </div>
  );
}
