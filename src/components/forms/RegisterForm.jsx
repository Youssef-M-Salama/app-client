'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import authService from '@/services/authService';

// ─── Validation Rules (mirror API constraints exactly) ───────────────────────
const RULES = {
  name: {
    required: true,
    min: 3,
    max: 200,
    label: 'الاسم الكامل',
  },
  username: {
    required: true,
    min: 3,
    max: 50,
    pattern: /^[a-zA-Z0-9_.]+$/,
    patternMsg: 'يجب أن يحتوي على أحرف إنجليزية وأرقام و _ و . فقط',
    label: 'اسم المستخدم',
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMsg: 'صيغة البريد الإلكتروني غير صحيحة',
    label: 'البريد الإلكتروني',
  },
  phone: {
    required: true,
    pattern: /^[0-9+\-\s()]{7,20}$/,
    patternMsg: 'رقم الهاتف غير صحيح',
    label: 'رقم الهاتف',
  },
  password: {
    required: true,
    min: 5,
    label: 'كلمة المرور',
  },
  confirmPassword: {
    required: true,
    label: 'تأكيد كلمة المرور',
  },
};

/** Validates a single field. Returns error string or null. */
function validateField(name, value, allValues) {
  const rule = RULES[name];
  if (!rule) return null;

  const val = typeof value === 'string' ? value.trim() : value;

  if (rule.required && !val) return `${rule.label} مطلوب`;
  if (!val) return null; // optional + empty → no error

  if (rule.min && val.length < rule.min)
    return `${rule.label} يجب أن يكون ${rule.min} أحرف على الأقل`;
  if (rule.max && val.length > rule.max)
    return `${rule.label} يجب ألا يتجاوز ${rule.max} حرف`;
  if (rule.pattern && !rule.pattern.test(val))
    return rule.patternMsg;

  if (name === 'confirmPassword' && val !== allValues.password)
    return 'كلمة المرور وتأكيدها غير متطابقتين';

  return null;
}

