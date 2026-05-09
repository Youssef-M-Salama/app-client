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

// ── Offer Card (Dashboard Style) ───────────────────────────────
function OfferCard({ offer, onApprove, onReject }) {
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
          <span>الموقع: {location}</span>
          <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>تاريخ الانتهاء: {expiryDate}</span>

          {/* Contact info directly in card */}
          <span>البريد: {offer.email || "غير متوفر"}</span>
          <span>هاتف: <span style={{ direction: 'ltr', display: 'inline-block' }}>{offer.phone || "غير متوفر"}</span></span>
          {offer.whatsapp && (
            <span>واتساب: <span style={{ direction: 'ltr', display: 'inline-block' }}>{offer.whatsapp}</span></span>
          )}
        </div>

        {offer.description && (
          <p className={styles.cardDesc} style={{ marginBottom: '4px', webkitLineClamp: 'unset', display: 'block' }}>
            <strong>وصف المنتج:</strong> {offer.description}
          </p>
        )}

        {offer.donorOraganizationDesctption && (
          <p className={styles.cardDesc} style={{ webkitLineClamp: 'unset', display: 'block' }}>
            <strong>عن المؤسسة:</strong> {offer.donorOraganizationDesctption}
          </p>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '10px' }}>
          <button
            className={styles.publishBtn}
            style={{ background: '#27ae60', flex: 1, margin: 0 }}
            onClick={() => onApprove(id)}
          >
            قبول
          </button>
          <button
            className={styles.publishBtn}
            style={{ background: '#c0392b', flex: 1, margin: 0 }}
            onClick={() => onReject(id)}
          >
            رفض
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
