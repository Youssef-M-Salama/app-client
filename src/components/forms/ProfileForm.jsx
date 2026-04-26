import React from 'react';
import styles from '@/styles/profile/ProfileForm.module.css';

export default function ProfileForm({ profile, onChange, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      
      <div className={styles.formRow}>
        
        <div className={styles.formField}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder=" "
              value={profile.orgName}
              onChange={e => onChange('orgName', e.target.value)}
            />
            <label>اسم الجمعية</label>
          </div>
        </div>

        <div className={styles.formField}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder=" "
              value={profile.username}
              onChange={e => onChange('username', e.target.value)}
            />
            <label>اسم المستخدم</label>
          </div>
        </div>

      </div>

      <div className={styles.formRow}>
        
        <div className={styles.formField}>
          <div className={styles.inputWrapper}>
            <input
              type="email"
              placeholder=" "
              value={profile.email}
              onChange={e => onChange('email', e.target.value)}
            />
            <label>البريد الإلكتروني</label>
          </div>
        </div>

        <div className={styles.formField}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder=" "
              value={profile.phone}
              onChange={e => onChange('phone', e.target.value)}
            />
            <label>رقم الجوال</label>
          </div>
        </div>

      </div>

      <div className={styles.formField}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder=" "
            value={profile.address}
            onChange={e => onChange('address', e.target.value)}
          />
          <label>العنوان</label>
        </div>
      </div>

      <div className={styles.formField}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder=" "
            value={profile.description}
            onChange={e => onChange('description', e.target.value)}
          />
          <label>وصف الجمعية</label>
        </div>
      </div>

      <button type="submit" className={styles.submitBtn}>
        حفظ التغييرات
      </button>

    </form>
  );
}