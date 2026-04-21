// app/auth/register/page.jsx
import React from 'react'
import RegisterForm from '@/components/forms/RegisterForm'
import authStyles from '@/styles/auth/auth.module.css'   // common styles
import regStyles from '@/styles/auth/register.module.css' // radio styles

export default function RegisterPage() {
  return (
    <div className={authStyles.formContainer}>
      <RegisterForm authStyles={authStyles} regStyles={regStyles} />
      <div className={authStyles.formImage}>
        <img src="/signup-image.jpg" alt="Signup" className={authStyles.imgRegister} />
        <img src="/carBag.jpg" alt="" className={authStyles.imageOverlayBox} />
        <p className={authStyles.firstWord}>We</p>
        <p className={authStyles.secondWord}>Care</p>
      </div>
    </div>
  )
}