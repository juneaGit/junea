'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';

import { Sidebar } from '@/components/navigation';
import { useLogout } from '@/lib/auth';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const logout = useLogout({
    onSuccess: () => router.push('/auth/login'),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="lg:pl-80">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function Fallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Oops! Une erreur s'est produite
        </h1>
        <p className="mb-4 text-gray-600">
          {error.message ?? "Quelque chose s'est mal passé!"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
        >
          Recharger la page
        </button>
      </div>
    </div>
  );
}

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  return (
    <Layout>
      <ErrorBoundary key={pathname} FallbackComponent={Fallback}>
        {children}
      </ErrorBoundary>
    </Layout>
  );
};
