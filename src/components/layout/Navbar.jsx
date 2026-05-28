'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import "./Navbar.css";

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();

  let profileUrl = '/profile';
  if (role === 'Admin') profileUrl = '/admin/users';

  return (
    <nav className='navbar'>
      {!isAuthenticated ? (
        <>
          <div className='logo'>
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/logo-white.png" alt="وافر" width={99.72} height={35} className='logoImg' priority />
            </Link>
            <div className='brandDivider' />
            <span className='tagline'>وفَّــــــرنـــــاهــــا عـــــلــــيــــكـ</span>
          </div>
          <div className='actions'>
            <button className='loginBtn' onClick={() => router.push('/login')}>تـــســجيل الــدخــول</button>
            <button className='registerBtn' onClick={() => router.push('/register')}>الإشـــــتــــــراك</button>
          </div>
        </>
      ) : (
        <div className='nav-other glass'>
          <div className='other-wafer'>
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <Image alt='icon' src='/logo-black.png' width={85} height={35}></Image>
            </Link>
            <div className='divider' />
            <span className='other-tagline'>وفَّــــــرنـــــاهــــا عـــــلــــيــــكـ</span>
          </div>
          <button type="button" onClick={() => router.push(profileUrl)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
            <Image alt='icon' src='/frame.png' width={40.54} height={39.69}></Image>
          </button>
        </div>
      )}
    </nav>
  );
}