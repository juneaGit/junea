'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

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
export const DefaultErrorFallback = ({ error, resetErrorBoundary, errorInfo }: ErrorFallbackProps) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 px-4">
    <div className="text-center max-w-lg">
      <ExclamationTriangleIcon className="size-20 text-red-500 mx-auto mb-6" />
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Oops ! Une erreur s'est produite
      </h1>
      
      <p className="text-lg text-gray-600 mb-6">
        L'application a rencontré un problème inattendu. Ne vous inquiétez pas, nous pouvons essayer de le résoudre.
      </p>
      
      <div className="bg-white rounded-lg p-6 mb-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-2">Détails de l'erreur :</h3>
        <p className="text-sm text-red-600 font-mono bg-red-50 p-3 rounded">
          {error.message}
        </p>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowPathIcon className="size-5" />
          Réessayer
        </button>
        
        <button
          onClick={() => window.location.href = '/app'}
          className="w-full bg-white text-pink-600 border border-pink-200 px-6 py-3 rounded-lg font-medium hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
        >
          <HomeIcon className="size-5" />
          Retour au tableau de bord
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Recharger la page
        </button>
      </div>
      
      {process.env.NODE_ENV === 'development' && errorInfo && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Informations techniques (développement)
          </summary>
          <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-4 rounded overflow-auto max-h-48">
            {errorInfo.componentStack}
          </pre>
        </details>
      )}
      
      <p className="text-xs text-gray-400 mt-6">
        Si le problème persiste, contactez notre support technique.
      </p>
    </div>
  </div>
);

/**
 * Error Boundary global pour l'application Junea
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
export const AIErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 my-4">
    <div className="flex items-start gap-3">
      <ExclamationTriangleIcon className="size-6 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-medium text-yellow-800 mb-2">
          Intelligence Artificielle temporairement indisponible
        </h3>
        <p className="text-sm text-yellow-700 mb-4">
          Les suggestions personnalisées sont momentanément inaccessibles. Vous pouvez continuer à utiliser l'application normalement.
        </p>
        <div className="flex gap-2">
          <button
            onClick={resetErrorBoundary}
            className="text-sm bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
          >
            Réessayer l'IA
          </button>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-yellow-600 hover:text-yellow-800 px-4 py-2"
          >
            Recharger
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-3">
            <summary className="text-xs text-yellow-600 cursor-pointer">Détails techniques</summary>
            <code className="text-xs text-yellow-800 block mt-1">{error.message}</code>
          </details>
        )}
      </div>
    </div>
  </div>
);

export default ErrorBoundary; 