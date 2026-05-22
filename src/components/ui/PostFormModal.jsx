"use client";

import { useState, useEffect, useRef } from "react";
import styles from "@/styles/dashboard/posts.module.css";

const CATEGORY_OPTIONS = [
  { value: 0, label: "طعام" },
  { value: 1, label: "ملابس" },
  { value: 2, label: "طبي" },
  { value: 3, label: "تعليمي" },
  { value: 4, label: "أخرى" }
];

const UNIT_OPTIONS = [
  { value: 0, label: "طن (Ton)" },
  { value: 1, label: "كجم (Kg)" },
  { value: 2, label: "جرام (Gram)" },
  { value: 3, label: "لتر (Liter)" },
  { value: 4, label: "مللتر (Ml)" },
  { value: 5, label: "عبوة (Pack)" },
  { value: 6, label: "صندوق (Box)" },
  { value: 7, label: "علبة (Can)" },
  { value: 8, label: "قطعة (Piece)" }
];

const PRIORITY_OPTIONS = [
  { value: 0, label: "عاجل" },
  { value: 1, label: "عالي" },
  { value: 2, label: "عادي" },
  { value: 3, label: "منخفض" }
];

// Units that must be whole numbers (no decimals)
const INTEGER_UNITS = [5, 6, 7, 8]; // عبوة، صندوق، علبة، قطعة

export default function PostFormModal({ isOpen, onClose, onSubmit, initialData, role, fieldErrors = {}, generalError }) {
  const isEdit = Boolean(initialData);
  const isCharity = role === "Charity";

  const [form, setForm] = useState({
    title: "",
    category: 0,
    quantity: 1,
    unit: 8,
    description: "",
    priority: 2,
    expiryDate: "",
    image: null,
    imagePreview: null,
  });

  const [clientErrors, setClientErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.productName || initialData.title || "",
        category: initialData.category !== undefined ? initialData.category : 0,
        quantity: initialData.quantity || 1,
        unit: initialData.unit !== undefined ? initialData.unit : 8,
        description: initialData.description || "",
        priority: initialData.priority !== undefined ? initialData.priority : 2,
        expiryDate: initialData.expiryDate ? initialData.expiryDate.split("T")[0] : "",
        image: null,
        imagePreview: initialData.productImage || initialData.imageUrl || initialData.image || null,
      });
    } else {
      setForm({ 
        title: "", 
        category: 0, 
        quantity: 1, 
        unit: 8,
        description: "", 
        priority: 2, 
        expiryDate: "", 
        image: null, 
        imagePreview: null 
      });
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
    setForm((prev) => ({ 
      ...prev, 
      [name]: name === "category" || name === "priority" || name === "quantity" || name === "unit"
        ? (value === "" ? "" : Number(value)) 
        : value 
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errors = {};

    if (!form.title.trim()) {
      errors.title = "عنوان المنشور مطلوب";
    }
    if (!form.description.trim()) {
      errors.description = "وصف المنشور مطلوب";
    }

    // Validate quantity: whole number required for certain units
    if (INTEGER_UNITS.includes(Number(form.unit))) {
      const qty = Number(form.quantity);
      if (!Number.isInteger(qty) || qty <= 0) {
        errors.quantity = `الوحدة المختارة (${UNIT_OPTIONS.find(u => u.value === Number(form.unit))?.label}) تتطلب عدداً صحيحاً بدون كسور عشرية`;
      }
    } else {
      if (Number(form.quantity) <= 0) {
        errors.quantity = "يجب أن تكون الكمية أكبر من صفر";
      }
    }

    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }
    setClientErrors({});
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

        {generalError && (
          <div className={styles.inputError} style={{ padding: "0 24px", marginBottom: "16px", fontSize: "15px", color: "#dc3545" }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginLeft: "8px" }}></i> {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
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
                <span className={styles.uploadIcon}><i className="fa-regular fa-image"></i></span>
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
                maxLength={200}
                required
              />
              {(clientErrors.title || fieldErrors.ProductName) && (
                <p className={styles.inputError}>{clientErrors.title || fieldErrors.ProductName[0]}</p>
              )}
            </div>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label className={styles.formLabel} htmlFor="post-category">التصنيف</label>
              <select
                id="post-category"
                className={styles.formInput}
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {fieldErrors.Category && (
                <p className={styles.inputError}>{fieldErrors.Category[0]}</p>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label className={styles.formLabel} htmlFor="post-quantity">الكمية</label>
              <input
                id="post-quantity"
                className={styles.formInput}
                type="number"
                step={INTEGER_UNITS.includes(Number(form.unit)) ? "1" : "0.01"}
                min={INTEGER_UNITS.includes(Number(form.unit)) ? "1" : "0.01"}
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />
              {(clientErrors.quantity || fieldErrors.Quantity) && (
                <p className={styles.inputError}>{clientErrors.quantity || fieldErrors.Quantity[0]}</p>
              )}
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label className={styles.formLabel} htmlFor="post-unit">الوحدة</label>
              <select
                id="post-unit"
                className={styles.formInput}
                name="unit"
                value={form.unit}
                onChange={handleChange}
                required
              >
                {UNIT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {fieldErrors.Unit && (
                <p className={styles.inputError}>{fieldErrors.Unit[0]}</p>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            {isCharity ? (
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.formLabel} htmlFor="post-priority">الأولوية</label>
                <select
                  id="post-priority"
                  className={styles.formInput}
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  required
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {fieldErrors.Priority && (
                  <p className={styles.inputError}>{fieldErrors.Priority[0]}</p>
                )}
              </div>
            ) : (
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label className={styles.formLabel} htmlFor="post-expiryDate">تاريخ الصلاحية</label>
                <input
                  id="post-expiryDate"
                  className={styles.formInput}
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  required
                />
                {fieldErrors.ExpiryDate && (
                  <p className={styles.inputError}>{fieldErrors.ExpiryDate[0]}</p>
                )}
              </div>
            )}
            <div className={styles.formGroup} style={{ marginBottom: 0 }}></div>
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
              maxLength={1000}
              required
            />
            {(clientErrors.description || fieldErrors.Description) && (
              <p className={styles.inputError}>{clientErrors.description || fieldErrors.Description[0]}</p>
            )}
          </div>

          <button id="submit-post-btn" type="submit" className={styles.publishBtn}>
            {isEdit ? "حفظ التعديلات" : "نشر"}
          </button>
        </form>
      </div>
    </div>
  );
}
