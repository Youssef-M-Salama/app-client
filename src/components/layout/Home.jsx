'use client';

import React, { useState, useEffect } from 'react'
import "@/styles/home.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import offersService from '@/services/offersService';
import charityNeedsService from '@/services/charityNeedsService';
import apiClient from '@/services/apiClient';
import { mapUnit } from '@/utils/enumMapper';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const baseUrl = apiClient.defaults.baseURL;
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};

export default function Home() {
  const { isAuthenticated, role } = useAuth();
  
  let dashboardUrl = '/';
  if (role === 'Admin') dashboardUrl = '/admin/dashboard';
  else if (role === 'DonorOrganization') dashboardUrl = '/donor-organization/dashboard';
  else if (role === 'Charity') dashboardUrl = '/charity/dashboard';

  const [offers, setOffers] = useState([]);
  const [needs, setNeeds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const offersRes = await offersService.getPublicOffers({ Page: 1, PageSize: 4 });
        const offersPayload = offersRes.data || offersRes.Data || [];
        setOffers(Array.isArray(offersPayload) ? offersPayload : (offersPayload.items || offersPayload.Items || []));

        const needsRes = await charityNeedsService.getPublicCharityNeeds({ Page: 1, PageSize: 4 });
        const needsPayload = needsRes.data || needsRes.Data || [];
        setNeeds(Array.isArray(needsPayload) ? needsPayload : (needsPayload.items || needsPayload.Items || []));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className='home'>
      {/* hero */}
      <div className='hero'>
        {!isAuthenticated ? (
          <>
            <span className='hero-txt'>ابــــــــدأ<br />رحلــــــــــــتــك </span>
            <button className='hero-btn' onClick={() => window.location.href = '/register'}>
              <span>مــن هــنــــــا......</span>
              <div className='hero-arrow'>
                <Image src='/arrow-right.png' alt='arrow' width={24} height={24}></Image>
                <Image className='ellipse' src='/Ellipse 12.png' alt='ellipse shadow' width={21} height={21}></Image>
              </div>
            </button>
          </>
        ) : (
          <span className='hero-txt'>ابــــــــدأ<br />رحلــــــــــــتــك<br />الأن </span>
        )}
      </div>
      <div className='cover-layout'>
        <Image alt='cover-layout' src='/bg-img2.png' width={611.15} height={781.11} className='cover-layout-img'></Image>
      </div>

      <div className="infos">
        <div className="r-infos">

          <div className='r-1 glass-card'>
            <Image alt='icon' src='/Vector.png' width={22} height={14}></Image>
            <div className='r-1-txt'>يمكنك التـــسجيــل الأن كـ جمعية خيرية أو مؤسسة إنتاجية</div>
          </div>

          <div className='r-2 glass-card'>
            <div className='r-2-header'>
              <Image alt='icon' src='/Clip-path-group.png' width={22} height={22}></Image>
              <div className='r-2-txt'>آراء بعض الجمعيات</div>
              <Image alt='icon' src='/Vector-1.png' width={16} height={14.5}></Image>
            </div>
            <div className='r-2-des'>
              <span className='des-title'>جمعية مصر الخير.</span>
              <span className='des-txt'>
                موقع جيد و يعتمد عليه في نشر المقالات و المنشورات
                و البحث عن المساعدات و التبرعات و تعاون أيضاً
                المؤسسات الإنتاجية و توفيرها كل ما تستطيع تقديمه و
                التواصل فى أسرع وقت و توصيل التبرعات و الخدمات فى أقرب
                مكان يتم الإتفاق عليه.</span>
            </div>
            <div className='r-2-imgs'>
              <Image alt='icon' src='/Vector-2.png' width={22} height={22}></Image>
              <Image alt='icon' src='/Clip-path-group-4.png' width={22} height={22}></Image>
              <Image alt='icon' src='/Clip-path-group-3.png' width={22} height={22}></Image>
              <Image alt='icon' src='/Clip-path-group-2.png' width={22} height={22}></Image>
              <Image alt='icon' src='/Clip-path-group-1.png' width={22} height={22}></Image>
            </div>
          </div>

          <div className='r-3 glass-card'>
            <Image alt='icon' src='/Clip-path-group-6.png' width={24} height={24}></Image>
            <div className='r-3-txt'>جميع المؤسسات و الجمعيات موثقة رسمياً</div>
          </div>

          <div className='r-4 glass-card'>
            <Image alt='icon' src='/Clip-path-group-5.png' width={24} height={24}></Image>
            <div className='r-4-txt'>الأن دورك أنت لتصنع تأثيراً فى المجتمع
              و ترتقي به !</div>
          </div>

        </div>
        <div className="l-infos">
          <div className='l-1 glass-card'>
            <Image alt='icon' src='/Clip-path-group-7.png' width={36} height={36}></Image>
            <Image alt='icon' src='/Clip-path-group-8.png' width={24} height={24}></Image>
            <Image alt='icon' src='/Group.png' width={20} height={20}></Image>
            <Image alt='icon' src='/Group-1.png' width={21.5} height={21.5}></Image>
            <Image alt='icon' src='/Group-2.png' width={19.39} height={19.38}></Image>
          </div>

          <div className='l-2 glass-card'>
            <Image alt='icon' src='/Vector-3.png' width={19.39} height={19.38}></Image>
            <span className='l-2-txt'>تم تسجيل أكتر من 200 جمعية خيرية
              و 310 مؤسسة إنتاجية وتم نشر حوالى 530 منشور
              مكونين من متطلبات الجمعية الخيرية و عروض
              المؤسسات الإنتاجية</span>
            <span className='l-2-txt-2'>ليس هذا فقط !</span>
            <span className='l-2-txt-3'>تم إنقاذ مئات الأشخاص و توفير مساكن و وجبات
              للعديد من الأسر و إجراء عمليات جراحية خطيرة لحالات
              بنجاح و غيرها من الأعمال العظيمة.</span>
          </div>

          <div className='l-3 glass-card'>
            <div className='l-3-header'><Image alt='icon' src='/Clip-path-group-9.png' width={24} height={24}></Image>
              <span>تم من خلال هذا الموقع : </span></div>
            <span className='l-3-txt'>تجميع ما يقارب من 750 ألف جنيه                   من أموال التبرعات و إستخدامها فى الضرورات اللازمة لها
              إعداد حوالى 1200 وجبة للعائلات                      تجميع المواد الغذائية و توزيعها على الأسر المحتاجة إليها
              بناء ما يقارب من 14 منزل و تجهيزهم          إستخدام مواد البناء و المعدات المتبرع بها لبناء مأوى للأسر
              إجراء 47 عملية بنجاح                                               حالات متعددة منها عمليات قلب و حروق شديدة و غيرها</span>
            <span className='l-3-txt-2'>و غيرها من الأعمال الخيرية التى تقام بإستمرار و بمساعدة المؤسسات الإنتاجية المتعددة.</span>
          </div>
        </div>
      </div>

      {/* second page */}
      <div className='sec-page'>
        <div className='sec-txt'>
          <span className='txt1'>أكـــــثـــــر مـــن:  </span>
          <span className='txt2'>350+ جـــمـــعـــيـــة خـــيـــريـــة</span>
          <span className='txt3'>+720 مــــؤســســة إنـــتـــاجـــيـــة</span>
          <span className='txt4'>كـــلــهم مجتمعين فى مكان واحد</span>
        </div>
        <Image alt='icon' className='frame-235' src='/download-5.png' width={150.29} height={150.29}></Image>
        <Image alt='icon' className='frame frame-234' src='/download-11.png' width={150.29} height={150.29}></Image>
        <Image alt='icon' className='frame-233' src='/images-3.png' width={150.29} height={150.29}></Image>
        <Image alt='icon' className='frame-230' src='/download-12.png' width={150.29} height={150.29}></Image>
        <Image alt='icon' className='frame-229' src='/download-10.png' width={150.29} height={150.29}></Image>
        <Image alt='icon' className='frame-228' src='/download-8.png' width={150.29} height={150.29}></Image>
        <Image alt='icon' className='frame-226' src='/frame-226.png' width={150.29} height={150.29}></Image>
        <Image alt='icon' className='frame-225' src='/download-6.png' width={150.29} height={150.29}></Image>
        <Image alt='icon' className='frame-224' src='/download-4.png' width={150.29} height={150.29}></Image>
        <Image alt='icon' className='frame-231' src='/download-7.png' width={150.29} height={150.29}></Image>
        <Image alt='icon' className='frame frame-232' src='/images-4.png' width={150.29} height={150.29}></Image>
      </div>
      {/* 3th page */}
      <div className='page-3'>
        <span className='pg-3-txt'>بعض منشــــورات الجـمعيات الخيرية : </span>
        <div className='cards-cont'>
          {needs.map((need, index) => {
            const rawImg = need.productImage || need.imageUrl || need.image;
            const imageSrc = getImageUrl(rawImg) || '/card-1.png';
            const charityName = need.charityName || need.organizationName || 'جمعية خيرية';
            const date = need.createdAt ? new Date(need.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'تاريخ غير محدد';

            return (
              <div className='card' key={need.id || index}>
                <img alt='icon' className='card-1-img' src={imageSrc} style={{ width: 517, height: 524, objectFit: 'contain', backgroundColor: 'transparent' }} />
                <div className='card-txt-cont'>
                  <span className='card-header'>{charityName}</span>
                  <span className='card-txt'>
                    {need.description || 'يبحثون عن تبرعات'}
                    <br /> <br />
                    {need.productName}
                    <br /> <br />
                    الكمية المطلوبة: {need.quantity} {mapUnit(need.unit)}
                    <br /> <br />
                    رقـــم التـــواصـــل <span style={{ direction: 'ltr', display: 'inline-block' }}>{need.phone || need.whatsapp || 'غير متوفر'}</span>
                    <br />
                    {!isAuthenticated ? (
                      <Link href="/register" className='tafasel'>......اشترك معنا لتقدر علي ان تساهم في مثل هذا </Link>
                    ) : (
                      <Link href={dashboardUrl} className='tafasel'>......اذهب اللي dashboard للمزيد </Link>
                    )}
                  </span>
                  <span className='card-date'>{date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* page 4 */}
      <div className='page-4'>
        <span className='pg-4-txt'>بعض منشــــورات المؤســـســـات الإنتــــاجــيــــة : </span>
        <div className='posts-cont'>
          {offers.length > 0 && (
            <div className='main-post'>
              <img
                alt='icon'
                className='main-p-img'
                src={getImageUrl(offers[0].productImage || offers[0].imageUrl || offers[0].image) || '/main-post.png'}
                style={{ width: 550.54, height: 481.99, objectFit: 'contain', backgroundColor: 'transparent' }}
              />
              <div className='main-post-txt'>
                <span className='main-header'>{offers[0].donorOrganizationName || offers[0].organizationName || 'مؤسسة إنتاجية'}</span>
                <span className='main-txt'>
                  مـــتوفر كمية فائضة من {offers[0].productName} ({offers[0].quantity} {mapUnit(offers[0].unit)})
                  <br />
                  صلاحيــة هذه الكمية : صـــالحة حتي {offers[0].expiryDate ? new Date(offers[0].expiryDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                  <br />
                  مدة العرض : الكمية متواجدة إلى حين تواصل مؤسسة خيرية فى حاجة للعرض
                  <br />
                  رقـــم التـــواصـــل <span style={{ direction: 'ltr', display: 'inline-block' }}>{offers[0].phone || offers[0].whatsapp || 'غير متوفر'}</span>
                  <br />
                  {!isAuthenticated ? (
                    <Link href="/register" className='tafasel-posts'>......اشترك معنا لتقدر علي ان تساهم في مثل هذا </Link>
                  ) : (
                    <Link href={dashboardUrl} className='tafasel-posts'>......اذهب اللي dashboard للمزيد </Link>
                  )}
                </span>
                <span className='main-date'>
                  {offers[0].createdAt ? new Date(offers[0].createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'تاريخ غير محدد'}
                </span>
              </div>
            </div>
          )}

          <div className='more-posts'>
            {offers.slice(1).map((offer, index) => (
              <div className='post' key={offer.id || index}>
                <img
                  alt='icon'
                  className='p-img'
                  src={getImageUrl(offer.productImage || offer.imageUrl || offer.image) || '/post-3.png'}
                  style={{ width: 432.7, height: 243.39, objectFit: 'contain', backgroundColor: 'transparent' }}
                />
                <div className='post-text'>
                  <span className='post-header'>{offer.donorOrganizationName || offer.organizationName || 'مؤسسة إنتاجية'}</span>
                  <span className='post-txt'>
                    مـــتوفر كمية فائضة من {offer.productName} ({offer.quantity} {mapUnit(offer.unit)})
                    <br /><br />
                    صلاحيــة هذه الكمية : صـــالحة حتي {offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                    <br /><br />
                    مدة العرض : الكمية متواجدة إلى حين تواصل مؤسسة خيرية فى حاجة للعرض
                    <br /><br />
                    رقـــم التـــواصـــل <span style={{ direction: 'ltr', display: 'inline-block' }}>{offer.phone || offer.whatsapp || 'غير متوفر'}</span>
                    <br />
                    {!isAuthenticated ? (
                      <Link href="/register" className='post-tafasel'>......اشترك معنا لتقدر علي ان تساهم في مثل هذا </Link>
                    ) : (
                      <Link href={dashboardUrl} className='post-tafasel'>......اذهب اللي dashboard للمزيد </Link>
                    )}
                  </span>
                  <span className='post-date'>
                    {offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : 'تاريخ غير محدد'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* page-5 */}
      <div className='page-5'>
        <span className='pg-5-header'>مـــجـــتــمــع كـــامــــل يـــخـــدم كـــــافـــة الأطراف </span>
        <span className='pg-5-head'>جميعهم مــتــواجــدون فــى مــكان واحـــد</span>
        <span className='pg-5-brd'>احصل الأن على تذكرتك إلى هذا العالم الكبيـــر</span>
        <Image alt='icon' className='p-5-img' src='/frame-273.png' width={555} height={500}></Image>
      </div>

      {/* page-6 */}
      {!isAuthenticated && (
        <div className='page-6'>
          <span className='pg-6-header'>سارع الأن بالتســجـــيــــــــل !</span>
          <span className='pg-6-head'>و كن جزءاً من مجتمع <span className='span-wafer'>وَافــــــر</span> الكبير </span>
          <Link href={'/register'} className='pg-6-brd'>اشـــتـــرك الأن</Link>
          <Image alt='icon' className='p-6-img' src='/frame-275.png' width={731} height={731}></Image>
        </div>
      )}

      {/* footer */}
      <footer className='footer' style={{ top: isAuthenticated ? '6000.8px' : '6500.8px' }}>
        <div className='sub'>
          <span className='sub-head'>اشــتــرك الأن</span>
          <div className='sub-input'>
            <button className='sub-btn'>اشـتـراك</button>
            <input type="email" name="subscribe" id="subscribe" placeholder='example@gmail.com' />
          </div>
          <div className='sub-txt'>بالضغط على زر الاشتراك، فإنك تؤكد أنك قرأت ووافقت على شروط الاستخدام الخاصة بنا.</div>
        </div>
        <div className='who'>
          <Image alt='icon' className='who-img' src='/ellipse-41.png' width={15} height={15}></Image>
          <span className='who-txt'>مـــــن نـــــحـــــن</span>
        </div>
        <div className='contact'>
          <Image alt='icon' className='contact-img' src='/ellipse-41.png' width={15} height={15}></Image>
          <span className='who-txt'>تـــــواصـــــل مـــــعــــــنـــــا</span>
        </div>
        <Image alt='icon' className='footer-logo' src='/logo-white.png' width={170} height={90}></Image>
        <div className='copy'>© كل الحقوق محفوظة , وافـــــــــــــــــــر - 2026.
          <span> سياسة الخصوصية </span>  <span> شروط الاستخدام </span>
        </div>
        <div className='social'>
          <Image alt='facebook-logo' className='facebook contact-logo' src='/facebook.png' width={24} height={24}></Image>
          <Image alt='x-logo' className='x contact-logo' src='/x.png' width={20} height={22}></Image>
          <Image alt='instagram-logo' className='instagram contact-logo' src='/instagram.png' width={19.5} height={19.5}></Image>
          <Image alt='youtube-logo' className='youtube contact-logo' src='/youtube.png' width={22.5} height={18.31}></Image>
        </div>
      </footer>
    </div>
  )
}