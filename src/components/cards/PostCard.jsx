"use client";

import { useState, useRef, useEffect } from "react";
import styles from "@/styles/dashboard/posts.module.css";
import { mapCategory, mapStatus, mapPriority } from "@/utils/enumMapper";

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

  const imageUrl = post.productImage || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80";

  return (
    <div className={styles.card}>
      {/* Image + Menu */}
      <div className={styles.cardImageWrapper}>
        <img src={imageUrl} alt={title} />
        <div className={styles.statusBadge}>{statusStr}</div>

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
                      <span>🗑️</span> حذف
                    </button>
                  </>
                )}
                {isApproved && onFulfill && (
                  <button
                    className={styles.menuItemEdit}
                    onClick={() => { onFulfill(post.id || post.charityNeedId || post.offerId); setMenuOpen(false); }}
                    role="menuitem"
                  >
                    <span>✅</span> اكتمل
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
          <span>الكمية: {post.quantity}</span>
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
