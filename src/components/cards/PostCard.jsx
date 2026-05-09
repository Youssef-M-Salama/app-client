"use client";

import { useState, useRef, useEffect } from "react";
import styles from "@/styles/dashboard/posts.module.css";
import { mapCategory, mapStatus, mapPriority, mapUnit } from "@/utils/enumMapper";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23e8e0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%236F2DBD'%3E%3F%3C/text%3E%3C/svg%3E";

export default function PostCard({ post, role, onEdit, onDelete, onFulfill }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const isOffer = role === "DonorOrganization";
  const title = post.productName;
  const categoryStr = mapCategory(post.category);
  const statusStr = mapStatus(post.status, isOffer);

  // Status mapping
  // 0: Pending, 1: Approved, 2: Rejected, 3: Fulfilled/Expired, 4: Fulfilled(offer)
  const isPending = post.status === 0;
  const isApproved = post.status === 1;

  const imageUrl = post.productImage || FALLBACK_IMAGE;

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'var(--color-status-pending)';
      case 1: return 'var(--color-status-approved)';
      case 2: return 'var(--color-status-rejected)';
      case 3: return 'var(--color-status-fulfilled)';
      case 4: return 'var(--color-status-expired)';
      default: return '#333';
    }
  };

  return (
    <div className={styles.card}>
      {/* Image + Menu */}
      <div className={styles.cardImageWrapper}>
        <img src={imageUrl} alt={title} />
        <div className={styles.statusBadge} style={{ backgroundColor: getStatusColor(post.status) }}>
          {statusStr}
        </div>

        {(isPending || isApproved) && (
          <div className={styles.menuWrapper} ref={menuRef}>
            <button
              id={`post-menu-${post.id}`}
              className={styles.menuBtn}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="خيارات المنشور"
            >
              &#x22EE;
            </button>

            {menuOpen && (
              <div className={styles.menuDropdown} role="menu">
                {isPending && (
                  <>
                    <button
                      className={styles.menuItemEdit}
                      onClick={() => { onEdit(post); setMenuOpen(false); }}
                      role="menuitem"
                    >
                      <span>✏️</span> تعديل
                    </button>
                    <button
                      className={styles.menuItemDelete}
                      onClick={() => { onDelete(post); setMenuOpen(false); }}
                      role="menuitem"
                    >
                      <span><i className="fa-solid fa-trash"></i></span> حذف
                    </button>
                  </>
                )}
                {isApproved && onFulfill && (
                  <button
                    className={styles.menuItemEdit}
                    onClick={() => { onFulfill(post.id || post.charityNeedId || post.offerId); setMenuOpen(false); }}
                    role="menuitem"
                  >
                    <span><i className="fa-solid fa-check"></i></span> اكتمل
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardCategory}>{categoryStr}</p>

        <div className={styles.cardDetails}>
          <span>الكمية: {post.quantity.toLocaleString("ar-EG")} {mapUnit(post.unit)}</span>
          {!isOffer && post.priority !== undefined && (
            <span className={styles[`priority${post.priority}`]}>
              الأولوية: {mapPriority(post.priority)}
            </span>
          )}
          {isOffer && post.expiryDate && (
            <span>الصلاحية: {new Date(post.expiryDate).toLocaleDateString("ar-EG")}</span>
          )}
        </div>

        <p className={styles.cardDesc}>{post.description}</p>

        <p className={styles.timestamp}>
          {post.createdAt ? `تم النشر في ${new Date(post.createdAt).toLocaleDateString("ar-EG")}` : ""}
        </p>
      </div>
    </div>
  );
}
