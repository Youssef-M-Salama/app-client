"use client";

import { useState } from "react";
import { mapUnit } from "@/utils/enumMapper";
import styles from "@/styles/dashboard/transactions.module.css";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23f7f4ff'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E✓%3C/text%3E%3C/svg%3E";

export default function TransactionCard({ transaction, role }) {
  const [expanded, setExpanded] = useState(false);

  const {
    applicationId,
    sourceType,
    productName,
    quantity,
    unit,
    productImage,
    charityName,
    charityEmail,
    charityPhone,
    charityWhatsapp,
    charityGovernorate,
    charityCity,
    donorOrganizationName,
    donorEmail,
    donorPhone,
    donorWhatsapp,
    donorGovernorate,
    donorCity,
    createdAt,
    fulfillmentDate,
  } = transaction;

  const img = productImage || FALLBACK_IMAGE;
  const createdStr = createdAt
    ? new Date(createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
    : "—";
  const fulfilledStr = fulfillmentDate
    ? new Date(fulfillmentDate).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const isNeedApplication = sourceType === "NeedApplication";
  const sourceLabel = isNeedApplication ? "تبرع على احتياج" : "تبرع من خلال عرض";
  const sourceIcon = isNeedApplication ? "fa-hand-holding-heart" : "fa-gift";

  return (
    <div className={styles.card} id={`transaction-${applicationId}`}>
      {/* Top coloured strip */}
      <div className={styles.cardStrip} />

      <div className={styles.cardInner}>
        {/* Image */}
        <div className={styles.imgWrapper}>
          <img src={img} alt={productName} className={styles.img} />
          <span className={styles.sourceTag}>
            <i className={`fa-solid ${sourceIcon}`} />
            {sourceLabel}
          </span>
        </div>

        {/* Main info */}
        <div className={styles.body}>
          {/* Header row */}
          <div className={styles.headerRow}>
            <h3 className={styles.productName}>{productName}</h3>
            <span className={styles.fulfilledBadge}>
              <i className="fa-solid fa-circle-check" />
              مكتمل
            </span>
          </div>

          {/* Quantity */}
          <p className={styles.quantity}>
            <i className="fa-solid fa-boxes-stacked" />
            {Number(quantity).toLocaleString("ar-EG")} {mapUnit(unit)}
          </p>

          {/* Parties */}
          <div className={styles.parties}>
            <div className={styles.party}>
              <span className={styles.partyLabel}>
                <i className="fa-solid fa-building-ngo" />
                الجمعية
              </span>
              <span className={styles.partyName}>{charityName}</span>
              <span className={styles.partyLocation}>
                {charityGovernorate} — {charityCity}
              </span>
            </div>
            <div className={styles.divider} />
            <div className={styles.party}>
              <span className={styles.partyLabel}>
                <i className="fa-solid fa-handshake" />
                جهة التبرع
              </span>
              <span className={styles.partyName}>{donorOrganizationName}</span>
              <span className={styles.partyLocation}>
                {donorGovernorate} — {donorCity}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className={styles.dates}>
            <span>
              <i className="fa-regular fa-calendar" />
              تاريخ الطلب: <strong>{createdStr}</strong>
            </span>
            <span className={styles.fulfillDate}>
              <i className="fa-solid fa-flag-checkered" />
              تاريخ الاستلام: <strong>{fulfilledStr}</strong>
            </span>
          </div>

          {/* Toggle contact details */}
          <button
            className={styles.toggleBtn}
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
          >
            <i className={`fa-solid fa-chevron-${expanded ? "up" : "down"}`} />
            {expanded ? "إخفاء بيانات التواصل" : "عرض بيانات التواصل"}
          </button>

          {expanded && (
            <div className={styles.contactGrid}>
              {/* Charity contact */}
              <div className={styles.contactBlock}>
                <h4 className={styles.contactTitle}>
                  <i className="fa-solid fa-building-ngo" /> بيانات الجمعية
                </h4>
                <ContactRow icon="fa-envelope" label="البريد" value={charityEmail} />
                <ContactRow icon="fa-phone" label="الهاتف" value={charityPhone} ltr />
                <ContactRow icon="fa-brands fa-whatsapp" label="واتساب" value={charityWhatsapp} ltr />
              </div>
              {/* Donor contact */}
              <div className={styles.contactBlock}>
                <h4 className={styles.contactTitle}>
                  <i className="fa-solid fa-handshake" /> بيانات جهة التبرع
                </h4>
                <ContactRow icon="fa-envelope" label="البريد" value={donorEmail} />
                <ContactRow icon="fa-phone" label="الهاتف" value={donorPhone} ltr />
                <ContactRow icon="fa-brands fa-whatsapp" label="واتساب" value={donorWhatsapp} ltr />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value, ltr = false }) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "8px",
        padding: "6px 0",
        borderBottom: "1px solid #f0f0f0",
        fontSize: "13px",
      }}
    >
      <span style={{ color: "#777", display: "flex", alignItems: "center", gap: "5px" }}>
        <i className={`fa-solid ${icon}`} style={{ width: "14px" }} />
        {label}:
      </span>
      <span style={{ fontWeight: 600, color: "#333", direction: ltr ? "ltr" : "inherit" }}>{value}</span>
    </div>
  );
}
