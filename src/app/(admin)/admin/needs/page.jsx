"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/admin/table.module.css";
import charityNeedsService from "@/services/charityNeedsService";
import { mapCategory } from "@/utils/enumMapper";
import { useAlert } from "@/context/AlertContext";

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
      // Defensive check for PascalCase or camelCase
      const payload = res.data || res.Data || [];
      // Payload could be the array itself or an object with an items/data array
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
    if (!id) {
      showToast("خطأ: معرف الاحتياج غير موجود", "error");
      return;
    }

    showConfirm(
      "الموافقة على الاحتياج",
      "هل أنت متأكد من رغبتك في الموافقة على هذا الاحتياج؟",
      async () => {
        try {
          await charityNeedsService.approveCharityNeed(id);
          setNeeds((prev) => prev.filter((n) => (n.charityNeedId || n.id) !== id));
          showToast("تمت الموافقة على الاحتياج بنجاح", "success");
        } catch (error) {
          if (error.apiStatus === 422) {
            showAlert("انتهت صلاحية الإجراء", "لا يمكن تنفيذ الإجراء، قد تكون الحالة تغيرت. سيتم تحديث القائمة.", "error");
            fetchData();
          } else {
            showAlert("فشل الإجراء", error.appMessage || "تعذر التأكيد", "error");
          }
        }
      }
    );
  }

  async function handleReject(id) {
    if (!id) {
      showToast("خطأ: معرف الاحتياج غير موجود", "error");
      return;
    }

    showConfirm(
      "رفض الاحتياج",
      "هل أنت متأكد من رغبتك في رفض هذا الاحتياج؟",
      async () => {
        try {
          await charityNeedsService.rejectCharityNeed(id);
          setNeeds((prev) => prev.filter((n) => (n.charityNeedId || n.id) !== id));
          showToast("تم رفض الاحتياج", "success");
        } catch (error) {
          if (error.apiStatus === 422) {
            showAlert("انتهت صلاحية الإجراء", "لا يمكن تنفيذ الإجراء، قد تكون الحالة تغيرت. سيتم تحديث القائمة.", "error");
            fetchData();
          } else {
            showAlert("فشل الإجراء", error.appMessage || "تعذر الرفض", "error");
          }
        }
      }
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <h1>احتياجات الجمعيات المعلقة</h1>
        <p>إدارة جميع احتياجات الجمعيات المعلقة وقبولها أو رفضها</p>
      </div>

      {/* ── Action Bar ── */}
      <div className={styles.actionBar}>
        <div className={styles.actionBarLeft}>
          <button className={styles.btnOutline}>⬇ تحميل التقرير</button>
          <button className={styles.btnOutline}>⬆ تصدير كملف CSV</button>
        </div>
        <div className={styles.actionBarRight}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              id="needs-search"
              type="text"
              className={styles.searchInput}
              placeholder="ابحث هنا..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h2>احتياجات الجمعيات</h2>
        </div>

        <div className={styles.tableWrapper}>
          {isLoading ? (
            <p style={{ textAlign: "center", padding: "40px" }}>جاري التحميل...</p>
          ) : errorMsg ? (
            <div style={{ textAlign: "center", color: "red", padding: "20px" }}>
              {errorMsg}
              <br />
              <button onClick={fetchData} className={styles.btnOutline} style={{ marginTop: "10px" }}>إعادة المحاولة</button>
            </div>
          ) : filtered.length === 0 ? (
            <p className={styles.emptyState}>لا توجد احتياجات معلقة</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>الجمعية</th>
                  <th>المنتج - الكمية - التصنيف</th>
                  <th>المدينة</th>
                  <th>المحافظة</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((need) => {
                  const id = need.charityNeedId || need.id;
                  const orgName = need.charityName || need.organizationName || need.name || "غير معروف";
                  const avatar = need.organizationImage || need.profileImage || "https://placehold.co/36x36/e8e0f0/6F2DBD?text=م";
                  const productDetails = `${need.productName} - ${need.quantity} وحدة - ${mapCategory(need.category)}`;
                  const isVerified = need.isVerified !== false;

                  return (
                    <tr key={id}>
                      <td>
                        <div className={styles.orgCell}>
                          <img
                            src={avatar}
                            alt={orgName}
                            className={styles.orgAvatar}
                            onError={(e) => (e.currentTarget.src = "https://placehold.co/36x36/e8e0f0/6F2DBD?text=م")}
                          />
                          <span className={styles.orgName}>{orgName}</span>
                        </div>
                      </td>
                      <td>{productDetails}</td>
                      <td>{need.city || "غير محدد"}</td>
                      <td>{need.governorate || "غير محدد"}</td>
                      <td>
                        <span className={`${styles.badge} ${isVerified ? styles.badgeVerified : styles.badgeUnverified}`}>
                          <span className={styles.badgeDot} />
                          {isVerified ? "مستخدم موثق" : "مستخدم غير موثق"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            className={styles.btnIconReject}
                            onClick={() => handleReject(id)}
                            aria-label="رفض"
                            title="رفض"
                          >
                            ✕
                          </button>
                          <button
                            className={styles.btnIconApprove}
                            onClick={() => handleApprove(id)}
                            aria-label="قبول"
                            title="قبول"
                          >
                            ✓
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
