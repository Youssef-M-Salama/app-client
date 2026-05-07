// app/(auth)/login/page.jsx
import React from 'react'
import Link from 'next/link'
import LoginForm from '@/components/forms/LoginForm'
import authStyles from '@/styles/auth/auth.module.css'

export default function LoginPage() {
  return (
    <>
      {/* Back button — absolute on card */}
      <Link href="/" className={authStyles.backButton} aria-label="العودة">
        <i className="fa-solid fa-chevron-left" />
      </Link>

      {/* Form — LEFT side */}
      <LoginForm authStyles={authStyles} />

      {/* Image — RIGHT side */}
      <div className={`${authStyles.formImage} ${authStyles.imageRight}`}>
        <img
          src="/login-image.jpg"
          alt=""
          className={authStyles.mainImage}
        />

        {/* وافر logo on image top-right */}
        <div className={authStyles.imageLogo}>
          <img src="/logo-white.png" alt="وافر" />
        </div>

        {/* "We Care" text overlay */}
        <div className={authStyles.imageOverlayText}>
          <span className={authStyles.overlayFirstWord}>We</span>
          <span className={authStyles.overlaySecondWord}>Care</span>
        </div>
      </div>
    </>
  )
}