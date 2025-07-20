import { useMutation } from '@tanstack/react-query';

import type { AIServiceRecommendation } from '../types';

export interface AIServiceSuggestionParams {
  wedding_type: string;
  estimated_guests: number;
  estimated_budget: number;
  venue_type?: string;
  existing_services?: string[];
  special_requests?: string;
}

const generateServiceSuggestionsPrompt = (params: AIServiceSuggestionParams): string => {
  return `En tant qu'expert en organisation de mariages, génère des suggestions de prestations supplémentaires personnalisées.

CONTEXTE DU MARIAGE :
- Type de mariage : ${params.wedding_type}
- Nombre d'invités estimé : ${params.estimated_guests}
- Budget total estimé : ${params.estimated_budget}€
- Type de lieu : ${params.venue_type || 'Non spécifié'}
- Prestations déjà prévues : ${params.existing_services?.join(', ') || 'Aucune'}
- Demandes spéciales : ${params.special_requests || 'Aucune'}

INSTRUCTIONS :
1. Suggère 5-8 prestations supplémentaires pertinentes pour ce type de mariage
2. Priorise les suggestions selon leur importance (1=faible, 5=critique)
3. Donne des fourchettes de prix réalistes pour chaque prestation
4. Inclus des conseils pratiques et des idées créatives
5. Adapte les suggestions au type et au style de mariage
6. Considère le budget disponible pour rester réaliste

FORMAT DE RÉPONSE attendu (JSON) :
{
  "wedding_type": "${params.wedding_type}",
  "suggestions": [
    {
      "service_name": "Nom de la prestation",
      "service_type": "Catégorie (ex: Décoration, Animation, etc.)",
      "description": "Description détaillée et conseils",
      "estimated_budget_min": 200,
      "estimated_budget_max": 800,
      "tips": ["Conseil 1", "Conseil 2", "Conseil 3"],
      "providers_suggestions": ["Type de prestataire 1", "Type de prestataire 2"],
      "priority_level": 3
    }
  ],
  "reasoning": "Explication générale de pourquoi ces prestations sont recommandées",
  "total_estimated_cost": 3500
}

Réponds uniquement en JSON valide, sans texte additionnel.`;
};

export const generateServiceSuggestions = async (
  params: AIServiceSuggestionParams
): Promise<AIServiceRecommendation> => {
  try {
    // Fallback data si l'IA n'est pas disponible
    const fallbackData: AIServiceRecommendation = {
      wedding_type: params.wedding_type,
      suggestions: [
        {
          service_name: "Fleuriste spécialisé",
          service_type: "Fleuriste",
          description: "Bouquets et compositions florales pour un mariage bohémien",
          estimated_budget_min: 300,
          estimated_budget_max: 800,
          tips: ["Privilégier les fleurs de saison", "Composer un bouquet de mariée unique"],
          providers_suggestions: ["Fleuristes locaux", "Fleuristes spécialisés mariages"],
          priority_level: 3
        },
        {
          service_name: "Éclairage d'ambiance",
          service_type: "Éclairage",
          description: "Éclairage LED et guirlandes pour créer une atmosphère magique",
          estimated_budget_min: 400,
          estimated_budget_max: 1200,
          tips: ["Tester l'éclairage avant le jour J", "Prévoir des éclairages de secours"],
          providers_suggestions: ["Techniciens éclairage", "Sociétés de location"],
          priority_level: 4
        },
        {
          service_name: "Animation soirée",
          service_type: "Animation",
          description: "Animateur professionnel pour les jeux et ambiance",
          estimated_budget_min: 500,
          estimated_budget_max: 1000,
          tips: ["Briefer l'animateur sur vos goûts", "Prévoir des jeux pour tous les âges"],
          providers_suggestions: ["Animateurs mariages", "DJ-animateurs"],
          priority_level: 2
        }
      ],
      reasoning: "Ces prestations complémentaires apporteront une touche unique et personnalisée à votre mariage.",
      total_estimated_cost: 2000
    };

    // Pour le moment, retourner les données de fallback
    // Plus tard, nous pourrons intégrer l'appel IA réel ici
    console.log('🤖 Génération de suggestions IA (mode fallback)');
    
    // Adapter le fallback au type de mariage
    const adaptedSuggestions = fallbackData.suggestions.map(suggestion => ({
      ...suggestion,
      description: `${suggestion.description} - Parfait pour un mariage ${params.wedding_type}`
    }));

    return {
      ...fallbackData,
      suggestions: adaptedSuggestions
    };

  } catch (error) {
    console.error('Erreur lors de la génération de suggestions IA:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Erreur lors de la génération de suggestions'
    );
  }
};

export const useGenerateServiceSuggestions = () => {
  return useMutation({
    mutationFn: generateServiceSuggestions,
  });
}; 