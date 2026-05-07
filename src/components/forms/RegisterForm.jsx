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
    label: 'الاسم الكامل',
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
  password: {
    required: true,
    min: 5,
    label: 'الباسورد',
  },
};

function validateField(name, value) {
  const rule = RULES[name];
  if (!rule) return null;
  const val = typeof value === 'string' ? value.trim() : value;
  if (rule.required && !val) return `${rule.label} مطلوب`;
  if (!val) return null;
  if (rule.min && val.length < rule.min)
    return `${rule.label} يجب أن يكون ${rule.min} أحرف على الأقل`;
  if (rule.max && val.length > rule.max)
    return `${rule.label} يجب ألا يتجاوز ${rule.max} حرف`;
  if (rule.pattern && !rule.pattern.test(val)) return rule.patternMsg;
  return null;
}

function validateAll(values) {
  const errors = {};
  Object.keys(RULES).forEach((name) => {
    errors[name] = validateField(name, values[name] ?? '');
  });
  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterForm({ authStyles, regStyles }) {
  const [values, setValues] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    accountType: 0,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Helpers ──
  const getError = useCallback(
    (name) => {
      if (!touched[name] && !Object.keys(serverErrors).length) return null;
      const serverKey = Object.keys(serverErrors).find(
        (k) => k.toLowerCase() === name.toLowerCase()
      );
      if (serverKey) return serverErrors[serverKey]?.[0] ?? null;
      return touched[name] ? clientErrors[name] ?? null : null;
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

  // ── Handlers ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValues = { ...values, [name]: value };
    setValues(newValues);
    if (touched[name]) {
      setClientErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
    // clear matching server error
    if (Object.keys(serverErrors).some((k) => k.toLowerCase() === name.toLowerCase())) {
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
    setClientErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleAccountTypeChange = (val) => {
    setValues((prev) => ({ ...prev, accountType: Number(val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setServerErrors({});

    const allTouched = Object.fromEntries(Object.keys(RULES).map((k) => [k, true]));
    setTouched(allTouched);

    const errors = validateAll(values);
    setClientErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setIsLoading(true);
    try {
      await authService.register({
        accountType: values.accountType,
        name: values.name.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        // confirmPassword mirrors password so backend validation passes
        confirmPassword: values.password,
      });
      setSuccess(true);
    } catch (error) {
      if (error.validationErrors) {
        setServerErrors(error.validationErrors);
        setTouched(allTouched);
      } else {
        setGeneralError(error.appMessage || 'حدث خطأ غير متوقع. حاول مجدداً.');
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

      {/* Social buttons */}
      <div className={authStyles.socialRow}>
        <button type="button" className={authStyles.socialBtn} id="reg-google">
          {/* Google SVG icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>
        <button type="button" className={`${authStyles.socialBtn} ${authStyles.socialBtnGithub}`} id="reg-github">
          <i className="fa-brands fa-github" />
          Github
        </button>
      </div>

      {/* Divider */}
      <div className={authStyles.divider}>أو</div>

      {/* General Error Banner */}
      {generalError && (
        <div role="alert" className={authStyles.errorBanner}>
          <i className="fa-solid fa-triangle-exclamation" />
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* Row: Name + Username */}
        <div className={authStyles.firstLine}>
          <div className={authStyles.formField}>
            <label htmlFor="reg-name">الاسم الكامل</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              placeholder="ولسون فيسك"
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

          <div className={authStyles.formField}>
            <label htmlFor="reg-username">اسم المستخدم</label>
            <input
              id="reg-username"
              name="username"
              type="text"
              placeholder="فيسك_011"
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

        {/* Email */}
        <div className={authStyles.formField}>
          <label htmlFor="reg-email">البريد الإلكتروني</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            placeholder="eg. johnfrans@gmail.com"
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

        {/* Password */}
        <div className={authStyles.formField}>
          <label htmlFor="reg-password">الباسورد</label>
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
              autoComplete="new-password"
            />
            <button
              type="button"
              className={authStyles.eyeToggle}
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              <i className={showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'} />
            </button>
          </div>
          {getError('password') && (
            <span className={authStyles.fieldError}>{getError('password')}</span>
          )}
          {!getError('password') && (
            <span className={authStyles.fieldHint}>
              يجب أن يكون الباسورد من 8 أحرف على الأقل
            </span>
          )}
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

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>

      <p className={authStyles.linkText}>
        لديك حساب بالفعل؟{' '}
        <Link href="/login">تسجيل الدخول</Link>
      </p>
    </div>
  );
}