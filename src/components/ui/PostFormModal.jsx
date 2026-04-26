"use client";

import { useState, useEffect, useRef } from "react";
import styles from "@/styles/dashboard/posts.module.css";

export default function PostFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState({
    title: "",
    category: "",
    phone: "",
    description: "",
    image: null,
    imagePreview: null,
  });

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        category: initialData.category || "",
        phone: initialData.phone || "",
        description: initialData.description || "",
        image: null,
        imagePreview: initialData.image || null,
      });
    } else {
      setForm({ title: "", category: "", phone: "", description: "", image: null, imagePreview: null });
    }
  }, [initialData, isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const fileInputRef = useRef(null);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, image: file, imagePreview: url }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>
            {isEdit ? "تعديل المنشور" : "إضافة منشور جديد"}
          </h2>
          <button id="close-post-modal" className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div
            className={styles.imageUploadArea}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          >
            {form.imagePreview ? (
              <img src={form.imagePreview} alt="معاينة الصورة" />
            ) : (
              <>
                <span className={styles.uploadIcon}>🖼</span>
                <p className={styles.uploadText}>أضف صورة للمنشور</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={handleImageChange}
            />
          </div>

          {/* Title + Category row */}
          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label className={styles.formLabel} htmlFor="post-title">عنوان المنشور</label>
              <input
                id="post-title"
                className={styles.formInput}
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="أدخل العنوان"
                required
              />
            </div>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label className={styles.formLabel} htmlFor="post-category">التوصيف</label>
              <input
                id="post-category"
                className={styles.formInput}
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="مثل: حديد تسليح"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="post-phone">رقم التواصل</label>
            <input
              id="post-phone"
              className={styles.formInput}
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="01xxxxxxxxx"
              required
            />
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="post-description">وصف المنشور</label>
            <textarea
              id="post-description"
              className={styles.formTextarea}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="اكتب تفاصيل المنشور هنا..."
              required
            />
          </div>

          <button id="submit-post-btn" type="submit" className={styles.publishBtn}>
            {isEdit ? "حفظ التعديلات" : "نشر"}
          </button>
        </form>
      </div>
    </div>
  );
}
