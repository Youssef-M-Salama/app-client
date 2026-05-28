// app/(auth)/register/page.jsx
import React from 'react'
import Link from 'next/link'
import RegisterForm from '@/components/forms/RegisterForm'
import authStyles from '@/styles/auth/auth.module.css'
import regStyles from '@/styles/auth/register.module.css'

const STEPS = [
  'قم بالتسجيل في حسابك',
  'تحقق من عنوان بريدك الإلكتروني',
  'أكمل البيانات الأساسية وتوثيق الحساب',
  'استمتع برحلتك',
]

export default function RegisterPage() {
  return (
    <>
      {/* Back button — absolute on card */}
      <Link href="/" className={authStyles.backButton} aria-label="العودة">
        <i className="fa-solid fa-chevron-left" />
      </Link>

      {/* Image — LEFT side */}
      <div className={`${authStyles.formImage} ${authStyles.imageLeft}`}>
        <img
          src="/signup-image.jpg"
          alt=""
          className={authStyles.mainImage}
        />

        {/* وافر branding in the center of the image */}
        <div className={authStyles.registerBrand}>
          <Link href="/" className={authStyles.registerBrandLogo}>
            <img src="/logo-white.png" alt="وافر" />
          </Link>
          <div className={authStyles.registerBrandSubtitle}>ابدأ رحلتك هنـا</div>
        </div>

        {/* Steps panel at the bottom */}
        <div className={authStyles.stepsPanel}>
          {STEPS.map((step, i) => (
            <div key={i} className={authStyles.stepItem}>
              <span>{step}</span>
              <span className={authStyles.stepNumber}>{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form — RIGHT side */}
      <RegisterForm authStyles={authStyles} regStyles={regStyles} />
    </>
  )
}