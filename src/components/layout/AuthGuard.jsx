'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * AuthGuard — Protects routes based on authentication state and user role.
 *
 * @param {string[]} requiredRole - Array of allowed roles: ['Charity', 'DonorOrganization', 'Admin']
 * @param {React.ReactNode} children - The protected page content
 *
 * Usage:
 *   // In (dashboard)/layout.jsx:
 *   <AuthGuard requiredRole={['Charity', 'DonorOrganization']}>{children}</AuthGuard>
 *
 *   // In (admin)/layout.jsx:
 *   <AuthGuard requiredRole={['Admin']}>{children}</AuthGuard>
 */
export default function AuthGuard({ children, requiredRole = [] }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Do nothing while AuthContext is still hydrating from localStorage/cookies
    if (isLoading) return;

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Role mismatch → redirect to appropriate home
    if (requiredRole.length > 0 && !requiredRole.includes(role)) {
      if (role === 'Admin') {
        router.replace('/admin');
      } else {
        router.replace('/posts');
      }
      return;
    }
  }, [isAuthenticated, role, isLoading, requiredRole, router]);

  // Show full-page loading spinner while session is being restored
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid var(--primary, #4f46e5)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>جاري التحقق من الجلسة...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Redirect in progress — render nothing to avoid flash
  if (!isAuthenticated || (requiredRole.length > 0 && !requiredRole.includes(role))) {
    return null;
  }

  return children;
}
