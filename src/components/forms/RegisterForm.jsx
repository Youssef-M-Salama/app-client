import React from 'react'

export default function RegisterForm({ authStyles, regStyles }) {
  return (
    <div className={authStyles.formContent}>
      <div className={authStyles.formHeading}>
        <h2 className={authStyles.formTitle}>إنشاء حساب جديد</h2>
        <p className={authStyles.formSubtitle}>ابدأ رحلتك الآن</p>
      </div>

      <div className={authStyles.firstLine}>
        <div className={authStyles.formField}>
          <label>الاسم الكامل</label>
          <input type="text" placeholder="وبنسون هيستك" />
        </div>
        <div className={authStyles.formField}>
          <label>اسم المستخدم</label>
          <input type="text" placeholder="هيستك.01" />
        </div>
      </div>

      <div className={authStyles.formField}>
        <label>البريد الإلكتروني</label>
        <input type="email" placeholder="example@gmail.com" />
      </div>

      <div className={authStyles.formField}>
        <label>الباسورد</label>
        <input type="password" placeholder="**********" />
      </div>

      {/* Register-specific radio section */}
      <div className={regStyles.radioSection}>
        <div className={regStyles.radioTitle}>التسجيل ك:</div>
        <div className={regStyles.radioLine}>
          <label className={regStyles.radioLabel}>
            <input type="radio" name="accountType" value="charity" defaultChecked />
            <span>جمعية خيرية</span>
          </label>
          <label className={regStyles.radioLabel}>
            <input type="radio" name="accountType" value="productive" />
            <span>مؤسسة إنتاجية (مطاعم، شركات، محلات ملابس و غيرهم ....)</span>
          </label>
        </div>
      </div>

      <button className={authStyles.submitBtn}>إنشاء حساب</button>

      <p className={authStyles.linkText}>
        لديك حساب بالفعل؟ <a href="/login">تسجيل الدخول</a>
      </p>
    </div>
  )
}