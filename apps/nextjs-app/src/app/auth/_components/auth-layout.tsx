'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

import { paths } from '@/config/paths';
import { useUser } from '@/lib/auth';

type LayoutProps = {
  children: ReactNode;
};

export const AuthLayout = ({ children }: LayoutProps) => {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo');

  useEffect(() => {
    if (user.data) {
      router.replace(
        `${redirectTo ? `${decodeURIComponent(redirectTo)}` : paths.app.dashboard.getHref()}`,
      );
    }
  }, [user.data, router, redirectTo]);

  // Retourner simplement les children sans wrapper visuel
  // Le nouveau LoginForm gère son propre design
  return <>{children}</>;
};
