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
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // AuthContext.login() returns the unwrapped payload: { role, token, userId, ... }
      const payload = await login(formData);

      // role is an integer in the payload: 0=Charity, 1=DonorOrganization, 2=Admin
      const roleInt = Number(payload?.role);

      if (roleInt === 2) {
        // Admin → go to admin dashboard
        router.push('/admin');
      } else {
        // Charity (0) or DonorOrganization (1) → go to main dashboard
        router.push('/posts');
      }
    } catch (error) {
      setErrorMessage(error.appMessage || 'حدث خطأ غير متوقع. حاول مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={authStyles.formContent}>
      <div className={authStyles.formHeading}>
        <h2 className={authStyles.formTitle}>تسجيل الدخول</h2>
        <p className={authStyles.formSubtitle}>ابدأ رحلتك الآن</p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            borderRadius: '8px',
            padding: '0.65rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Username or Email */}
        <div className={authStyles.formField}>
          <label htmlFor="login-usernameOrEmail">
            البريد الإلكتروني أو اسم المستخدم
          </label>
          <input
            id="login-usernameOrEmail"
            type="text"
            name="usernameOrEmail"
            placeholder="example@gmail.com أو username01"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div className={authStyles.formField}>
          <label htmlFor="login-password">كلمة المرور</label>
          <input
            id="login-password"
            type="password"
            name="password"
            placeholder="**********"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className={authStyles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>

      <p className={authStyles.linkText}>
        ليس لديك حساب؟ <Link href="/register">إنشاء حساب جديد</Link>
      </p>
    </div>
  );
}