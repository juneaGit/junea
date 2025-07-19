'use client';

import {
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Suspense } from 'react';

import { ErrorBoundary, AIErrorFallback } from './error-boundary';

/**
 * Skeleton loader pour les composants AI
 */
const AISkeleton = ({
  message = 'Génération des suggestions IA...',
}: {
  message?: string;
}) => (
  <div className="animate-pulse rounded-lg border border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 p-6">
    <div className="mb-4 flex items-center gap-3">
      <div className="animate-spin">
        <SparklesIcon className="size-6 text-pink-500" />
      </div>
      <div className="flex-1">
        <div className="mb-2 h-4 w-3/4 rounded bg-pink-200"></div>
        <div className="h-3 w-1/2 rounded bg-pink-100"></div>
      </div>
    </div>

    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg bg-white/60 p-4">
          <div className="mb-2 h-4 w-full rounded bg-pink-100"></div>
          <div className="mb-2 h-3 w-2/3 rounded bg-pink-50"></div>
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full bg-pink-100"></div>
            <div className="h-6 w-20 rounded-full bg-pink-100"></div>
          </div>
        </div>
      ))}
    </div>

    <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-pink-600">
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
      <div className="my-4 rounded-lg border border-orange-200 bg-orange-50 p-6">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="mt-0.5 size-6 shrink-0 text-orange-600" />
          <div className="flex-1">
            <h3 className="mb-2 font-medium text-orange-800">
              Quota OpenAI dépassé
            </h3>
            <p className="mb-4 text-sm text-orange-700">
              Les crédits OpenAI sont épuisés. L'application utilise des
              suggestions par défaut en attendant.
            </p>
            <div className="flex gap-2">
              <button
                onClick={resetErrorBoundary}
                className="rounded-md bg-orange-600 px-4 py-2 text-sm text-white transition-colors hover:bg-orange-700"
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
      <div className="my-4 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="mt-0.5 size-6 shrink-0 text-yellow-600" />
          <div className="flex-1">
            <h3 className="mb-2 font-medium text-yellow-800">
              Configuration OpenAI requise
            </h3>
            <p className="mb-4 text-sm text-yellow-700">
              La clé API OpenAI n'est pas configurée. Veuillez créer le fichier{' '}
              <code className="rounded bg-yellow-100 px-1">.env.local</code>{' '}
              avec votre clé API.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-yellow-600 px-4 py-2 text-sm text-white transition-colors hover:bg-yellow-700"
              >
                Recharger
              </button>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-yellow-600">
                Instructions
              </summary>
              <div className="mt-2 text-xs text-yellow-800">
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
