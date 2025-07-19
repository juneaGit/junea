import React, { Suspense, ReactNode } from 'react';
import { AIErrorBoundary } from './ErrorBoundary';

interface AISuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

// Composant de skeleton loader pour les suggestions AI
const AISkeletonLoader = () => (
  <div className="space-y-4 animate-pulse">
    <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-pink-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-pink-200 rounded w-3/4"></div>
          <div className="h-3 bg-pink-200 rounded w-full"></div>
          <div className="h-3 bg-pink-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
    
    <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-pink-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-pink-200 rounded w-2/3"></div>
          <div className="h-3 bg-pink-200 rounded w-full"></div>
          <div className="h-3 bg-pink-200 rounded w-4/5"></div>
        </div>
      </div>
    </div>
    
    <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-pink-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-pink-200 rounded w-1/2"></div>
          <div className="h-3 bg-pink-200 rounded w-full"></div>
          <div className="h-3 bg-pink-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  </div>
);

// Composant de fallback pour les erreurs AI
const AIErrorFallback = () => (
  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
    <div className="flex items-start space-x-3">
      <div className="text-2xl">🤖</div>
      <div className="flex-1">
        <h3 className="font-medium text-amber-800 mb-1">
          Suggestions IA temporairement indisponibles
        </h3>
        <p className="text-sm text-amber-700 mb-3">
          Le service d'intelligence artificielle rencontre des difficultés. 
          Voici quelques suggestions par défaut pour vous aider :
        </p>
        
        <div className="space-y-2">
          <div className="bg-white/50 rounded p-2">
            <div className="font-medium text-amber-800">💡 Conseil général</div>
            <div className="text-sm text-amber-700">
              Commencez par définir votre budget et le nombre d'invités pour obtenir des recommandations plus précises.
            </div>
          </div>
          
          <div className="bg-white/50 rounded p-2">
            <div className="font-medium text-amber-800">📅 Planning</div>
            <div className="text-sm text-amber-700">
              Planifiez votre mariage au moins 12 mois à l'avance pour avoir le temps de comparer les prestataires.
            </div>
          </div>
          
          <div className="bg-white/50 rounded p-2">
            <div className="font-medium text-amber-800">💰 Budget</div>
            <div className="text-sm text-amber-700">
              Réservez 40% de votre budget pour le lieu et 30% pour la restauration.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const AISuspenseWrapper: React.FC<AISuspenseWrapperProps> = ({
  children,
  fallback,
  errorFallback,
}) => {
  return (
    <AIErrorBoundary fallback={errorFallback || <AIErrorFallback />}>
      <Suspense fallback={fallback || <AISkeletonLoader />}>
        {children}
      </Suspense>
    </AIErrorBoundary>
  );
};

// Hook pour gérer les états de chargement AI
export const useAILoadingState = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const setErrorState = React.useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setErrorState,
    clearError,
  };
};

// Composant pour afficher les suggestions AI avec gestion d'état
export const AISuggestionsDisplay: React.FC<{
  suggestions: any[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}> = ({ suggestions, isLoading, error, onRetry }) => {
  if (isLoading) {
    return <AISkeletonLoader />;
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <h3 className="font-medium text-red-800 mb-1">
              Erreur lors du chargement des suggestions
            </h3>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Réessayer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4 text-center">
        <div className="text-2xl mb-2">💭</div>
        <p className="text-gray-600">
          Aucune suggestion disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion.id || index}
          className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start space-x-3">
            <div className="text-2xl">
              {suggestion.type === 'venue' && '🏰'}
              {suggestion.type === 'catering' && '🍽️'}
              {suggestion.type === 'photography' && '📸'}
              {suggestion.type === 'music' && '🎵'}
              {suggestion.type === 'decor' && '🌸'}
              {suggestion.type === 'general' && '💡'}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-pink-800 mb-1">
                {suggestion.title}
              </h3>
              <p className="text-sm text-pink-700 mb-2">
                {suggestion.description}
              </p>
              {suggestion.estimatedCost && (
                <div className="text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded inline-block">
                  💰 {suggestion.estimatedCost}
                </div>
              )}
              {suggestion.tags && suggestion.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {suggestion.tags.map((tag: string, tagIndex: number) => (
                    <span
                      key={tagIndex}
                      className="text-xs bg-pink-200 text-pink-700 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 