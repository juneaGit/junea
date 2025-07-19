'use client';

import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  errorInfo?: ErrorInfo;
}

/**
 * Composant de fallback par défaut pour les erreurs
 */
export const DefaultErrorFallback = ({
  error,
  resetErrorBoundary,
  errorInfo,
}: ErrorFallbackProps) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 px-4">
    <div className="max-w-lg text-center">
      <ExclamationTriangleIcon className="mx-auto mb-6 size-20 text-red-500" />

      <h1 className="mb-4 text-3xl font-bold text-gray-900">
        Oops ! Une erreur s'est produite
      </h1>

      <p className="mb-6 text-lg text-gray-600">
        L'application a rencontré un problème inattendu. Ne vous inquiétez pas,
        nous pouvons essayer de le résoudre.
      </p>

      <div className="mb-6 rounded-lg bg-white p-6 text-left">
        <h3 className="mb-2 font-semibold text-gray-900">
          Détails de l'erreur :
        </h3>
        <p className="rounded bg-red-50 p-3 font-mono text-sm text-red-600">
          {error.message}
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={resetErrorBoundary}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700"
        >
          <ArrowPathIcon className="size-5" />
          Réessayer
        </button>

        <button
          onClick={() => (window.location.href = '/app')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-pink-200 bg-white px-6 py-3 font-medium text-pink-600 transition-colors hover:bg-pink-50"
        >
          <HomeIcon className="size-5" />
          Retour au tableau de bord
        </button>

        <button
          onClick={() => window.location.reload()}
          className="w-full rounded-lg px-6 py-2 text-gray-600 transition-colors hover:bg-gray-100"
        >
          Recharger la page
        </button>
      </div>

      {process.env.NODE_ENV === 'development' && errorInfo && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Informations techniques (développement)
          </summary>
          <pre className="mt-2 max-h-48 overflow-auto rounded bg-gray-100 p-4 text-xs text-gray-600">
            {errorInfo.componentStack}
          </pre>
        </details>
      )}

      <p className="mt-6 text-xs text-gray-400">
        Si le problème persiste, contactez notre support technique.
      </p>
    </div>
  </div>
);

/**
 * Error Boundary global pour l'application Junea
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Mettre à jour l'état pour afficher l'UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Logger l'erreur
    console.group('🚨 Error Boundary - Erreur capturée');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.groupEnd();

    // Sauvegarder les détails de l'erreur
    this.setState({
      error,
      errorInfo,
    });

    // Appeler le callback personnalisé si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // En production, envoyer l'erreur à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      // Exemple : Sentry, LogRocket, etc.
      // sendErrorToMonitoring(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.handleReset}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Hook pour utiliser l'Error Boundary de manière programmatique
 */
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: any) => {
    console.error('🚨 Erreur capturée par useErrorHandler:', error);

    // En développement, on peut throw l'erreur pour déclencher l'Error Boundary
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }

    // En production, on peut logger l'erreur et afficher un message à l'utilisateur
    // toast.error('Une erreur s'est produite');
  };
};

/**
 * Error Boundary spécialisé pour les erreurs OpenAI/AI
 */
export const AIErrorFallback = ({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) => (
  <div className="my-4 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
    <div className="flex items-start gap-3">
      <ExclamationTriangleIcon className="mt-0.5 size-6 shrink-0 text-yellow-600" />
      <div className="flex-1">
        <h3 className="mb-2 font-medium text-yellow-800">
          Intelligence Artificielle temporairement indisponible
        </h3>
        <p className="mb-4 text-sm text-yellow-700">
          Les suggestions personnalisées sont momentanément inaccessibles. Vous
          pouvez continuer à utiliser l'application normalement.
        </p>
        <div className="flex gap-2">
          <button
            onClick={resetErrorBoundary}
            className="rounded-md bg-yellow-600 px-4 py-2 text-sm text-white transition-colors hover:bg-yellow-700"
          >
            Réessayer l'IA
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm text-yellow-600 hover:text-yellow-800"
          >
            Recharger
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-yellow-600">
              Détails techniques
            </summary>
            <code className="mt-1 block text-xs text-yellow-800">
              {error.message}
            </code>
          </details>
        )}
      </div>
    </div>
  </div>
);

export default ErrorBoundary;
