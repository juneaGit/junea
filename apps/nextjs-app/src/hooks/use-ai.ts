import { useState, useCallback, useEffect } from 'react';

import { aiService, AIRecommendation, AIInsight } from '../services/ai-service';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAIAvailable, setIsAIAvailable] = useState<boolean | null>(null);

  // Vérifier la disponibilité d'OpenAI au montage
  useEffect(() => {
    const checkAIAvailability = async () => {
      try {
        const available = await aiService.isAvailable();
        setIsAIAvailable(available);
        
        if (!available) {
          const initError = aiService.getInitError();
          console.warn('🤖 IA indisponible:', initError);
        } else {
          console.log('🤖 IA disponible et prête');
        }
      } catch (err) {
        console.error('❌ Erreur vérification IA:', err);
        setIsAIAvailable(false);
      }
    };

    checkAIAvailability();
  }, []);

  const generateRecommendations = useCallback(
    async (
      userProfile: any,
      weddingProfile: any,
      type: 'initial' | 'venue' | 'catering' | 'photography' | 'music' = 'initial',
    ): Promise<AIRecommendation[]> => {
      console.log(`🤖 Génération recommandations IA type: ${type}`);
      setLoading(true);
      setError(null);

      try {
        let recommendations: AIRecommendation[] = [];

        // Vérifier que les profils existent
        if (!userProfile || !weddingProfile) {
          console.warn('⚠️ Profils manquants, utilisation des recommandations par défaut');
          // Créer des profils par défaut
          const defaultWeddingProfile = {
            wedding_type: 'romantique' as const,
            wedding_date: null,
            budget_total: 20000,
            guest_count: 80,
            venue_type: 'château',
            meal_format: 'repas-assis',
            dietary_restrictions: [],
            couple_name: 'Les futurs mariés',
            ...weddingProfile
          };
          
          weddingProfile = defaultWeddingProfile;
        }

        switch (type) {
          case 'venue':
            recommendations = await aiService.generateVenueRecommendations(
              userProfile,
              weddingProfile,
            );
            break;
          case 'catering':
            recommendations = await aiService.generateCateringRecommendations(
              userProfile,
              weddingProfile,
            );
            break;
          case 'photography':
            recommendations = await aiService.generatePhotographyRecommendations(
              userProfile,
              weddingProfile,
            );
            break;
          case 'music':
            recommendations = await aiService.generateMusicRecommendations(
              userProfile,
              weddingProfile,
            );
            break;
          default:
            recommendations = await aiService.generateInitialRecommendations(
              userProfile,
              weddingProfile,
            );
        }

        console.log(`✅ Recommandations générées: ${recommendations.length}`);
        return recommendations;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erreur lors de la génération des recommandations';
        
        console.error('❌ Erreur génération recommandations:', errorMessage);
        setError(errorMessage);

        // Retourner des recommandations de fallback selon le type
        return getFallbackRecommendations(type, weddingProfile);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const generateBudgetInsights = useCallback(
    async (
      userProfile: any,
      weddingProfile: any,
    ): Promise<AIInsight[]> => {
      console.log('💡 Génération insights budget');
      setLoading(true);
      setError(null);

      try {
        const insights = await aiService.generateBudgetInsights(userProfile, weddingProfile);
        console.log(`✅ Insights générés: ${insights.length}`);
        return insights;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erreur lors de la génération des insights';
            
        console.error('❌ Erreur génération insights:', errorMessage);
        setError(errorMessage);

        // Retourner des insights de fallback
        return [
          {
            category: 'Budget',
            insight: 'Répartissez 40% du budget pour le lieu, 30% pour le traiteur, 15% pour la photographie, et 15% pour le reste.',
            actionable: true,
            savings: '10-15%',
          },
          {
            category: 'Négociation',
            insight: 'Négociez les tarifs en réservant plusieurs prestataires chez le même fournisseur.',
            actionable: true,
            savings: '5-10%',
          },
        ];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const generateSeatingPlan = useCallback(
    async (
      guests: any[],
      weddingProfile: any,
    ): Promise<any> => {
      console.log('🪑 Génération plan de table');
      setLoading(true);
      setError(null);

      try {
        const plan = await aiService.generateSeatingPlan(guests, weddingProfile);
        console.log('✅ Plan de table généré');
        return plan;
      } catch (err) {
        console.error('❌ Erreur génération plan de table:', err);
        setError('Erreur lors de la génération du plan de table');
        
        // Fallback simple
        return {
          tables: [],
          suggestions: [
            'Séparez les familles des deux côtés',
            'Groupez les invités par affinités',
            'Placez les enfants près des parents',
          ],
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Test de connexion OpenAI
  const testAIConnection = useCallback(async (): Promise<boolean> => {
    console.log('🧪 Test connexion OpenAI...');
    setLoading(true);
    
    try {
      const isAvailable = await aiService.isAvailable();
      setIsAIAvailable(isAvailable);
      
      if (isAvailable) {
        console.log('✅ OpenAI connecté avec succès');
        
        // Test avec une recommandation simple
        const testWeddingProfile = {
          id: 'test-wedding',
          user_id: 'test-user',
          wedding_type: 'romantique' as const,
          budget_total: 15000,
          guest_count: 50,
          couple_name: 'Test',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const testUserProfile = {
          id: 'test-user',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const testRec = await aiService.generateInitialRecommendations(testUserProfile, testWeddingProfile);
        console.log('🎯 Test recommandation:', testRec.length, 'résultats');
        
        return true;
      } else {
        const initError = aiService.getInitError();
        console.warn('⚠️ OpenAI indisponible:', initError);
        setError(initError);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur test OpenAI:', error);
      setError('Erreur de connexion à OpenAI');
      setIsAIAvailable(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // État
    loading,
    error,
    isAIAvailable,
    
    // Fonctions principales
    generateRecommendations,
    generateBudgetInsights,
    generateSeatingPlan,
    
    // Utilitaires
    testAIConnection,
    clearError: () => setError(null),
    
    // Informations sur l'IA
    getAIStatus: () => ({
      available: isAIAvailable,
      error: aiService.getInitError(),
      loading,
    }),
  };
}

/**
 * Recommandations de fallback selon le type
 */
function getFallbackRecommendations(type: string, weddingProfile?: any): AIRecommendation[] {
  const baseId = `fallback_${type}_${Date.now()}`;
  
  switch (type) {
    case 'venue':
      return [
        {
          id: `${baseId}_1`,
          type: 'venue',
          title: 'Château romantique',
          description: `Pour un mariage ${weddingProfile?.wedding_type || 'classique'}, recherchez un château avec jardins`,
          estimatedCost: '150-300€ par personne',
          priority: 'high',
          tags: ['château', 'jardins', 'romantique'],
        },
        {
          id: `${baseId}_2`,
          type: 'venue',
          title: 'Domaine viticole',
          description: 'Ambiance authentique dans un cadre naturel',
          estimatedCost: '100-200€ par personne',
          priority: 'medium',
          tags: ['domaine', 'vin', 'nature'],
        },
      ];

    case 'catering':
      return [
        {
          id: `${baseId}_1`,
          type: 'catering',
          title: 'Menu gastronomique français',
          description: 'Cuisine raffinée avec produits locaux',
          estimatedCost: '80-120€ par personne',
          priority: 'high',
          tags: ['gastronomique', 'français', 'raffiné'],
        },
        {
          id: `${baseId}_2`,
          type: 'catering',
          title: 'Buffet convivial',
          description: 'Formule flexible adaptée à tous les goûts',
          estimatedCost: '60-90€ par personne',
          priority: 'medium',
          tags: ['buffet', 'convivial', 'flexible'],
        },
      ];

    case 'photography':
      return [
        {
          id: `${baseId}_1`,
          type: 'photography',
          title: 'Photographe documentaire',
          description: 'Style naturel et authentique',
          estimatedCost: '1500-2500€',
          priority: 'high',
          tags: ['documentaire', 'naturel', 'authentique'],
        },
      ];

    case 'music':
      return [
        {
          id: `${baseId}_1`,
          type: 'music',
          title: 'DJ professionnel',
          description: 'Animation complète avec matériel inclus',
          estimatedCost: '800-1500€',
          priority: 'high',
          tags: ['dj', 'animation', 'matériel'],
        },
      ];

    default:
      return [
        {
          id: `${baseId}_1`,
          type: 'general',
          title: 'Planifier votre budget',
          description: `Pour ${weddingProfile?.guest_count || 80} invités, prévoyez un budget de ${weddingProfile?.budget_total || '15000-25000'}€`,
          priority: 'high',
          tags: ['budget', 'planning'],
        },
        {
          id: `${baseId}_2`,
          type: 'general',
          title: 'Réserver vos prestataires',
          description: 'Commencez par le lieu, puis le traiteur et le photographe',
          priority: 'high',
          tags: ['réservation', 'priorité'],
        },
        {
          id: `${baseId}_3`,
          type: 'general',
          title: 'Timeline de préparation',
          description: 'Débutez les préparatifs 12-18 mois à l\'avance',
          priority: 'medium',
          tags: ['timeline', 'préparation'],
        },
      ];
  }
}
