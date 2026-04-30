import React from 'react'
import "@/styles/home.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='home'>
         {/* hero */}
      <div className='hero'>
        <span className='hero-txt'>ابــــــــدأ 
            رحلــــــــــــتــك </span>
        <Link className='hero-btn' href='' >
          <span>مــن هــنــــــا......</span>
          <div className='hero-arrow'>
            <Image src='/arrow-right.png' alt='arrow' width={24} height={24}></Image>
            <Image className='ellipse' src='/Ellipse 12.png' alt='ellipse shadow' width={21} height={21}></Image>
          </div> 
        </Link>
      </div>
      <div className='cover-layout'>
        <Image alt='cover-layout'src='/bg-img2.png' width={611.15} height={781.11} className='cover-layout-img'></Image>
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
        <div className="l-infos"></div>
      </div>
    </div>
  )
}