/** Validates all fields. Returns { fieldName: "error msg" | null } */
function validateAll(values) {
  const errors = {};
  Object.keys(RULES).forEach((name) => {
    errors[name] = validateField(name, values[name] ?? '', values);
  });
  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterForm({ authStyles, regStyles }) {
  const [values, setValues] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: 0,
  });

  // touched: which fields the user has interacted with (blur or submit attempt)
  const [touched, setTouched] = useState({});
  // clientErrors: from client-side validation
  const [clientErrors, setClientErrors] = useState({});
  // serverErrors: field errors returned by the API (400)
  const [serverErrors, setServerErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Helpers ──
  /** Get the visible error for a field (server wins over client) */
  const getError = useCallback(
    (name) => {
      if (!touched[name] && !Object.keys(serverErrors).length) return null;
      // Server error (PascalCase key lookup)
      const serverKey = Object.keys(serverErrors).find(
        (k) => k.toLowerCase() === name.toLowerCase()
      );
      if (serverKey) return serverErrors[serverKey]?.[0] ?? null;
      // Client error (only after touched)
      return touched[name] ? clientErrors[name] ?? null : null;
    },
    [touched, clientErrors, serverErrors]
  );

  /** True if field has a value and no error */
  const isValid = useCallback(
    (name) => {
      const val = values[name];
      if (!val || String(val).trim() === '') return false;
      return !getError(name);
    },
    [values, getError]
  );

  // ── Handlers ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValues = { ...values, [name]: value };
    setValues(newValues);

    // Live-validate this field once it has been touched
    if (touched[name]) {
      setClientErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, newValues),
      }));
    }

    // Clear server error for this field when user starts editing
    if (serverErrors[name] || Object.keys(serverErrors).some(
      (k) => k.toLowerCase() === name.toLowerCase()
    )) {
      const updated = { ...serverErrors };
      Object.keys(updated).forEach((k) => {
        if (k.toLowerCase() === name.toLowerCase()) delete updated[k];
      });
      setServerErrors(updated);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setClientErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, values),
    }));
  };

  const handleAccountTypeChange = (val) => {
    setValues((prev) => ({ ...prev, accountType: Number(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setServerErrors({});

    // Mark every field as touched to show all errors
    const allTouched = Object.fromEntries(Object.keys(RULES).map((k) => [k, true]));
    setTouched(allTouched);

    // Run full client validation
    const errors = validateAll(values);
    setClientErrors(errors);

    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) return; // stop — don't hit the API

    setIsLoading(true);
    try {
      await authService.register({
        accountType: values.accountType,
        name: values.name.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      setSuccess(true);
    } catch (error) {
      if (error.validationErrors) {
        // Map server field errors back to the form
        setServerErrors(error.validationErrors);
        // Re-touch all so errors are visible
        setTouched(allTouched);
      } else {
        setGeneralError(error.appMessage || 'حدث خطأ غير متوقع. حاول مجدداً.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Input class helper ──
  const inputClass = (name) => {
    const err = getError(name);
    const valid = isValid(name);
    if (err) return authStyles.inputError;
    if (valid) return authStyles.inputValid;
    return '';
  };

  // ─── Success Screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={authStyles.formContent}>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>✉️</div>
          <h2 className={authStyles.formTitle} style={{ fontSize: '28px' }}>
            تحقق من بريدك الإلكتروني
          </h2>
          <p style={{ color: '#555', marginTop: '0.75rem', lineHeight: 1.7, fontSize: '15px' }}>
            تم إنشاء حسابك بنجاح! أرسلنا رابط التحقق إلى{' '}
            <strong style={{ color: '#171123' }}>{values.email}</strong>.
            <br />
            يرجى النقر على الرابط لتفعيل حسابك.
          </p>
          <p style={{ color: '#999', fontSize: '13px', marginTop: '1rem', lineHeight: 1.6 }}>
            بعد التحقق من البريد الإلكتروني، تحتاج إلى انتظار موافقة الإدارة للوصول الكامل للمنصة.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-block',
              marginTop: '2rem',
              padding: '0.75rem 2rem',
              background: '#171123',
              color: '#fff',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '15px',
              transition: 'opacity 0.2s',
            }}
          >
            الذهاب لتسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  // ─── Register Form ─────────────────────────────────────────────────────────
  return (
    <div className={authStyles.formContent}>
      <div className={authStyles.formHeading}>
        <h2 className={authStyles.formTitle}>إنشاء حساب جديد</h2>
        <p className={authStyles.formSubtitle}>ابدأ رحلتك الآن</p>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div
          role="alert"
          style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            borderRadius: '10px',
            padding: '0.7rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          ⚠️ {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Row 1: Name + Username ── */}
        <div className={authStyles.firstLine}>
          {/* Name */}
          <div className={authStyles.formField}>
            <label htmlFor="reg-name">الاسم الكامل</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              placeholder="اسم الجمعية أو المؤسسة"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass('name')}
              autoComplete="organization"
            />
            {getError('name') && (
              <span className={authStyles.fieldError}>{getError('name')}</span>
            )}
          </div>

          {/* Username */}
          <div className={authStyles.formField}>
            <label htmlFor="reg-username">اسم المستخدم</label>
            <input
              id="reg-username"
              name="username"
              type="text"
              placeholder="charity_01"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass('username')}
              autoComplete="username"
              dir="ltr"
              style={{ textAlign: 'left' }}
            />
            {getError('username') && (
              <span className={authStyles.fieldError}>{getError('username')}</span>
            )}
          </div>
        </div>

        {/* ── Email ── */}
        <div className={authStyles.formField}>
          <label htmlFor="reg-email">البريد الإلكتروني</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            placeholder="example@gmail.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass('email')}
            autoComplete="email"
            dir="ltr"
            style={{ textAlign: 'left' }}
          />
          {getError('email') && (
            <span className={authStyles.fieldError}>{getError('email')}</span>
          )}
        </div>

        {/* ── Phone ── */}
        <div className={authStyles.formField}>
          <label htmlFor="reg-phone">رقم الهاتف</label>
          <input
            id="reg-phone"
            name="phone"
            type="tel"
            placeholder="01xxxxxxxxx"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass('phone')}
            autoComplete="tel"
            dir="ltr"
            style={{ textAlign: 'left' }}
          />
          {getError('phone') && (
            <span className={authStyles.fieldError}>{getError('phone')}</span>
          )}
        </div>

        {/* ── Row 2: Password + Confirm ── */}
        <div className={authStyles.firstLine}>
          {/* Password */}
          <div className={authStyles.formField}>
            <label htmlFor="reg-password">كلمة المرور</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder="5 أحرف على الأقل"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass('password')}
              autoComplete="new-password"
            />
            {getError('password') && (
              <span className={authStyles.fieldError}>{getError('password')}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className={authStyles.formField}>
            <label htmlFor="reg-confirmPassword">تأكيد كلمة المرور</label>
            <input
              id="reg-confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="أعد كتابة كلمة المرور"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass('confirmPassword')}
              autoComplete="new-password"
            />
            {getError('confirmPassword') && (
              <span className={authStyles.fieldError}>{getError('confirmPassword')}</span>
            )}
          </div>
        </div>

        {/* ── Account Type ── */}
        <div className={regStyles.radioSection}>
          <div className={regStyles.radioTitle}>التسجيل ك:</div>
          <div className={regStyles.radioLine}>
            <label className={regStyles.radioLabel}>
              <input
                type="radio"
                name="accountType"
                value={0}
                checked={values.accountType === 0}
                onChange={() => handleAccountTypeChange(0)}
              />
              <span>جمعية خيرية</span>
            </label>
            <label className={regStyles.radioLabel}>
              <input
                type="radio"
                name="accountType"
                value={1}
                checked={values.accountType === 1}
                onChange={() => handleAccountTypeChange(1)}
              />
              <span>مؤسسة مانحة (مطاعم، شركات، محلات ملابس ...)</span>
            </label>
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          className={authStyles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{
                width: '16px', height: '16px',
                border: '2px solid rgba(255,255,255,0.4)',
                borderTop: '2px solid #fff',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }} />
              جاري الإنشاء...
            </span>
          ) : 'إنشاء حساب'}
        </button>

        {/* CSS for spinner inside button */}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>

      <p className={authStyles.linkText}>
        لديك حساب بالفعل؟{' '}
        <Link href="/login">تسجيل الدخول</Link>
      </p>
    </div>
  );
}