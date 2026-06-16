'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import offersService from '@/services/offersService';
import charityNeedsService from '@/services/charityNeedsService';
import apiClient from '@/services/apiClient';
import { mapUnit } from '@/utils/enumMapper';
import '@/styles/mobile-home.css';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = apiClient.defaults.baseURL;
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function MobileHome() {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();

  const [offers, setOffers] = useState([]);
  const [needs, setNeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCharities: 0,
    totalDonors: 0,
    activeCharityNeeds: 0,
    activeOffers: 0,
    totalDoneDonation: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const offersRes = await offersService.getPublicOffers({ Page: 1, PageSize: 4 });
        const offersPayload = offersRes.data || offersRes.Data || [];
        setOffers(Array.isArray(offersPayload) ? offersPayload : (offersPayload.items || offersPayload.Items || []));

        const needsRes = await charityNeedsService.getPublicCharityNeeds({ Page: 1, PageSize: 4 });
        const needsPayload = needsRes.data || needsRes.Data || [];
        setNeeds(Array.isArray(needsPayload) ? needsPayload : (needsPayload.items || needsPayload.Items || []));

        try {
          const statsRes = await apiClient.get('/api/v1/public/statistics');
          if (statsRes.data?.data) setStats(statsRes.data.data);
          else if (statsRes.data) setStats(statsRes.data);
        } catch (e) {
          console.error('Error fetching stats:', e);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const SkeletonCard = () => (
    <div className='mCard'>
      <div className='mCardImgSkeleton' />
      <div className='mCardBody'>
        <div className='mCardOrgSkeleton' />
        <div className='mCardTextSkeleton'>
          <div className='mCardTextLine' style={{ width: '90%' }} />
          <div className='mCardTextLine' style={{ width: '75%' }} />
          <div className='mCardTextLine' style={{ width: '60%' }} />
        </div>
        <div className='mCardDateSkeleton' />
      </div>
    </div>
  );

  return (
    <div className='mobileHome'>

      {/* ── Hero ── */}
      <section className='mHero'>
        <div className='mHeroContent'>
          <h1 className='mHeroTitle'>
            ابـــدأ<br />رحلـتـك
          </h1>
          {!isAuthenticated ? (
            <button className='mHeroBtn' onClick={() => router.push('/register')}>
              <span>مـن هـنـا......</span>
              <div className='mHeroArrow'>
                <Image src="/arrow-right.png" alt="arrow" width={18} height={18} />
              </div>
            </button>
          ) : (
            <Link href='/browse' className='mHeroBtnLink'>
              تصفّح المنشورات
            </Link>
          )}
        </div>
      </section>

      {/* ── Glass Info Strip ── */}
      <div className='mGlassStrip'>
        <div className='mGlassCard'>
          <Image src="/Vector.png" alt="icon" width={18} height={12} />
          <span>يمكنك التسجيل كـ جمعية خيرية أو مؤسسة إنتاجية</span>
        </div>
        <div className='mGlassCard'>
          <Image src="/Clip-path-group-6.png" alt="icon" width={20} height={20} />
          <span>جميع المؤسسات والجمعيات موثقة رسمياً</span>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className='mStats'>
        <div className='mStatItem'>
          <Image src="/Vector-3.png" alt="stat" width={16} height={16} />
          <span className='mStatNumber'>{stats.totalCharities}+</span>
          <span className='mStatLabel'>جمعية خيرية</span>
        </div>
        <div className='mStatDivider' />
        <div className='mStatItem'>
          <Image src="/Clip-path-group-8.png" alt="stat" width={18} height={18} />
          <span className='mStatNumber'>{stats.totalDonors}+</span>
          <span className='mStatLabel'>مؤسسة إنتاجية</span>
        </div>
        <div className='mStatDivider' />
        <div className='mStatItem'>
          <Image src="/Clip-path-group-9.png" alt="stat" width={16} height={16} />
          <span className='mStatNumber'>{stats.totalDoneDonation}+</span>
          <span className='mStatLabel'>تبرع منجز</span>
        </div>
      </div>

      {/* ── Charity Needs ── */}
      <section className='mSection'>
        <h2 className='mSectionTitle'>بعض منشورات الجمعيات الخيرية</h2>
        <div className='mCardsList'>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`ns-${i}`} />)
            : needs.map((need, index) => {
                const rawImg = need.productImage || need.imageUrl || need.image;
                const imgSrc = getImageUrl(rawImg) || '/card-1.png';
                const orgName = need.charityName || need.organizationName || 'جمعية خيرية';
                const date = need.createdAt
                  ? new Date(need.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '';
                return (
                  <div className='mCard' key={need.id || index}>
                    <img src={imgSrc} alt={orgName} className='mCardImg' />
                    <div className='mCardBody'>
                      <span className='mCardOrg'>{orgName}</span>
                      <p className='mCardText'>
                        {need.description || 'يبحثون عن تبرعات'}
                        {need.productName && <><br />{need.productName}</>}
                        <br />الكمية المطلوبة: {need.quantity} {mapUnit(need.unit)}
                      </p>
                      {!isAuthenticated ? (
                        <Link href='/register' className='mCardLink'>
                          ......اشترك معنا لتقدر علي أن تساهم في مثل هذا
                        </Link>
                      ) : role !== 'Admin' ? (
                        <Link href='/browse' className='mCardLink'>
                          ......اذهب إلى التصفح للمزيد
                        </Link>
                      ) : null}
                      {date && <span className='mCardDate'>{date}</span>}
                    </div>
                  </div>
                );
              })}
        </div>
      </section>

      {/* ── Offers ── */}
      <section className='mSection'>
        <h2 className='mSectionTitle'>بعض منشورات المؤسسات الإنتاجية</h2>
        <div className='mCardsList'>
          {isLoading
            ? Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={`os-${i}`} />)
            : offers.map((offer, index) => {
                const rawImg = offer.productImage || offer.imageUrl || offer.image;
                const imgSrc = getImageUrl(rawImg) || '/main-post.png';
                const orgName = offer.donorOrganizationName || offer.organizationName || 'مؤسسة إنتاجية';
                const date = offer.createdAt
                  ? new Date(offer.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '';
                return (
                  <div className='mCard' key={offer.id || index}>
                    <img src={imgSrc} alt={orgName} className='mCardImg' />
                    <div className='mCardBody'>
                      <span className='mCardOrg'>{orgName}</span>
                      <p className='mCardText'>
                        متوفر كمية فائضة من {offer.productName} ({offer.quantity} {mapUnit(offer.unit)})
                        <br />صالحة حتى: {offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                        <br />مدة العرض: الكمية متواجدة إلى حين تواصل مؤسسة خيرية
                      </p>
                      {!isAuthenticated ? (
                        <Link href='/register' className='mCardLink'>
                          ......اشترك معنا لتقدر علي أن تساهم في مثل هذا
                        </Link>
                      ) : role !== 'Admin' ? (
                        <Link href='/browse' className='mCardLink'>
                          ......اذهب إلى التصفح للمزيد
                        </Link>
                      ) : null}
                      {date && <span className='mCardDate'>{date}</span>}
                    </div>
                  </div>
                );
              })}
        </div>
      </section>

      {/* ── CTA (unauthenticated only) ── */}
      {!isAuthenticated && (
        <div className='mCta'>
          <h3 className='mCtaTitle'>سارع الآن بالتسجيل !</h3>
          <p className='mCtaSub'>
            و كن جزءاً من مجتمع <strong>وَافِر</strong> الكبير
          </p>
          <Link href='/register' className='mCtaBtn'>
            اشـترك الآن
          </Link>
          <Image src="/frame-275.png" alt="community" width={220} height={220} style={{ borderRadius: 16, objectFit: 'cover' }} />
        </div>
      )}

      {/* ── Footer ── */}
      <footer className='mFooter'>
        <div className='mFooterTop'>
          <Image src='/logo-white.png' alt='وافر' width={120} height={42} />
        </div>

        <div className='mSubscribe'>
          <span className='mSubscribeLabel'>اشترك الآن</span>
          <div className='mSubscribeRow'>
            <input type='email' className='mSubscribeInput' placeholder='example@gmail.com' />
            <button className='mSubscribeBtn'>اشتراك</button>
          </div>
          <span className='mSubscribeTxt'>
            بالضغط على زر الاشتراك، فإنك تؤكد أنك قرأت ووافقت على شروط الاستخدام.
          </span>
        </div>

        <div className='mFooterLinks'>
          <a href="https://aboutwafer.netlify.app" target="_blank" rel="noopener noreferrer" className='mFooterLinkRow' style={{ textDecoration: 'none', color: 'inherit' }}>
            <Image src='/ellipse-41.png' alt='' width={12} height={12} />
            <span className='mFooterLink'>من نحن</span>
          </a>
          <div className='mFooterLinkRow'>
            <Image src='/ellipse-41.png' alt='' width={12} height={12} />
            <span className='mFooterLink'>تواصل معنا</span>
          </div>
        </div>

        <div className='mFooterSocial'>
          <Image src='/facebook.png' alt='facebook' width={22} height={22} style={{ cursor: 'pointer' }} />
          <Image src='/x.png' alt='X' width={18} height={20} style={{ cursor: 'pointer' }} />
          <Image src='/instagram.png' alt='instagram' width={18} height={18} style={{ cursor: 'pointer' }} />
          <Image src='/youtube.png' alt='youtube' width={22} height={18} style={{ cursor: 'pointer' }} />
        </div>

        <p className='mFooterCopy'>
          © كل الحقوق محفوظة، وافِر - 2026.
          <br />
          <span> سياسة الخصوصية </span> | <span> شروط الاستخدام </span>
        </p>
      </footer>
    </div>
  );
}
