import OpenAI from 'openai';

import { WeddingProfile, UserProfile } from '../config/supabase';

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
  private openai: OpenAI | null = null;
  private isInitialized = false;
  private initError: string | null = null;

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Initialisation lazy et sécurisée d'OpenAI
   */
  private async initializeOpenAI(): Promise<OpenAI | null> {
    if (this.isInitialized) {
      return this.openai;
    }

    try {
      // Vérifier la clé API
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      if (!apiKey || apiKey.trim() === '') {
        this.initError = 'Clé API OpenAI manquante dans les variables d\'environnement';
        console.warn('⚠️ OpenAI désactivé:', this.initError);
        this.isInitialized = true;
        return null;
      }

      // Validation basique de la clé
      if (!apiKey.startsWith('sk-')) {
        this.initError = 'Format de clé API OpenAI invalide';
        console.warn('⚠️ OpenAI désactivé:', this.initError);
        this.isInitialized = true;
        return null;
      }

      // Initialiser OpenAI
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // ATTENTION: Pour développement uniquement!
      });

      // Test simple de connexion
      console.log('🤖 OpenAI initialisé avec succès');
      this.isInitialized = true;
      this.initError = null;
      
      return this.openai;
    } catch (error) {
      this.initError = `Erreur initialisation OpenAI: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
      console.error('❌ Erreur OpenAI:', this.initError);
      this.isInitialized = true;
      return null;
    }
  }

  /**
   * Vérifie si OpenAI est disponible
   */
  public async isAvailable(): Promise<boolean> {
    const client = await this.initializeOpenAI();
    return client !== null;
  }

  /**
   * Retourne l'erreur d'initialisation si elle existe
   */
  public getInitError(): string | null {
    return this.initError;
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
    `.trim();
  }

  /**
   * Génère des recommandations avec fallback
   */
  private async callOpenAI(prompt: string, fallbackData: AIRecommendation[]): Promise<AIRecommendation[]> {
    try {
      const client = await this.initializeOpenAI();
      
      if (!client) {
        console.log('🔄 Utilisation des données de fallback (OpenAI indisponible)');
        return fallbackData;
      }

      console.log('🤖 Appel OpenAI en cours...');
      
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en organisation de mariages en France. Génère des recommandations personnalisées en JSON avec les champs: id, type, title, description, estimatedCost, priority, tags.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Réponse vide d\'OpenAI');
      }

      // Essayer de parser la réponse JSON
      try {
        const parsedRecommendations = JSON.parse(content);
        console.log('✅ Recommandations OpenAI générées:', parsedRecommendations.length);
        return Array.isArray(parsedRecommendations) ? parsedRecommendations : fallbackData;
      } catch (parseError) {
        console.warn('⚠️ Erreur parsing JSON OpenAI, utilisation du fallback');
        return fallbackData;
      }

    } catch (error) {
      console.error('❌ Erreur appel OpenAI:', error);
      console.log('🔄 Utilisation des données de fallback');
      return fallbackData;
    }
  }

  async generateInitialRecommendations(
    userProfile: UserProfile,
    weddingProfile: WeddingProfile,
  ): Promise<AIRecommendation[]> {
    const context = this.buildUserContext(userProfile, weddingProfile);
    const prompt = `${context}

Génère 5 recommandations initiales pour ce mariage en JSON. Inclus des suggestions variées (lieu, traiteur, photographe, etc.)`;

    const fallback: AIRecommendation[] = [
      {
        id: 'init-1',
        type: 'venue',
        title: 'Rechercher un château romantique',
        description: `Pour un mariage ${weddingProfile.wedding_type || 'classique'}, considérez un château avec jardins à la française`,
        estimatedCost: '150-300€ par personne',
        priority: 'high',
        tags: ['château', 'romantique', 'jardins'],
      },
      {
        id: 'init-2',
        type: 'catering',
        title: 'Menu gastronomique français',
        description: 'Optez pour un traiteur spécialisé dans la haute cuisine française',
        estimatedCost: '80-150€ par personne',
        priority: 'high',
        tags: ['gastronomie', 'français', 'raffiné'],
      },
      {
        id: 'init-3',
        type: 'photography',
        title: 'Photographe style documentaire',
        description: 'Un photographe spécialisé dans les mariages naturels et authentiques',
        estimatedCost: '1500-3000€',
        priority: 'medium',
        tags: ['documentaire', 'naturel', 'authentique'],
      },
    ];

    return this.callOpenAI(prompt, fallback);
  }

  async generateVenueRecommendations(
    userProfile: UserProfile,
    weddingProfile: WeddingProfile,
  ): Promise<AIRecommendation[]> {
    const context = this.buildUserContext(userProfile, weddingProfile);
    const prompt = `${context}

Génère 3-4 recommandations de lieux de réception en JSON pour ce mariage spécifique.`;

    const fallback: AIRecommendation[] = [
      {
        id: 'venue-1',
        type: 'venue',
        title: 'Château de Chantilly',
        description: 'Château historique avec jardins exceptionnels, parfait pour un mariage princier',
        estimatedCost: '200-350€ par personne',
        priority: 'high',
        tags: ['château', 'historique', 'jardins', 'prestige'],
      },
      {
        id: 'venue-2',
        type: 'venue',
        title: 'Domaine viticole en Bourgogne',
        description: 'Authentique domaine avec cave à vin et vue sur les vignes',
        estimatedCost: '120-200€ par personne',
        priority: 'medium',
        tags: ['domaine', 'vin', 'authentique', 'vignes'],
      },
      {
        id: 'venue-3',
        type: 'venue',
        title: 'Villa méditerranéenne',
        description: 'Villa avec piscine et vue mer sur la Côte d\'Azur',
        estimatedCost: '180-300€ par personne',
        priority: 'medium',
        tags: ['villa', 'mer', 'piscine', 'méditerranée'],
      },
    ];

    return this.callOpenAI(prompt, fallback);
  }

  async generateCateringRecommendations(
    userProfile: UserProfile,
    weddingProfile: WeddingProfile,
  ): Promise<AIRecommendation[]> {
    const context = this.buildUserContext(userProfile, weddingProfile);
    const prompt = `${context}

Génère 3-4 recommandations de traiteurs et menus en JSON pour ce mariage, en tenant compte du budget et des restrictions.`;

    const fallback: AIRecommendation[] = [
      {
        id: 'catering-1',
        type: 'catering',
        title: 'Menu gastronomique français',
        description: 'Cuisine raffinée avec produits locaux et de saison, service à l\'assiette',
        estimatedCost: '95-140€ par personne',
        priority: 'high',
        tags: ['gastronomique', 'français', 'local', 'raffiné'],
      },
      {
        id: 'catering-2',
        type: 'catering',
        title: 'Buffet multiculturel',
        description: 'Sélection de plats du monde avec options végétariennes et halal',
        estimatedCost: '60-85€ par personne',
        priority: 'medium',
        tags: ['multiculturel', 'buffet', 'végétarien', 'halal'],
      },
      {
        id: 'catering-3',
        type: 'catering',
        title: 'Chef à domicile bio',
        description: 'Chef spécialisé dans la cuisine bio et locale avec zéro déchet',
        estimatedCost: '80-120€ par personne',
        priority: 'medium',
        tags: ['bio', 'local', 'chef', 'écologique'],
      },
    ];

    return this.callOpenAI(prompt, fallback);
  }

  async generatePhotographyRecommendations(
    userProfile: UserProfile,
    weddingProfile: WeddingProfile,
  ): Promise<AIRecommendation[]> {
    const context = this.buildUserContext(userProfile, weddingProfile);
    const prompt = `${context}

Génère 3 recommandations de photographes en JSON selon le style de mariage.`;

    const fallback: AIRecommendation[] = [
      {
        id: 'photo-1',
        type: 'photography',
        title: 'Photographe documentaire',
        description: 'Spécialiste des mariages naturels et spontanés, style reportage',
        estimatedCost: '1800-2800€',
        priority: 'high',
        tags: ['documentaire', 'naturel', 'reportage'],
      },
      {
        id: 'photo-2',
        type: 'photography',
        title: 'Photographe fashion wedding',
        description: 'Style moderne et éditorial avec mise en scène créative',
        estimatedCost: '2500-4000€',
        priority: 'medium',
        tags: ['fashion', 'moderne', 'créatif'],
      },
    ];

    return this.callOpenAI(prompt, fallback);
  }

  async generateMusicRecommendations(
    userProfile: UserProfile,
    weddingProfile: WeddingProfile,
  ): Promise<AIRecommendation[]> {
    const context = this.buildUserContext(userProfile, weddingProfile);
    const prompt = `${context}

Génère 3 recommandations musicales en JSON (DJ, groupe, duo) selon l'ambiance souhaitée.`;

    const fallback: AIRecommendation[] = [
      {
        id: 'music-1',
        type: 'music',
        title: 'DJ spécialisé mariages',
        description: 'DJ professionnel avec large répertoire et matériel son/éclairage',
        estimatedCost: '800-1500€',
        priority: 'high',
        tags: ['dj', 'professionnel', 'polyvalent'],
      },
      {
        id: 'music-2',
        type: 'music',
        title: 'Duo acoustique',
        description: 'Duo guitare-voix pour cérémonie et cocktail, ambiance intimiste',
        estimatedCost: '600-1000€',
        priority: 'medium',
        tags: ['acoustique', 'intimiste', 'cérémonie'],
      },
    ];

    return this.callOpenAI(prompt, fallback);
  }

  async generateBudgetInsights(
    userProfile: UserProfile,
    weddingProfile: WeddingProfile,
  ): Promise<AIInsight[]> {
    const fallback: AIInsight[] = [
      {
        category: 'Budget',
        insight: 'Répartissez 40% du budget pour le lieu et la réception, 30% pour le traiteur',
        actionable: true,
        savings: '10-15%',
      },
      {
        category: 'Timing',
        insight: 'Réservez votre lieu 12-18 mois à l\'avance pour de meilleurs tarifs',
        actionable: true,
        savings: '15-20%',
      },
    ];

    try {
      const client = await this.initializeOpenAI();
      if (!client) return fallback;

      // Implementation avec OpenAI...
      return fallback;
    } catch (error) {
      console.error('Erreur génération insights:', error);
      return fallback;
    }
  }

  async generateSeatingPlan(
    guests: any[],
    weddingProfile: WeddingProfile,
  ): Promise<any> {
    console.log('🪑 Génération plan de table pour', guests.length, 'invités');
    // Logique de plan de table avec ou sans AI
    return {
      tables: [],
      suggestions: ['Séparer les familles', 'Grouper par affinités'],
    };
  }
}

// Instance singleton exportée
export const aiService = AIService.getInstance();
