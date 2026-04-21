import React from 'react';

export default function LoginForm({ authStyles }) {
  return (
    <div className={authStyles.formContent}>
      <div className={authStyles.formHeading}>
        <h2 className={authStyles.formTitle}>تسجيل الدخول</h2>
        <p className={authStyles.formSubtitle}>ابدأ رحلتك الآن</p>
      </div>

      <div className={authStyles.formField}>
        <label>البريد الإلكتروني</label>
        <input type="email" placeholder="example@gmail.com" />
      </div>

      <div className={authStyles.formField}>
        <label>الباسورد</label>
        <input type="password" placeholder="**********" />
      </div>

      <button className={authStyles.submitBtn}>تسجيل الدخول</button>

      <p className={authStyles.linkText}>
        نسيت الباسورد؟ <a href="/auth/forgot-password">إعادة تعيين</a>
      </p>
    </div>
  );
}