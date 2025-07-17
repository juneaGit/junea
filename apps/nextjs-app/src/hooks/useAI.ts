import { useState, useCallback } from 'react';
import { aiService, AIRecommendation, AIInsight } from '../services/aiService';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecommendations = useCallback(async (
    userProfile: any,
    weddingProfile: any,
    type: 'initial' | 'venue' | 'catering' = 'initial'
  ): Promise<AIRecommendation[]> => {
    setLoading(true);
    setError(null);

    try {
      let recommendations: AIRecommendation[] = [];

      switch (type) {
        case 'venue':
          recommendations = await aiService.generateVenueRecommendations(userProfile, weddingProfile);
          break;
        case 'catering':
          recommendations = await aiService.generateCateringRecommendations(userProfile, weddingProfile);
          break;
        default:
          recommendations = await aiService.generateInitialRecommendations(userProfile, weddingProfile);
      }

      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération des recommandations';
      setError(errorMessage);
      
      // Retourner des recommandations de fallback
      return [
        {
          id: 'fallback_1',
          type: 'general',
          title: 'Recommandations temporairement indisponibles',
          description: 'Le service IA est temporairement indisponible. Veuillez réessayer plus tard.',
          priority: 'medium',
          tags: ['service', 'indisponible']
        }
      ];
    } finally {
      setLoading(false);
    }
  }, []);

  const generateBudgetInsights = useCallback(async (
    userProfile: any,
    weddingProfile: any,
    currentBudget: any[]
  ): Promise<AIInsight[]> => {
    setLoading(true);
    setError(null);

    try {
      return await aiService.generateBudgetInsights(userProfile, weddingProfile, currentBudget);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'analyse du budget';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const generateTimeline = useCallback(async (
    userProfile: any,
    weddingProfile: any
  ): Promise<any[]> => {
    setLoading(true);
    setError(null);

    try {
      return await aiService.generateTimelineRecommendations(userProfile, weddingProfile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du planning';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    generateRecommendations,
    generateBudgetInsights,
    generateTimeline,
    clearError
  };
} 