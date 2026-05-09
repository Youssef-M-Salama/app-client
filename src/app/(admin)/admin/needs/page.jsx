"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/dashboard/posts.module.css";
import pendingStyles from "@/styles/admin/pending.module.css";
import charityNeedsService from "@/services/charityNeedsService";
import apiClient from "@/services/apiClient";
import { mapCategory, mapPriority, mapUnit } from "@/utils/enumMapper";
import { useAlert } from "@/context/AlertContext";

// ── Helpers ─────────────────────────────────────────────────────
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = apiClient.defaults.baseURL;
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

// ── Need Card (Dashboard Style) ────────────────────────────────
function NeedCard({ need, onApprove, onReject }) {
  const rawImg = need.productImage || need.imageUrl || need.image;
  const imageSrc = getImageUrl(rawImg) || FALLBACK_IMAGE;
  const orgName = need.charityName || need.organizationName || "جمعية غير معروفة";
  const productName = need.productName || "منتج غير مسمى";
  const id = need.charityNeedId || need.id;
  const location = need.city && need.governorate ? `${need.governorate} - ${need.city}` : (need.city || need.governorate || "غير متوفر");

  return (
    <div className={styles.card}>
      <div className={styles.cardImageWrapper}>
        <img src={imageSrc} alt={productName} onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)} />
        <div className={styles.statusBadge}>{mapCategory(need.category)}</div>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{productName}</h3>
        <p className={styles.cardCategory}>{orgName}</p>

        <div className={styles.cardDetails}>
          <span className={styles[`priority${need.priority}`]}>
            الأولوية: {mapPriority(need.priority)}
          </span>
          <span>الكمية: {need.quantity.toLocaleString("ar-EG")} {mapUnit(need.unit)}</span>
          <span>الموقع: {location}</span>

          {/* Contact info directly in card */}
          <span>البريد: {need.email || "غير متوفر"}</span>
          <span>هاتف: <span style={{ direction: 'ltr', display: 'inline-block' }}>{need.phone || "غير متوفر"}</span></span>
          {need.whatsapp && (
            <span>واتساب: <span style={{ direction: 'ltr', display: 'inline-block' }}>{need.whatsapp}</span></span>
          )}
        </div>

        {need.description && (
          <p className={styles.cardDesc} style={{ marginBottom: '4px', webkitLineClamp: 'unset', display: 'block' }}>
            <strong>وصف الاحتياج:</strong> {need.description}
          </p>
        )}

        {need.charityDescription && (
          <p className={styles.cardDesc} style={{ webkitLineClamp: 'unset', display: 'block' }}>
            <strong>عن الجمعية:</strong> {need.charityDescription}
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

export default function NeedsPage() {
  const { showConfirm, showToast, showAlert } = useAlert();
  const [needs, setNeeds] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await charityNeedsService.getPendingCharityNeeds({ Page: 1, PageSize: 50 });
      const payload = res.data || res.Data || [];
      const items = Array.isArray(payload) ? payload : (payload.items || payload.Items || payload.data || payload.Data || []);
      setNeeds(items);
    } catch (error) {
      setErrorMsg(error.appMessage || "حدث خطأ أثناء جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = needs.filter(
    (n) => {
      const org = n.charityName || n.organizationName || n.name || "";
      return org.includes(search) ||
        (n.productName || "").includes(search) ||
        (n.city || "").includes(search);
    }
  );

  async function handleApprove(id) {
    showConfirm(
      "الموافقة على الاحتياج",
      "هل أنت متأكد من رغبتك في الموافقة على هذا الاحتياج؟",
      async () => {
        try {
          await charityNeedsService.approveCharityNeed(id);
          setNeeds((prev) => prev.filter((n) => (n.charityNeedId || n.id) !== id));
          showToast("تمت الموافقة على الاحتياج بنجاح", "success");
        } catch (error) {
          showAlert("فشل الإجراء", error.appMessage || "تعذر التأكيد", "error");
        }
      }
    );
  }

  async function handleReject(id) {
    showConfirm(
      "رفض الاحتياج",
      "هل أنت متأكد من رغبتك في رفض هذا الاحتياج؟",
      async () => {
        try {
          await charityNeedsService.rejectCharityNeed(id);
          setNeeds((prev) => prev.filter((n) => (n.charityNeedId || n.id) !== id));
          showToast("تم رفض الاحتياج", "success");
        } catch (error) {
          showAlert("فشل الإجراء", error.appMessage || "تعذر الرفض", "error");
        }
      }
    );
  }

  return (
    <div className={pendingStyles.page}>
      <div className={pendingStyles.pageHeader}>
        <h1>احتياجات الجمعيات المعلقة</h1>
        <p>إدارة جميع احتياجات الجمعيات المعلقة وقبولها أو رفضها</p>
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
        <p className={pendingStyles.emptyState}>لا توجد احتياجات معلقة</p>
      ) : (
        <div className={pendingStyles.cardGrid}>
          {filtered.map((need) => (
            <NeedCard
              key={need.charityNeedId || need.id}
              need={need}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
