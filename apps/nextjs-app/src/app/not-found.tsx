import { HeartIcon, HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-8">
          <HeartIcon className="size-20 text-pink-300 mx-auto mb-4" />
          <div className="text-6xl font-bold text-pink-600 mb-2">404</div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Page introuvable
        </h1>
        <p className="text-gray-600 mb-8">
          Oups ! Cette page n'existe pas ou a été déplacée. 
          Retournons à la planification de votre mariage de rêve !
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/app">
            <Button className="w-full">
              <HomeIcon className="size-4 mr-2" />
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
