"use client";

import React, { useState, useEffect } from 'react';
import ProfileBanner from '@/components/cards/ProfileBanner';
import ProfileForm from '@/components/forms/ProfileForm';
import VerificationForm from '@/components/forms/VerificationForm';
import profileService from '@/services/profileService';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import styles from '@/styles/profile/ProfilePage.module.css';

export default function ProfilePage() {
  const { role } = useAuth();
  const { showToast, showAlert } = useAlert();

  // ── Profile state ──────────────────────────────────────────────
  const [profile, setProfile]       = useState(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [fetchError, setFetchError] = useState('');

  // ── Save / Upload state ────────────────────────────────────────
  const [isSaving, setIsSaving]       = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // ── Fetch profile on mount ─────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setFetchError('');
      try {
        const res  = await profileService.getProfile();
        const data = res?.data || res;
        setProfile(data);

        // Keep local storage user object synced for the global VerificationBanner
        if (data) {
          try {
            const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
            let updated = false;
            
            if (typeof data.verifyMyAccount === 'boolean') {
              cachedUser.verifyMyAccount = data.verifyMyAccount;
              updated = true;
            }
            if (data.verificationState !== undefined) {
              cachedUser.verificationState = data.verificationState;
              updated = true;
            }
            
            if (updated) {
              localStorage.setItem('user', JSON.stringify(cachedUser));
            }
          } catch (e) { console.error(e); }
        }
      } catch (err) {
        setFetchError(err.appMessage || 'فشل تحميل الملف الشخصي.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Image upload ───────────────────────────────────────────────
  const handleImageSelect = async (file) => {
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('Image', file);          // field name MUST be 'Image' per API docs
      const res  = await profileService.updateImage(fd);
      const data = res?.data || res;
      // Update local imageUrl if the API returns one
      const newUrl =
        data?.imageUrl ||
        data?.ImageUrl ||
        data?.profileImageUrl ||
        null;
      if (newUrl) {
        setProfile(prev => ({ ...prev, imageUrl: newUrl }));
      }
      showToast('تم تحديث الصورة بنجاح', 'success');
    } catch (err) {
      showAlert(
        'خطأ في الصورة',
        err.appMessage || 'تأكد من صيغة الملف وأن حجمه لا يتجاوز 2 ميجابايت.',
        'error'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ── Profile info update ────────────────────────────────────────
  // Called from ProfileForm; passes back setters so form can show field errors
  const handleProfileSave = async (payload, setFieldErrors, setGeneralError) => {
    setIsSaving(true);
    try {
      await profileService.updateProfile(payload);
      setProfile(prev => ({ ...prev, ...payload }));
      showToast('تم حفظ التغييرات بنجاح', 'success');
    } catch (err) {
      if (err.validationErrors) {
        setFieldErrors(err.validationErrors);
      } else {
        setGeneralError(err.appMessage || 'حدث خطأ أثناء الحفظ.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.card} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
          جاري تحميل الملف الشخصي...
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className={styles.container}>
        <div className={styles.card} style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
          <p>{fetchError}</p>
          <button
            style={{ marginTop: 12, padding: '8px 20px', background: '#6F2DBD', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            onClick={() => window.location.reload()}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        {/* ── Profile image banner ── */}
        <ProfileBanner
          imageUrl={profile?.imageUrl}
          isUploading={isUploading}
          onFileSelect={handleImageSelect}
        />

        {/* ── Editable form + change-password ── */}
        <div className={styles.content}>
          <ProfileForm
            profile={profile}
            isSaving={isSaving}
            onSave={handleProfileSave}
          />
        </div>

        {/* ── Verification Section ── */}
        {role !== 'Admin' && (
          <div className={styles.content} style={{ borderTop: '1px solid #eee' }}>
            <VerificationForm profile={profile} />
          </div>
        )}

      </div>
    </div>
  );
}
