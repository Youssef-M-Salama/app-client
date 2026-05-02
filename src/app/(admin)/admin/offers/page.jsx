"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/admin/pending.module.css"; // Reuse pending styles for cards
import offersService from "@/services/offersService";
import apiClient from "@/services/apiClient";
import { mapCategory } from "@/utils/enumMapper";
import { useAlert } from "@/context/AlertContext";

// ── Helpers ─────────────────────────────────────────────────────
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = apiClient.defaults.baseURL;
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

// ── Offer Card ──────────────────────────────────────────────────
function OfferCard({ offer, onApprove, onReject }) {
  const rawImg = offer.productImage || offer.imageUrl || offer.image;
  const imageSrc = getImageUrl(rawImg) || FALLBACK_IMAGE;
  const orgName = offer.donorOrganizationName || offer.organizationName || "جهة غير معروفة";
  const productName = offer.productName || "منتج غير مسمى";
  const id = offer.offerId || offer.id;
  const expiryDate = offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString("ar-EG") : "غير محدد";

  return (
    <div className={styles.orgCard}>
      <img
        src={imageSrc}
        alt=""
        className={styles.cardImage}
        onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
      />
      <div className={styles.cardBody}>
        <h3 className={styles.orgName}>{productName}</h3>
        <p style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px' }}>
          {orgName}
        </p>
        
        <div className={styles.orgDetail}>
          <span className={styles.detailLabel}>الكمية:</span>
          <span className={styles.detailValue}>{offer.quantity} وحدة</span>
        </div>
        <div className={styles.orgDetail}>
          <span className={styles.detailLabel}>التصنيف:</span>
          <span className={styles.detailValue}>{mapCategory(offer.category)}</span>
        </div>
        <div className={styles.orgDetail}>
          <span className={styles.detailLabel}>تاريخ الانتهاء:</span>
          <span className={styles.detailValue}>{expiryDate}</span>
        </div>
        <div className={styles.orgDetail}>
          <span className={styles.detailLabel}>الموقع:</span>
          <span className={styles.detailValue}>{offer.governorate || "غير محدد"} - {offer.city || "غير محدد"}</span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button className={styles.btnReject} onClick={() => onReject(id)}>رفض</button>
        <button className={styles.btnApprove} onClick={() => onApprove(id)}>قبول</button>
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
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>العروض المعلقة</h1>
        <p>إدارة جميع عروض الجهات المانحة المعلقة وقبولها أو رفضها</p>
      </div>

      <div className={styles.actionBar}>
        <div className={styles.actionBarLeft}>
        </div>
        <div className={styles.actionBarRight}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              type="text"
              className={styles.searchInput}
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
          <button onClick={fetchData} className={styles.btnOutline} style={{ marginTop: "10px" }}>إعادة المحاولة</button>
        </div>
      ) : filtered.length === 0 ? (
        <p className={styles.emptyState}>لا توجد عروض معلقة</p>
      ) : (
        <div className={styles.cardGrid}>
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
