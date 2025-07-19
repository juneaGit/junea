'use client';

import { Suspense } from 'react';
import {
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { ErrorBoundary, AIErrorFallback } from './error-boundary';

/**
 * Skeleton loader pour les composants AI
 */
const AISkeleton = ({
  message = 'Génération des suggestions IA...',
}: {
  message?: string;
}) => (
  <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="animate-spin">
        <SparklesIcon className="size-6 text-pink-500" />
      </div>
      <div className="flex-1">
        <div className="h-4 bg-pink-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-pink-100 rounded w-1/2"></div>
      </div>
    </div>

    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white/60 rounded-lg p-4">
          <div className="h-4 bg-pink-100 rounded w-full mb-2"></div>
          <div className="h-3 bg-pink-50 rounded w-2/3 mb-2"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-pink-100 rounded-full w-16"></div>
            <div className="h-6 bg-pink-100 rounded-full w-20"></div>
          </div>
        </div>
      ))}
    </div>

    <p className="text-sm text-pink-600 text-center mt-4 flex items-center justify-center gap-2">
      <SparklesIcon className="size-4 animate-pulse" />
      {message}
    </p>
  </div>
);

/**
 * Composant de fallback pour les erreurs AI spécifiques
 */
const AISpecificErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  const isOpenAIError =
    error.message.includes('OpenAI') || error.message.includes('API key');
  const isQuotaError =
    error.message.includes('quota') || error.message.includes('billing');

  if (isQuotaError) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 my-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="size-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-orange-800 mb-2">
              Quota OpenAI dépassé
            </h3>
            <p className="text-sm text-orange-700 mb-4">
              Les crédits OpenAI sont épuisés. L'application utilise des
              suggestions par défaut en attendant.
            </p>
            <div className="flex gap-2">
              <button
                onClick={resetErrorBoundary}
                className="text-sm bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isOpenAIError) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 my-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="size-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-yellow-800 mb-2">
              Configuration OpenAI requise
            </h3>
            <p className="text-sm text-yellow-700 mb-4">
              La clé API OpenAI n'est pas configurée. Veuillez créer le fichier{' '}
              <code className="bg-yellow-100 px-1 rounded">.env.local</code>{' '}
              avec votre clé API.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Recharger
              </button>
            </div>
            <details className="mt-3">
              <summary className="text-xs text-yellow-600 cursor-pointer">
                Instructions
              </summary>
              <div className="text-xs text-yellow-800 mt-2">
                <p>
                  1. Créez <code>.env.local</code> dans apps/nextjs-app/
                </p>
                <p>
                  2. Ajoutez: <code>NEXT_PUBLIC_OPENAI_API_KEY=votre_clé</code>
                </p>
                <p>3. Redémarrez le serveur</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Erreur générique AI
  return (
    <AIErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
  );
};

/**
 * Wrapper Suspense + ErrorBoundary pour les composants AI
 */
export const AISuspenseWrapper = ({
  children,
  fallbackMessage,
  onError,
}: {
  children: React.ReactNode;
  fallbackMessage?: string;
  onError?: (error: Error, errorInfo: any) => void;
}) => {
  return (
    <ErrorBoundary
      fallback={AISpecificErrorFallback}
      onError={(error, errorInfo) => {
        console.error('🤖 AI Component Error:', error);
        if (onError) onError(error, errorInfo);
      }}
    >
      <Suspense fallback={<AISkeleton message={fallbackMessage} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

/**
 * Hook pour wrapper facilement les composants AI
 */
export const useAISuspense = () => {
  return {
    wrap: (component: React.ReactNode, message?: string) => (
      <AISuspenseWrapper fallbackMessage={message}>
        {component}
      </AISuspenseWrapper>
    ),
  };
};

export default AISuspenseWrapper;
