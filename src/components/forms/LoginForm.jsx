'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm({ authStyles }) {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const payload = await login(formData);
      const roleInt = Number(payload?.role);
      router.push(roleInt === 2 ? '/admin' : '/posts');
    } catch (error) {
      setErrorMessage(error.appMessage || 'حدث خطأ غير متوقع. حاول مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={authStyles.formContent}>

      {/* Heading */}
      <div className={authStyles.formHeading}>
        <h1 className={authStyles.formTitle}>تسجيل الدخول</h1>
        <p className={authStyles.formSubtitle}>مرحباً بعودتك!</p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div role="alert" className={authStyles.errorBanner}>
          <i className="fa-solid fa-circle-exclamation" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* Email */}
        <div className={authStyles.formField}>
          <label htmlFor="login-email">البريد الإلكتروني</label>
          <input
            id="login-email"
            type="text"
            name="usernameOrEmail"
            placeholder="eg. johnfrans@gmail.com"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            required
            autoComplete="username"
            dir="ltr"
            style={{ textAlign: 'left' }}
          />
        </div>

        {/* Password */}
        <div className={authStyles.formField}>
          <label htmlFor="login-password">الباسورد</label>
          <div className={authStyles.passwordWrapper}>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
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
          <span className={authStyles.fieldHint}>
            يجب أن يكون الباسورد من 3 أحرف على الأقل
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="login-submit"
          className={authStyles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>

      {/* Sign up link */}
      <p className={authStyles.forgotLink}>
        ليس لديك حساب؟{' '}
        <Link href="/register">إنشاء حساب</Link>
      </p>
    </div>
  );
}