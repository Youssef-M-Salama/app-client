"use client";

import { useState, useRef, useEffect } from "react";
import styles from "@/styles/dashboard/posts.module.css";

export default function PostCard({ post, onEdit, onDelete }) {
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

  return (
    <div className={styles.card}>
      {/* Image + Menu */}
      <div className={styles.cardImageWrapper}>
        <img src={post.image} alt={post.title} />

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
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{post.title}</h3>
        <p className={styles.cardCategory}>{post.category}</p>
        <p className={styles.cardDesc}>{post.description}</p>
        <button className={styles.readMoreBtn}>عرض المزيد</button>
        <p className={styles.timestamp}>تم النشر منذ {post.timeAgo}</p>
      </div>
    </div>
  );
}
