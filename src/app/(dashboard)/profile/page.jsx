"use client";

import React, { useState } from 'react';
import ProfileBanner from '@/components/cards/ProfileBanner';
import ProfileForm from '@/components/forms/ProfileForm';
import styles from '@/styles/profile/ProfilePage.module.css';

const MOCK_PROFILE = {
  orgName: 'جمعية مصر الخير',
  username: 'مصر_الخير_011',
  email: 'example@gmail.com',
  phone: '010 xxxx xxxx',
  address: 'مقر 79 - التجمع الخامس - القاهرة',
  imageUrl: '/mock-profile-image.png', // Placeholder image path
  description:'جمعيه خاصه بالتكفبل بالغذاء'
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(MOCK_PROFILE);

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleEditImage = () => {
    // TODO: Implement image upload logic
    alert('تعديل الصورة');
  };

  const handleDeleteImage = () => {
    // TODO: Implement image delete logic
    alert('حذف الصورة');
  };

  const handleSubmit = () => {
    // TODO: Implement save profile logic
    alert('حفظ التغييرات');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <ProfileBanner
          imageUrl={profile.imageUrl}
          onEdit={handleEditImage}
          onDelete={handleDeleteImage}
        />
        <div className={styles.content}>
          <ProfileForm 
            profile={profile} 
            onChange={handleProfileChange}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
