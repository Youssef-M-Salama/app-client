"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/admin/pending.module.css";
import { useAlert } from "@/context/AlertContext";
import adminUsersService from "@/services/adminUsersService";
import apiClient from "@/services/apiClient";

// ── Helpers ─────────────────────────────────────────────────────
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = apiClient.defaults.baseURL;
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

// ── Org Card ────────────────────────────────────────────────────
function OrgCard({ org, onApprove, onReject }) {
  const rawImg = org.imageUrl || org.ImageUrl || org.image || org.profilePicture;
  const imageSrc = getImageUrl(rawImg) || FALLBACK_IMAGE;
  const name = org.charityName || org.donorOrganizationName || org.name;
  const userId = org.userId || org.id || org.charityId || org.donorOrganizationId;

  return (
    <div className={styles.orgCard}>
      <img
        src={imageSrc}
        alt=""
        className={styles.cardImage}
        onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
      />
      <div className={styles.cardBody}>
        <p className={styles.orgName}>{name}</p>
        <div className={styles.orgDetail}>
          <span className={styles.detailLabel}>الإيميل:</span>
          <span className={styles.detailValue} dir="ltr">{org.email}</span>
        </div>
        <div className={styles.orgDetail}>
          <span className={styles.detailLabel}>المدينة:</span>
          <span className={styles.detailValue}>{org.governorate || ""} - {org.district || ""} - {org.city || ""}</span>
        </div>
        <div className={styles.orgDetail}>
          <span className={styles.detailLabel}>تاريخ الإنشاء:</span>
          <span className={styles.detailValue}>{org.createdAt ? new Date(org.createdAt).toLocaleDateString("ar-EG") : ""}</span>
        </div>
      </div>
      <div className={styles.cardFooter}>
        <button
          className={styles.btnApprove}
          onClick={() => onApprove(userId, name)}
          aria-label={`تأكيد ${name}`}
        >
          تأكيد
        </button>
        <button
          className={styles.btnReject}
          onClick={() => onReject(userId, name)}
          aria-label={`رفض ${name}`}
        >
          رفض
        </button>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────
export default function PendingPage() {
  const { showConfirm, showToast, showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState("charities");
  const [charities, setCharities] = useState([]);
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await adminUsersService.getPendingVerifications();
      // Defensive check for PascalCase or camelCase based on live API response
      const payload = res.data || res.Data || { pendingCharities: [], pendingDonors: [] };
      setCharities(payload.pendingCharities || payload.charities || payload.Charities || []);
      setDonors(payload.pendingDonors || payload.donorOrganizations || payload.DonorOrganizations || []);
    } catch (error) {
      setErrorMsg(error.appMessage || "حدث خطأ أثناء جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const data = activeTab === "charities" ? charities : donors;

  const filtered = data.filter(
    (o) => {
      const name = o.charityName || o.donorOrganizationName || o.name || "";
      return name.includes(search) || o.email?.includes(search);
    }
  );

  async function handleApprove(id, name) {
    if (!id) {
      showToast("خطأ: معرف المستخدم غير موجود", "error");
      return;
    }

    showConfirm(
      "تأكيد التوثيق",
      `هل أنت متأكد من رغبتك في توثيق حساب "${name}"؟`,
      async () => {
        try {
          await adminUsersService.verifyUser(id);
          if (activeTab === "charities") {
            setCharities((prev) => prev.filter((o) => (o.userId || o.id) !== id));
          } else {
            setDonors((prev) => prev.filter((o) => (o.userId || o.id) !== id));
          }
          showToast("تم توثيق الحساب بنجاح", "success");
        } catch (error) {
          showAlert("فشل الإجراء", error.appMessage || "تعذر التأكيد", "error");
        }
      }
    );
  }

  async function handleReject(id, name) {
    if (!id) {
      showToast("خطأ: معرف المستخدم غير موجود", "error");
      return;
    }

    showConfirm(
      "رفض التوثيق",
      `هل أنت متأكد من رغبتك في رفض توثيق حساب "${name}"؟`,
      async () => {
        try {
          await adminUsersService.rejectUser(id);
          if (activeTab === "charities") {
            setCharities((prev) => prev.filter((o) => (o.userId || o.id) !== id));
          } else {
            setDonors((prev) => prev.filter((o) => (o.userId || o.id) !== id));
          }
          showToast("تم رفض طلب التوثيق", "success");
        } catch (error) {
          showAlert("فشل الإجراء", error.appMessage || "تعذر الرفض", "error");
        }
      }
    );
  }


  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <h1>طلبات التحقق المعلقة</h1>
        <p>إدارة جميع اختيارات الجمعيات المعلقة الموجودة و معرفة تفاصيلها</p>
      </div>

      {/* ── Action Bar ── */}
      <div className={styles.actionBar}>
        <div className={styles.actionBarLeft}>
          <button className={styles.btnOutline}>⬇ تحميل التقرير</button>
          <button className={styles.btnOutline}>⬆ تصدير كملف CSV</button>
        </div>
        <div className={styles.actionBarRight}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}><i className="fa-solid fa-magnifying-glass"></i></span>
            <input
              id="pending-search"
              type="text"
              className={styles.searchInput}
              placeholder="ابحث هنا..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Filter + Tabs Row ── */}
      <div className={styles.actionBar}>
        <div className={styles.tabs}>
          <button
            id="tab-donors"
            className={`${styles.tab} ${activeTab === "donors" ? styles.activeTab : ""}`}
            onClick={() => { setActiveTab("donors"); setSearch(""); }}
          >
            الجهات المانحة
          </button>
          <button
            id="tab-charities"
            className={`${styles.tab} ${activeTab === "charities" ? styles.activeTab : ""}`}
            onClick={() => { setActiveTab("charities"); setSearch(""); }}
          >
            الجمعيات
          </button>
        </div>
        <div className={styles.actionBarLeft}>
          <button className={styles.btnOutline}>عرض الكل ▼</button>
          <button className={styles.btnOutline}>☰ تصنيف</button>
        </div>
      </div>

      {/* ── Content Area ── */}
      {isLoading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>جاري التحميل...</p>
      ) : errorMsg ? (
        <div style={{ textAlign: "center", color: "red", padding: "20px" }}>
          {errorMsg}
          <br />
          <button onClick={fetchData} className={styles.btnOutline} style={{ marginTop: "10px" }}>إعادة المحاولة</button>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {filtered.length === 0 ? (
            <p className={styles.emptyState}>لا توجد طلبات معلقة</p>
          ) : (
            filtered.map((org) => (
              <OrgCard
                key={org.userId || org.id || org.charityId || org.donorOrganizationId}
                org={org}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      )}

    </div>
  );
}
