import OpenAI from 'openai';

import { WeddingProfile, UserProfile } from '../config/supabase';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: En production, utilisez un endpoint backend
});

export interface AIRecommendation {
  id: string;
  type: 'venue' | 'catering' | 'photography' | 'music' | 'decor' | 'general';
  title: string;
  description: string;
  estimatedCost?: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

export interface AIInsight {
  category: string;
  insight: string;
  actionable: boolean;
  savings?: string;
}

export class AIService {
  private static instance: AIService;

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private buildUserContext(
    userProfile: UserProfile,
    weddingProfile: WeddingProfile,
  ): string {
    return `
Profil utilisateur:
- Type de mariage: ${weddingProfile.wedding_type}
- Date prévue: ${weddingProfile.wedding_date || 'Non définie'}
- Budget estimé: ${weddingProfile.budget_total || 'Non défini'}€
- Nombre d'invités: ${weddingProfile.guest_count || 'Non défini'}
- Lieu préféré: ${weddingProfile.venue_type || 'Non défini'}
- Type de repas: ${weddingProfile.meal_format || 'Non défini'}
- Restrictions alimentaires: ${weddingProfile.dietary_restrictions?.join(', ') || 'Aucune'}
- Nom du couple: ${weddingProfile.couple_name}
`;
  }

  async generateInitialRecommendations(
    userProfile: UserProfile,
    weddingProfile: WeddingProfile,
  ): Promise<AIRecommendation[]> {
    const context = this.buildUserContext(userProfile, weddingProfile);

    const prompt = `
${context}

En tant qu'expert en organisation de mariage, génère 6 recommandations personnalisées pour ce couple.
Inclus des suggestions pour: lieu, traiteur, photographe, musique, décoration, et conseil général.

Format de réponse souhaité (JSON):
{
  "recommendations": [
    {
      "type": "venue",
      "title": "Titre de la recommandation",
      "description": "Description détaillée avec pourquoi c'est adapté",
      "estimatedCost": "Fourchette de prix",
      "priority": "high|medium|low",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Adapte les recommandations au type de mariage et au budget. Sois spécifique et actionnable.
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Tu es un expert en organisation de mariage qui donne des conseils personnalisés et pratiques.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Pas de réponse de l'IA");

      const parsed = JSON.parse(content);
      return parsed.recommendations.map((rec: any, index: number) => ({
        id: `rec_${Date.now()}_${index}`,
        ...rec,
      }));
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
      return this.getFallbackRecommendations(weddingProfile.wedding_type);
    }
  }

  async generateVenueRecommendations(
    userProfile: UserProfile,
    weddingProfile: WeddingProfile,
  ): Promise<AIRecommendation[]> {
    const context = this.buildUserContext(userProfile, weddingProfile);

    const prompt = `
${context}

Génère 5 recommandations spécifiques de lieux pour ce mariage.
Considère le type de mariage, le budget, le nombre d'invités et la région.

Format JSON avec des lieux réels ou réalistes pour la région mentionnée.
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Tu es un expert en lieux de mariage qui connaît les venues par région et type.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Pas de réponse de l'IA");

      const parsed = JSON.parse(content);
      return parsed.recommendations.map((rec: any, index: number) => ({
        id: `venue_${Date.now()}_${index}`,
        type: 'venue' as const,
        ...rec,
      }));
    } catch (error) {
      console.error('Erreur lors de la génération des lieux:', error);
      return [];
    }
  }

  async generateCateringRecommendations(
    userProfile: UserProfile,
    weddingProfile: WeddingProfile,
  ): Promise<AIRecommendation[]> {
    const context = this.buildUserContext(userProfile, weddingProfile);

    const prompt = `
${context}

Génère 4 recommandations de traiteurs/menus adaptés à ce mariage.
Prends en compte les restrictions alimentaires et le type de mariage.

Inclus des suggestions de menus spécifiques avec prix estimés par personne.
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Tu es un expert en restauration de mariage qui connaît les tendances culinaires.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Pas de réponse de l'IA");

      const parsed = JSON.parse(content);
      return parsed.recommendations.map((rec: any, index: number) => ({
        id: `catering_${Date.now()}_${index}`,
        type: 'catering' as const,
        ...rec,
      }));
    } catch (error) {
      console.error('Erreur lors de la génération des traiteurs:', error);
      return [];
    }
  }

  async generateBudgetInsights(
    userProfile: UserProfile,
    weddingProfile: WeddingProfile,
    currentBudget: any[],
  ): Promise<AIInsight[]> {
    const context = this.buildUserContext(userProfile, weddingProfile);
    const budgetSummary = currentBudget
      .map((item) => `${item.category}: ${item.amount}€`)
      .join('\n');

    const prompt = `
${context}

Budget actuel:
${budgetSummary}

Analyse ce budget et génère 3-4 insights pour optimiser les dépenses.
Suggère des économies possibles et des ajustements intelligents.

Format JSON:
{
  "insights": [
    {
      "category": "Catégorie concernée",
      "insight": "Analyse et conseil",
      "actionable": true/false,
      "savings": "Économies estimées"
    }
  ]
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Tu es un consultant en budget mariage qui aide à optimiser les dépenses.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Pas de réponse de l'IA");

      const parsed = JSON.parse(content);
      return parsed.insights;
    } catch (error) {
      console.error("Erreur lors de l'analyse du budget:", error);
      return [];
    }
  }

  async generateTimelineRecommendations(
    userProfile: UserProfile,
    weddingProfile: WeddingProfile,
  ): Promise<any[]> {
    const context = this.buildUserContext(userProfile, weddingProfile);

    const prompt = `
${context}

Génère un rétro-planning personnalisé pour ce mariage.
Commence à 12 mois avant et va jusqu'au jour J.

Adapte les tâches au type de mariage (ex: pour Bollywood, ajouter chorégraphie).

Format JSON avec mois, tâches et priorités.
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Tu es un wedding planner expérimenté qui crée des plannings détaillés.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 1200,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Pas de réponse de l'IA");

      return JSON.parse(content);
    } catch (error) {
      console.error('Erreur lors de la génération du planning:', error);
      return [];
    }
  }

  private getFallbackRecommendations(weddingType: string): AIRecommendation[] {
    const baseRecommendations = [
      {
        id: 'fallback_venue',
        type: 'venue' as const,
        title: 'Recherche de lieu adapté',
        description: `Pour un mariage ${weddingType}, privilégiez un lieu qui correspond à l'ambiance souhaitée.`,
        priority: 'high' as const,
        tags: ['lieu', weddingType],
      },
      {
        id: 'fallback_catering',
        type: 'catering' as const,
        title: 'Sélection du traiteur',
        description:
          'Choisissez un traiteur qui maîtrise le style culinaire souhaité.',
        priority: 'high' as const,
        tags: ['traiteur', 'menu'],
      },
      {
        id: 'fallback_photo',
        type: 'photography' as const,
        title: 'Photographe spécialisé',
        description:
          'Trouvez un photographe expérimenté dans votre type de mariage.',
        priority: 'medium' as const,
        tags: ['photographie', weddingType],
      },
    ];

    return baseRecommendations;
  }
}

export const aiService = AIService.getInstance();
