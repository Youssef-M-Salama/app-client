"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/dashboard/posts.module.css";
import pendingStyles from "@/styles/admin/pending.module.css";
import offersService from "@/services/offersService";
import apiClient from "@/services/apiClient";
import { mapCategory, mapUnit } from "@/utils/enumMapper";
import { useAlert } from "@/context/AlertContext";

// ── Helpers ─────────────────────────────────────────────────────
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = apiClient.defaults.baseURL;
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

// ── Row Action Detail Modal ─────────────────────────────────────
function OfferDetailModal({ offer, onClose, onApprove, onReject }) {
  if (!offer) return null;

  const rawImg = offer.productImage || offer.imageUrl || offer.image;
  const imageSrc = getImageUrl(rawImg) || FALLBACK_IMAGE;
  const orgName = offer.donorOrganizationName || offer.organizationName || "جهة غير معروفة";
  const productName = offer.productName || "منتج غير مسمى";
  const id = offer.offerId || offer.id;
  const expiryDate = offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString("ar-EG") : "غير محدد";
  const location = offer.city && offer.governorate ? `${offer.governorate} - ${offer.city}` : (offer.city || offer.governorate || "غير متوفر");

  return (
    <div className={pendingStyles.modalOverlay} onClick={onClose}>
      <div className={pendingStyles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className={pendingStyles.modalHeader}>
          <h3>تفاصيل العرض</h3>
          <button className={pendingStyles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={pendingStyles.modalBody}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
            <img 
              src={imageSrc} 
              alt={productName} 
              style={{ width: '150px', height: '150px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '12px' }} 
              onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
            />
            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--color-text-primary)' }}>{productName}</h4>
              <p style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '12px' }}>{orgName}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                <span><strong>التصنيف:</strong> {mapCategory(offer.category)}</span>
                <span><strong>الكمية:</strong> {offer.quantity.toLocaleString("ar-EG")} {mapUnit(offer.unit)}</span>
                <span><strong>الموقع:</strong> {location}</span>
                <span style={{ color: '#d32f2f' }}><strong>تاريخ الانتهاء:</strong> {expiryDate}</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>وصف المنتج</h5>
            <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {offer.description || "لا يوجد وصف متوفر"}
            </div>
          </div>

          <div>
            <h5 style={{ marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>معلومات التواصل</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-envelope" style={{ color: '#6366f1' }}></i>
                <a href={`mailto:${offer.email}`} className={pendingStyles.link} style={{ fontSize: '0.9rem' }}>{offer.email || "غير متوفر"}</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-phone" style={{ color: '#10b981' }}></i>
                <a href={`tel:${offer.phone}`} className={pendingStyles.link} style={{ fontSize: '0.9rem', direction: 'ltr' }}>{offer.phone || "غير متوفر"}</a>
              </div>
              {offer.whatsapp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }}></i>
                  <a 
                    href={`https://wa.me/${offer.whatsapp.replace('+', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={pendingStyles.link} 
                    style={{ fontSize: '0.9rem', direction: 'ltr' }}
                  >
                    {offer.whatsapp}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={pendingStyles.modalFooter} style={{ gap: '12px' }}>
          <button 
            className={pendingStyles.btnReject} 
            style={{ padding: '10px 24px', flex: 'none' }}
            onClick={() => { onReject(id); onClose(); }}
          >
            رفض العرض
          </button>
          <button 
            className={pendingStyles.btnApprove} 
            style={{ padding: '10px 24px', flex: 'none' }}
            onClick={() => { onApprove(id); onClose(); }}
          >
            الموافقة على العرض
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Offer Card (Dashboard Style) ───────────────────────────────
function OfferCard({ offer, onApprove, onReject, onView }) {
  const rawImg = offer.productImage || offer.imageUrl || offer.image;
  const imageSrc = getImageUrl(rawImg) || FALLBACK_IMAGE;
  const orgName = offer.donorOrganizationName || offer.organizationName || "جهة غير معروفة";
  const productName = offer.productName || "منتج غير مسمى";
  const id = offer.offerId || offer.id;
  const expiryDate = offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString("ar-EG") : "غير محدد";
  const location = offer.city && offer.governorate ? `${offer.governorate} - ${offer.city}` : (offer.city || offer.governorate || "غير متوفر");

  return (
    <div className={styles.card}>
      <div className={styles.cardImageWrapper}>
        <img src={imageSrc} alt={productName} onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)} />
        <div className={styles.statusBadge}>{mapCategory(offer.category)}</div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{productName}</h3>
        <p className={styles.cardCategory}>{orgName}</p>

        <div className={styles.cardDetails}>
          <span>الكمية: {offer.quantity.toLocaleString("ar-EG")} {mapUnit(offer.unit)}</span>
        </div>

        <p className={styles.cardDesc}>{offer.description || ""}</p>

        <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '10px' }}>
          <button
            className={styles.publishBtn}
            style={{ background: 'var(--color-primary)', flex: 1, margin: 0 }}
            onClick={() => onView(offer)}
          >
            عرض التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OffersPage() {
  const { showConfirm, showToast, showAlert } = useAlert();
  const [offers, setOffers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [viewingOffer, setViewingOffer] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await offersService.getPendingOffers({ Page: 1, PageSize: 50 });
      const payload = res.data || res.Data || [];
      const items = Array.isArray(payload) ? payload : (payload.items || payload.Items || payload.data || payload.Data || []);
      setOffers(items);
    } catch (error) {
      setErrorMsg(error.appMessage || "حدث خطأ أثناء جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = offers.filter(
    (o) => {
      const org = o.donorOrganizationName || o.organizationName || o.name || "";
      return org.includes(search) ||
        (o.productName || "").includes(search) ||
        (o.city || "").includes(search);
    }
  );

  async function handleApprove(id) {
    showConfirm(
      "الموافقة على العرض",
      "هل أنت متأكد من رغبتك في الموافقة على هذا العرض؟",
      async () => {
        try {
          await offersService.approveOffer(id);
          setOffers((prev) => prev.filter((o) => (o.offerId || o.id) !== id));
          showToast("تمت الموافقة على العرض بنجاح", "success");
        } catch (error) {
          showAlert("فشل الإجراء", error.appMessage || "تعذر التأكيد", "error");
        }
      }
    );
  }

  async function handleReject(id) {
    showConfirm(
      "رفض العرض",
      "هل أنت متأكد من رغبتك في رفض هذا العرض؟",
      async () => {
        try {
          await offersService.rejectOffer(id);
          setOffers((prev) => prev.filter((o) => (o.offerId || o.id) !== id));
          showToast("تم رفض العرض", "success");
        } catch (error) {
          showAlert("فشل الإجراء", error.appMessage || "تعذر الرفض", "error");
        }
      }
    );
  }

  return (
    <div className={pendingStyles.page}>
      <div className={pendingStyles.pageHeader}>
        <h1>العروض المعلقة</h1>
        <p>إدارة جميع العروض المعلقة وقبولها أو رفضها</p>
      </div>

      <div className={pendingStyles.actionBar}>
        <div className={pendingStyles.actionBarLeft}>
        </div>
        <div className={pendingStyles.actionBarRight}>
          <div className={pendingStyles.searchWrapper}>
            <span className={pendingStyles.searchIcon}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              className={pendingStyles.searchInput}
              placeholder="ابحث هنا..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>جاري التحميل...</p>
      ) : errorMsg ? (
        <div style={{ textAlign: "center", color: "red", padding: "20px" }}>
          {errorMsg}
          <br />
          <button onClick={fetchData} className={pendingStyles.btnOutline} style={{ marginTop: "10px" }}>إعادة المحاولة</button>
        </div>
      ) : filtered.length === 0 ? (
        <p className={pendingStyles.emptyState}>لا توجد عروض معلقة</p>
      ) : (
        <div className={pendingStyles.cardGrid}>
          {filtered.map((offer) => (
            <OfferCard
              key={offer.offerId || offer.id}
              offer={offer}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={setViewingOffer}
            />
          ))}
        </div>
      )}

      {viewingOffer && (
        <OfferDetailModal
          offer={viewingOffer}
          onClose={() => setViewingOffer(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
