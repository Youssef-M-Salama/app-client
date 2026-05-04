"use client";

import React, { useRef, useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import styles from '@/styles/profile/ProfileBanner.module.css';

// ── Helpers ────────────────────────────────────────────────────────────────
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  const base = apiClient.defaults.baseURL || '';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100%25' height='100%25' fill='%23ede9f6'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='%236F2DBD'%3E%F0%9F%8F%A2%3C/text%3E%3C/svg%3E";

// Allowed by server config
const MAX_SIZE_MB  = 5;
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

export default function ProfileBanner({ imageUrl, isUploading, onFileSelect }) {
  const fileRef = useRef(null);

  // Local preview URL — set immediately when a file is chosen
  // so the user sees the new image without waiting for the API or a page reload
  const [previewUrl, setPreviewUrl] = useState(null);

  // Clean up blob URL when component unmounts to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // The displayed src: local preview → API URL → fallback
  const displaySrc = previewUrl || getImageUrl(imageUrl) || FALLBACK;

  const handleEditClick = () => fileRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // allow re-selecting same file

    // ── Validate extension ────────────────────────────────────────
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      alert(`صيغة الملف غير مدعومة. الصيغ المسموح بها: ${ALLOWED_EXTS.join(', ')}`);
      return;
    }

    // ── Validate size (5 MB max) ──────────────────────────────────
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`حجم الصورة يتجاوز الحد المسموح به (${MAX_SIZE_MB} ميجابايت).`);
      return;
    }

    // ── Instant preview via blob URL ──────────────────────────────
    const blob = URL.createObjectURL(file);
    // Revoke old blob if any
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(blob);

    // ── Hand off to parent for actual API upload ──────────────────
    if (onFileSelect) onFileSelect(file);
  };

  return (
    <div className={styles.bannerContainer}>
      <img
        src={displaySrc}
        alt="صورة الملف الشخصي"
        className={styles.bannerImage}
        onError={(e) => { e.currentTarget.src = FALLBACK; }}
      />

      {/* Hidden real file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className={styles.imageActions}>
        <button
          className={styles.editBtn}
          onClick={handleEditClick}
          disabled={isUploading}
        >
          {isUploading ? 'جاري الرفع...' : 'تعديل الصورة'}
        </button>
      </div>
    </div>
  );
}
