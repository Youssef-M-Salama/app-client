"use client";

import { useState } from "react";
import styles from "@/styles/admin/table.module.css";

// ── Mock Data ──────────────────────────────────────────────────
const INITIAL_OFFERS = [
  {
    id: 1,
    orgName: "مصنع أرز الدلتا",
    orgAvatar: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&q=80",
    product: "أرز - مواد غذائية - 30 كيلو جرام",
    endDate: "11/5/2026",
    city: "أسوان",
    governorate: "أسوان",
    isVerified: true,
  },
  {
    id: 2,
    orgName: "مصنع حديد عز",
    orgAvatar: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&q=80",
    product: "حديد تسليح - مواد بناء - 30 كيلو جرام",
    endDate: "11/7/2026",
    city: "القاهرة",
    governorate: "القاهرة",
    isVerified: false,
  },
  {
    id: 3,
    orgName: "مؤسسة غيث",
    orgAvatar: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&q=80",
    product: "ملابس جاهزة - ملابس - 20 كيلو جرام",
    endDate: "14/8/2026",
    city: "الفيوم",
    governorate: "الفيوم",
    isVerified: true,
  },
  {
    id: 4,
    orgName: "شركة جلوبال فروتس",
    orgAvatar: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=80&q=80",
    product: "فراولة - مواد غذائية - 20 كيلو جرام",
    endDate: "10/7/2026",
    city: "الغردقة",
    governorate: "الغردقة",
    isVerified: true,
  },
  {
    id: 5,
    orgName: "مصنع المغربي للأحذية",
    orgAvatar: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&q=80",
    product: "أحذية - أحذية جاهزة - 75 حذاء",
    endDate: "2/2/2026",
    city: "العامرين",
    governorate: "مرسى مطروح",
    isVerified: true,
  },
  {
    id: 6,
    orgName: "مطعم بازوكا",
    orgAvatar: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&q=80",
    product: "دجاج - مواد غذائية - 15 كيلو جرام",
    endDate: "8/4/2026",
    city: "المعادي",
    governorate: "القاهرة",
    isVerified: false,
  },
  {
    id: 7,
    orgName: "مطعم بافالو برجر",
    orgAvatar: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=80&q=80",
    product: "لحمة - مواد غذائية - 30 كيلو جرام",
    endDate: "1/8/2026",
    city: "المهندسين",
    governorate: "القاهرة",
    isVerified: true,
  },
];

// ── Page ────────────────────────────────────────────────────────
export default function OffersPage() {
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [search, setSearch] = useState("");

  const filtered = offers.filter(
    (o) =>
      o.orgName.includes(search) ||
      o.product.includes(search) ||
      o.city.includes(search)
  );

  function handleApprove(id) {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  }

  function handleReject(id) {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <h1>العروض المعلقة</h1>
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

      {/* ── Filter Row ── */}
      <div className={styles.actionBar}>
        <div className={styles.actionBarLeft}>
          <button className={styles.btnOutline}>عرض الكل ▼</button>
          <button className={styles.btnOutline}>☰ تصنيف</button>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h2>عروض الجمعيات و المؤسسات المختلفة</h2>
          <p>مراقبة جميع عروض الجمعيات و المؤسسات وقبولها أو رفضها</p>
        </div>

        <div className={styles.tableWrapper}>
          {filtered.length === 0 ? (
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
                {filtered.map((offer) => (
                  <tr key={offer.id}>
                    <td>
                      <div className={styles.orgCell}>
                        <img
                          src={offer.orgAvatar}
                          alt={offer.orgName}
                          className={styles.orgAvatar}
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/36x36/e8e0f0/6F2DBD?text=م")}
                        />
                        <span className={styles.orgName}>{offer.orgName}</span>
                      </div>
                    </td>
                    <td>{offer.product}</td>
                    <td>{offer.endDate}</td>
                    <td>{offer.city}</td>
                    <td>{offer.governorate}</td>
                    <td>
                      <span className={`${styles.badge} ${offer.isVerified ? styles.badgeVerified : styles.badgeUnverified}`}>
                        <span className={styles.badgeDot} />
                        {offer.isVerified ? "مستخدم موثق" : "مستخدم غير موثق"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          className={styles.btnIconReject}
                          onClick={() => handleReject(offer.id)}
                          aria-label="رفض"
                          title="رفض"
                        >
                          ✕
                        </button>
                        <button
                          className={styles.btnIconApprove}
                          onClick={() => handleApprove(offer.id)}
                          aria-label="قبول"
                          title="قبول"
                        >
                          ✓
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
