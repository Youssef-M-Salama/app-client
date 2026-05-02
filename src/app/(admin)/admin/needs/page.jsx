"use client";

import { useState } from "react";
import styles from "@/styles/admin/table.module.css";

// ── Mock Data ──────────────────────────────────────────────────
const INITIAL_NEEDS = [
  {
    id: 1,
    orgName: "جمعية مصر الخير",
    orgAvatar: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=80&q=80",
    product: "أرز - مواد غذائية - 30 كيلو جرام",
    endDate: "11/5/2026",
    city: "أسوان",
    governorate: "أسوان",
    isVerified: true,
  },
  {
    id: 2,
    orgName: "مؤسسة فرصة حياة",
    orgAvatar: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=80&q=80",
    product: "حديد تسليح - مواد بناء - 30 كيلو جرام",
    endDate: "11/7/2026",
    city: "القاهرة",
    governorate: "القاهرة",
    isVerified: true,
  },
  {
    id: 3,
    orgName: "مؤسسة كريمة العلا",
    orgAvatar: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=80&q=80",
    product: "ملابس جاهزة - ملابس - 20 كيلو جرام",
    endDate: "14/8/2026",
    city: "الفيوم",
    governorate: "الفيوم",
    isVerified: false,
  },
  {
    id: 4,
    orgName: "مؤسسة ميجا خير",
    orgAvatar: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=80&q=80",
    product: "فراولة - مواد غذائية - 20 كيلو جرام",
    endDate: "10/7/2026",
    city: "الغردقة",
    governorate: "الغردقة",
    isVerified: true,
  },
  {
    id: 5,
    orgName: "بنك الطعام المصري",
    orgAvatar: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=80&q=80",
    product: "أحذية - أحذية جاهزة - 75 حذاء",
    endDate: "2/2/2026",
    city: "العامرين",
    governorate: "مرسى مطروح",
    isVerified: true,
  },
  {
    id: 6,
    orgName: "جمعية الوسيم",
    orgAvatar: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=80&q=80",
    product: "دجاج - مواد غذائية - 15 كيلو جرام",
    endDate: "8/4/2026",
    city: "المعادي",
    governorate: "القاهرة",
    isVerified: false,
  },
  {
    id: 7,
    orgName: "مؤسسة أهل مصر",
    orgAvatar: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=80&q=80",
    product: "لحمة - مواد غذائية - 30 كيلو جرام",
    endDate: "1/8/2026",
    city: "المهندسين",
    governorate: "القاهرة",
    isVerified: true,
  },
];

// ── Page ────────────────────────────────────────────────────────
export default function NeedsPage() {
  const [needs, setNeeds] = useState(INITIAL_NEEDS);
  const [search, setSearch] = useState("");

  const filtered = needs.filter(
    (n) =>
      n.orgName.includes(search) ||
      n.product.includes(search) ||
      n.city.includes(search)
  );

  function handleApprove(id) {
    setNeeds((prev) => prev.filter((n) => n.id !== id));
  }

  function handleReject(id) {
    setNeeds((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <h1>احتياجات الجمعيات المعلقة</h1>
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
          <h2>احتياجات الجمعيات و المؤسسات المختلفة</h2>
          <p>مراقبة جميع احتياجات الجمعيات و المؤسسات وقبولها أو رفضها</p>
        </div>

        <div className={styles.tableWrapper}>
          {filtered.length === 0 ? (
            <p className={styles.emptyState}>لا توجد احتياجات معلقة</p>
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
                {filtered.map((need) => (
                  <tr key={need.id}>
                    <td>
                      <div className={styles.orgCell}>
                        <img
                          src={need.orgAvatar}
                          alt={need.orgName}
                          className={styles.orgAvatar}
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/36x36/e8e0f0/6F2DBD?text=م")}
                        />
                        <span className={styles.orgName}>{need.orgName}</span>
                      </div>
                    </td>
                    <td>{need.product}</td>
                    <td>{need.endDate}</td>
                    <td>{need.city}</td>
                    <td>{need.governorate}</td>
                    <td>
                      <span className={`${styles.badge} ${need.isVerified ? styles.badgeVerified : styles.badgeUnverified}`}>
                        <span className={styles.badgeDot} />
                        {need.isVerified ? "مستخدم موثق" : "مستخدم غير موثق"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          className={styles.btnIconReject}
                          onClick={() => handleReject(need.id)}
                          aria-label="رفض"
                          title="رفض"
                        >
                          ✕
                        </button>
                        <button
                          className={styles.btnIconApprove}
                          onClick={() => handleApprove(need.id)}
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
