import { HeartIcon, HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 px-4">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="mb-8">
          <HeartIcon className="mx-auto mb-4 size-20 text-pink-300" />
          <div className="mb-2 text-6xl font-bold text-pink-600">404</div>
        </div>

        {/* Content */}
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Page introuvable
        </h1>
        <p className="mb-8 text-gray-600">
          Oups ! Cette page n'existe pas ou a été déplacée. Retournons à la
          planification de votre mariage de rêve !
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/app">
            <Button className="w-full">
              <HomeIcon className="mr-2 size-4" />
              Retour au tableau de bord
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              Se connecter
            </Button>
          </Link>
        </div>

        {/* Decoration */}
        <div className="mt-8 text-pink-200">
          <div className="text-2xl">💍 ✨ 💐</div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
