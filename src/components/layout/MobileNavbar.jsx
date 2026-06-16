'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import './MobileNavbar.css';

export default function MobileNavbar() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();

  let profileUrl = '/profile';
  if (role === 'Admin') profileUrl = '/admin/users';

  return (
    <nav className='mobileNav'>
      <Link href="/" className='mobileNavLogo'>
        <Image src="/logo-white.png" alt="وافر" width={80} height={28} priority />
        <div className='mobileNavDivider' />
        <span className='mobileNavTagline'>وفَّـرناها عليكـ</span>
      </Link>

      {!isAuthenticated ? (
        <div className='mobileNavActions'>
          <button className='mobileNavLoginBtn' onClick={() => router.push('/login')}>
            دخول
          </button>
          <button className='mobileNavRegisterBtn' onClick={() => router.push('/register')}>
            اشتراك
          </button>
        </div>
      ) : (
        <div className='mobileNavAuth'>
          <button
            className='mobileNavProfileBtn'
            onClick={() => router.push(profileUrl)}
            aria-label="الملف الشخصي"
          >
            <Image src="/frame.png" alt="الملف الشخصي" width={34} height={33} />
          </button>
        </div>
      )}
    </nav>
  );
}
