"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/admin/table.module.css";
import offersService from "@/services/offersService";
import { mapCategory } from "@/utils/enumMapper";
import { useAlert } from "@/context/AlertContext";

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
      // Defensive check for PascalCase or camelCase
      const payload = res.data || res.Data || [];
      // Payload could be the array itself or an object with an items/data array
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
    if (!id) {
      showToast("خطأ: معرف العرض غير موجود", "error");
      return;
    }

    showConfirm(
      "الموافقة على العرض",
      "هل أنت متأكد من رغبتك في الموافقة على هذا العرض؟",
      async () => {
        try {
          await offersService.approveOffer(id);
          setOffers((prev) => prev.filter((o) => (o.offerId || o.id) !== id));
          showToast("تمت الموافقة على العرض بنجاح", "success");
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
      showToast("خطأ: معرف العرض غير موجود", "error");
      return;
    }

    showConfirm(
      "رفض العرض",
      "هل أنت متأكد من رغبتك في رفض هذا العرض؟",
      async () => {
        try {
          await offersService.rejectOffer(id);
          setOffers((prev) => prev.filter((o) => (o.offerId || o.id) !== id));
          showToast("تم رفض العرض", "success");
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
        <h1>العروض المعلقة</h1>
        <p>إدارة جميع عروض الجهات المانحة المعلقة وقبولها أو رفضها</p>
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
              id="offers-search"
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
          <h2>عروض الجهات المانحة</h2>
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
            <p className={styles.emptyState}>لا توجد عروض معلقة</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>الجهة المانحة</th>
                  <th>المنتج - الكمية - التصنيف</th>
                  <th>تاريخ الانتهاء</th>
                  <th>المدينة</th>
                  <th>المحافظة</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((offer) => {
                  const id = offer.offerId || offer.id;
                  const orgName = offer.donorOrganizationName || offer.organizationName || offer.name || "غير معروف";
                  const avatar = offer.organizationImage || offer.profileImage || "https://placehold.co/36x36/e8e0f0/6F2DBD?text=م";
                  const productDetails = `${offer.productName} - ${offer.quantity} وحدة - ${mapCategory(offer.category)}`;
                  const isVerified = offer.isVerified !== false;
                  const endDate = offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString("ar-EG") : "غير محدد";

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
                      <td>{endDate}</td>
                      <td>{offer.city || "غير محدد"}</td>
                      <td>{offer.governorate || "غير محدد"}</td>
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
