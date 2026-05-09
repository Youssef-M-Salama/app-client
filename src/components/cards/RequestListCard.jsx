"use client";

import styles from "@/styles/dashboard/posts.module.css";
import { mapApplicationStatus, mapUnit } from "@/utils/enumMapper";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

export default function RequestListCard({ request, onAccept, onReject, onCancel, role, isSent = false }) {
  const id = request.id || request.needApplicationId || request.offerApplicationId;
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
  // Parent need/offer description (new API fields)
  const parentDescription = request.needDescription || request.offerDescription;

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
            <span>الكمية: {Number(request.quantity).toLocaleString("ar-EG")} {mapUnit(request.unit)}</span>
          )}
          <span>الموقع: {location}</span>
          <span>البريد: {email ? <a href={`mailto:${email}`} style={{ color: '#6F2DBD', textDecoration: 'none' }}>{email}</a> : "غير متوفر"}</span>
          <span>رقم التواصل: <span style={{ direction: 'ltr', display: 'inline-block' }}>{phone ? <a href={`tel:${phone}`} style={{ color: '#6F2DBD', textDecoration: 'none' }}>{phone}</a> : "غير متوفر"}</span></span>
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

        {/* Applicant message/description */}
        {(request.description || request.message) && (
          <p className={styles.cardDesc}>{request.description || request.message}</p>
        )}

        {/* Parent need/offer description (new field) */}
        {parentDescription && (
          <div style={{ marginTop: '8px', padding: '10px 12px', background: '#f3f0fa', borderRadius: '8px', borderRight: '3px solid #6F2DBD' }}>
            <span style={{ fontSize: '12px', color: '#6F2DBD', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
              {request.needDescription ? 'وصف الاحتياج:' : 'وصف العرض:'}
            </span>
            <p style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: '1.6' }}>{parentDescription}</p>
          </div>
        )}

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

        {isSent && isPending && (role === 'Charity' || role === 'DonorOrganization') && (
          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <button
              className={styles.publishBtn}
              onClick={() => onCancel(id)}
              style={{ background: '#c0392b', width: '100%', margin: 0 }}
            >
              إلغاء الطلب
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
