'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import authService from '@/services/authService';

// ─── Validation Rules ─────────────────────────────────────────────────────────
const RULES = {
  name: {
    required: true,
    min: 3,
    max: 200,
    label: 'اسم المنظمه',
  },

  username: {
    required: true,
    min: 3,
    max: 50,
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
    // Matches both 01XXXXXXXXX (11 digits) and 1XXXXXXXXX (10 digits)
    // Same regex the API uses — keeps client & server in sync.
    pattern: /^(01[0125][0-9]{8}|1[0125][0-9]{8})$/,
    patternMsg: 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)',
    label: 'رقم الهاتف',
  },

  password: {
    required: true,
    min: 3,
    label: 'كلمة المرور',
  },

  confirmPassword: {
    required: true,
    min: 1,
    label: 'تأكيد كلمة المرور',
  },
};

function validateField(name, value, allValues = {}) {
  const rule = RULES[name];

  if (!rule) return null;

  const val = typeof value === 'string' ? value.trim() : value;

  if (rule.required && !val) return `${rule.label} مطلوب`;

  if (!val) return null;

  if (rule.min && val.length < rule.min)
    return `${rule.label} يجب أن يكون ${rule.min} أحرف على الأقل`;

  if (rule.max && val.length > rule.max)
    return `${rule.label} يجب ألا يتجاوز ${rule.max} حرف`;

  if (rule.pattern && !rule.pattern.test(val))
    return rule.patternMsg;

  if (
    name === 'confirmPassword' &&
    val !== (allValues.password ?? '').trim()
  ) {
    return 'كلمة المرور وتأكيدها غير متطابقتين';
  }

  return null;
}

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [touched, setTouched] = useState({});
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Error helpers ─────────────────────────────────────────────────────────

  /**
   * getError: returns the most relevant error for a field.
   *
   * Priority:
   *   1. Server error (always shown once server has responded)
   *   2. Client error (only shown after the field has been touched)
   *
   * Server keys come back as PascalCase (e.g. "ConfirmPassword", "Email").
   * We compare case-insensitively to match our camelCase field names.
   */
  const getError = useCallback(
    (name) => {
      // Check for a matching server-side error first
      const serverKey = Object.keys(serverErrors).find(
        (k) => k.toLowerCase() === name.toLowerCase()
      );

      if (serverKey) {
        return serverErrors[serverKey]?.[0] ?? null;
      }

      // Fall back to client validation error, but only if the field was touched
      if (touched[name]) {
        return clientErrors[name] ?? null;
      }

      return null;
    },
    [touched, clientErrors, serverErrors]
  );

  const isValid = useCallback(
    (name) => {
      const val = values[name];
      if (!val || String(val).trim() === '') return false;
      return !getError(name);
    },
    [values, getError]
  );

  const inputClass = (name) => {
    const err = getError(name);
    const valid = isValid(name);
    if (err) return authStyles.inputError;
    if (valid) return authStyles.inputValid;
    return '';
  };

  // ── Change / blur handlers ────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    const newValues = { ...values, [name]: value };
    setValues(newValues);

    // Re-validate this field if already touched
    if (touched[name]) {
      setClientErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, newValues),
      }));
    }

    // When password changes, re-validate confirmPassword if it was touched
    if (name === 'password' && touched['confirmPassword']) {
      setClientErrors((prev) => ({
        ...prev,
        confirmPassword: validateField(
          'confirmPassword',
          newValues.confirmPassword,
          newValues
        ),
      }));
    }

    // Clear the matching server error for this field when the user edits it
    if (
      Object.keys(serverErrors).some(
        (k) => k.toLowerCase() === name.toLowerCase()
      )
    ) {
      const updated = { ...serverErrors };
      Object.keys(updated).forEach((k) => {
        if (k.toLowerCase() === name.toLowerCase()) delete updated[k];
      });
      setServerErrors(updated);
    }

    // Also clear the general error banner when the user starts correcting
    if (generalError) setGeneralError('');
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

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    setGeneralError('');
    setServerErrors({});

    // Touch all fields to surface any untouched validation errors
    const allTouched = Object.fromEntries(
      Object.keys(RULES).map((k) => [k, true])
    );
    setTouched(allTouched);

    const errors = validateAll(values);
    setClientErrors(errors);

    if (Object.values(errors).some(Boolean)) return;

    setIsLoading(true);

    try {
      await authService.register({
        accountType: values.accountType,    // 0 or 1 — already a number
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
        /*
         * validationErrors is set by apiClient for:
         *   - 400 with a structured errors object (FluentValidation / ModelState)
         *   - 409 conflict (apiClient maps "username taken" / "email taken"
         *     to { Username: [...] } or { Email: [...] } so they show inline)
         */
        setServerErrors(error.validationErrors);
        setTouched(allTouched); // ensure all fields check server errors

        // Also show a general message above the form for context
        if (error.appMessage) setGeneralError(error.appMessage);

      } else {
        // Network error, 500, or a 409 that couldn't be mapped to a field
        setGeneralError(
          error.appMessage || 'حدث خطأ غير متوقع. حاول مجدداً.'
        );
      }

    } finally {
      setIsLoading(false);
    }
  };

  // ─── Success Screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className={authStyles.formContent}>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>
            <i className="fa-solid fa-envelope" style={{ color: '#171123' }} />
          </div>

          <h2 className={authStyles.formTitle} style={{ fontSize: '28px' }}>
            تحقق من بريدك الإلكتروني
          </h2>

          <p style={{ color: '#555', marginTop: '0.75rem', lineHeight: 1.7, fontSize: '15px' }}>
            تم إنشاء حسابك بنجاح! أرسلنا رابط التحقق إلى{' '}
            <strong style={{ color: '#171123' }}>{values.email}</strong>
            <br />
            يرجى النقر على الرابط لتفعيل حسابك.
          </p>

          <p style={{ color: '#999', fontSize: '13px', marginTop: '1rem', lineHeight: 1.6 }}>
            بعد التحقق من البريد الإلكتروني، تحتاج إلى انتظار موافقة الإدارة
            للوصول الكامل للمنصة.
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
              fontWeight: 700,
              fontSize: '15px',
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

      {/* Heading */}
      <div className={authStyles.formHeading}>
        <h1 className={authStyles.formTitle}>إنشاء حساب جديد</h1>
        <p className={authStyles.formSubtitle}>ابدأ رحلتك الآن</p>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div role="alert" className={authStyles.errorBanner}>
          <i className="fa-solid fa-triangle-exclamation" />
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* Name + Username */}
        <div className={authStyles.firstLine}>

          <div className={authStyles.formField}>
            <label htmlFor="reg-name">اسم المنظمه</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              placeholder="مصر الخير"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass('name')}
            />
            {getError('name') && (
              <span className={authStyles.fieldError}>{getError('name')}</span>
            )}
          </div>

          <div className={authStyles.formField}>
            <label htmlFor="reg-username">اسم المستخدم</label>
            <input
              id="reg-username"
              name="username"
              type="text"
              placeholder="مصر_الخير_011"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass('username')}
            />
            {getError('username') && (
              <span className={authStyles.fieldError}>{getError('username')}</span>
            )}
          </div>
        </div>

        {/* Email */}
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
          />
          {getError('email') && (
            <span className={authStyles.fieldError}>{getError('email')}</span>
          )}
        </div>

        {/* Phone */}
        <div className={authStyles.formField}>
          <label htmlFor="reg-phone">رقم الهاتف</label>
          <input
            id="reg-phone"
            name="phone"
            type="tel"
            placeholder="01012345678"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass('phone')}
          />
          {getError('phone') && (
            <span className={authStyles.fieldError}>{getError('phone')}</span>
          )}
        </div>

        {/* Passwords */}
        <div className={authStyles.firstLine}>

          {/* Password */}
          <div className={authStyles.formField}>
            <label htmlFor="reg-password">كلمة المرور</label>
            <div className={authStyles.passwordWrapper}>
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••••"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass('password')}
              />
              <button
                type="button"
                className={authStyles.eyeToggle}
                onClick={() => setShowPassword((v) => !v)}
              >
                <i className={showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'} />
              </button>
            </div>
            {getError('password') && (
              <span className={authStyles.fieldError}>{getError('password')}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className={authStyles.formField}>
            <label htmlFor="reg-confirmPassword">تأكيد كلمة المرور</label>
            <div className={authStyles.passwordWrapper}>
              <input
                id="reg-confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••••••••"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass('confirmPassword')}
              />
              <button
                type="button"
                className={authStyles.eyeToggle}
                onClick={() => setShowConfirm((v) => !v)}
              >
                <i className={showConfirm ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'} />
              </button>
            </div>
            {getError('confirmPassword') && (
              <span className={authStyles.fieldError}>{getError('confirmPassword')}</span>
            )}
          </div>
        </div>

        {/* Account Type */}
        <div className={authStyles.accountTypeSection}>
          <div style={{ position: 'relative' }}>
            <span className={authStyles.accountTypeTitle}>التسجيل ك:</span>
            <div className={authStyles.accountTypeInner}>

              <label className={authStyles.checkboxLabel}>
                <input
                  type="radio"
                  name="accountType"
                  value={0}
                  checked={values.accountType === 0}
                  onChange={() => handleAccountTypeChange(0)}
                />
                <span>جمعية خيرية</span>
              </label>

              <label className={authStyles.checkboxLabel}>
                <input
                  type="radio"
                  name="accountType"
                  value={1}
                  checked={values.accountType === 1}
                  onChange={() => handleAccountTypeChange(1)}
                />
                <span>مؤسسة إنتاجية (مطاعم، شركات، محلات ملابس ...)</span>
              </label>

            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="reg-submit"
          className={authStyles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                  display: 'inline-block',
                }}
              />
              جاري الإنشاء...
            </span>
          ) : (
            'إنشاء حساب'
          )}
        </button>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>

      </form>

      <p className={authStyles.linkText}>
        لديك حساب بالفعل؟{' '}
        <Link href="/login">تسجيل الدخول</Link>
      </p>

    </div>
  );
}