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

// ── Row Action Detail Modal ─────────────────────────────────────
function NeedDetailModal({ need, onClose, onApprove, onReject }) {
  if (!need) return null;

  const rawImg = need.productImage || need.imageUrl || need.image;
  const imageSrc = getImageUrl(rawImg) || FALLBACK_IMAGE;
  const orgName = need.charityName || need.organizationName || "جمعية غير معروفة";
  const productName = need.productName || "منتج غير مسمى";
  const id = need.charityNeedId || need.id;
  const location = need.city && need.governorate ? `${need.governorate} - ${need.city}` : (need.city || need.governorate || "غير متوفر");

  return (
    <div className={pendingStyles.modalOverlay} onClick={onClose}>
      <div className={pendingStyles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className={pendingStyles.modalHeader}>
          <h3>تفاصيل الاحتياج</h3>
          <button className={pendingStyles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={pendingStyles.modalBody}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', minWidth: 0 }}>
            <img 
              src={imageSrc} 
              alt={productName} 
              style={{ width: '120px', height: '120px', objectFit: 'contain', backgroundColor: '#fff', borderRadius: '12px', flexShrink: 0 }} 
              onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--color-text-primary)', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>{productName}</h4>
              <p style={{ color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '12px', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{orgName}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                <span className={styles[`priority${need.priority}`]} style={{ width: 'fit-content' }}>
                  <strong>الأولوية:</strong> {mapPriority(need.priority)}
                </span>
                <span><strong>التصنيف:</strong> {mapCategory(need.category)}</span>
                <span><strong>الكمية:</strong> {need.quantity.toLocaleString("ar-EG")} {mapUnit(need.unit)}</span>
                <span><strong>الموقع:</strong> {location}</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>وصف الاحتياج</h5>
            <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', fontSize: '0.95rem', lineHeight: '1.6', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
              {need.description || "لا يوجد وصف متوفر"}
            </div>
          </div>

          <div>
            <h5 style={{ marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>معلومات التواصل</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-envelope" style={{ color: '#6366f1' }}></i>
                <a href={`mailto:${need.email}`} className={pendingStyles.link} style={{ fontSize: '0.9rem' }}>{need.email || "غير متوفر"}</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-phone" style={{ color: '#10b981' }}></i>
                <a href={`tel:${need.phone}`} className={pendingStyles.link} style={{ fontSize: '0.9rem', direction: 'ltr' }}>{need.phone || "غير متوفر"}</a>
              </div>
              {need.whatsapp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }}></i>
                  <a 
                    href={`https://wa.me/${need.whatsapp.replace('+', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={pendingStyles.link} 
                    style={{ fontSize: '0.9rem', direction: 'ltr' }}
                  >
                    {need.whatsapp}
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
            رفض الاحتياج
          </button>
          <button 
            className={pendingStyles.btnApprove} 
            style={{ padding: '10px 24px', flex: 'none' }}
            onClick={() => { onApprove(id); onClose(); }}
          >
            الموافقة على الاحتياج
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Need Card (Dashboard Style) ────────────────────────────────
function NeedCard({ need, onApprove, onReject, onView }) {
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
          <span>الكمية: {need.quantity.toLocaleString("ar-EG")} {mapUnit(need.unit)}</span>
        </div>

        <p className={styles.cardDesc}>{need.description || ""}</p>

        <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '10px' }}>
          <button
            className={styles.publishBtn}
            style={{ background: 'var(--color-primary)', flex: 1, margin: 0 }}
            onClick={() => onView(need)}
          >
            عرض التفاصيل
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
  const [viewingNeed, setViewingNeed] = useState(null);

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
              onView={setViewingNeed}
            />
          ))}
        </div>
      )}

      {viewingNeed && (
        <NeedDetailModal
          need={viewingNeed}
          onClose={() => setViewingNeed(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
