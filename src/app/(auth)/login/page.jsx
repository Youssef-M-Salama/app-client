// app/auth/login/page.jsx
import React from 'react'
import LoginForm from '@/components/forms/LoginForm'
import authStyles from '@/styles/auth/auth.module.css'

export default function LoginPage() {
  return (
    <div className={authStyles.formContainer}>
      <div className={authStyles.formImage}>
        <img src="/login-image.jpg" alt="Login" className={authStyles.imgLogin} />
        <img src="/loginHandsImage.jpg" alt="" className={`${authStyles.imageOverlayBox} ${authStyles.imageOverlayBoxLogin}`}/>
        <p className={authStyles.firstWord}>We</p>
        <p className={authStyles.secondWord}>Trust</p> 
      </div>
      <LoginForm authStyles={authStyles} />
    </div>
  )
}