'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ErrorBoundary } from 'react-error-boundary';

import { Sidebar } from '@/components/navigation/Sidebar';
import { useLogout, useUser } from '@/lib/auth';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const pathname = usePathname();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops! Une erreur s'est produite</h1>
        <p className="text-gray-600 mb-4">{error.message ?? 'Quelque chose s\'est mal passé!'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
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
