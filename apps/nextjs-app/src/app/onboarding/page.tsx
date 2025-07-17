'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/auth';
import { useHasCompletedOnboarding } from '@/hooks/use-wedding-profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  HeartIcon, 
  SparklesIcon, 
  CurrencyEuroIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '@/config/supabase';
import { Spinner } from '@/components/ui/spinner';
import { useQueryClient } from '@tanstack/react-query';


interface OnboardingData {
  weddingDate: string;
  weddingType: string;
  venueType: string;
  mealFormat: string;
  dietaryRestrictions: string[];
  estimatedGuests: number;
  estimatedBudget: number;
  partnerName: string;
  weddingLocation: string;
  themeColors: string[];
  specialRequests: string;
}

const weddingTypes = [
  { value: 'romantique', label: 'Romantique', icon: '💕', description: 'Élégant et intime' },
  { value: 'bohemien', label: 'Bohémien', icon: '🌿', description: 'Naturel et décontracté' },
  { value: 'oriental', label: 'Oriental', icon: '🌙', description: 'Traditionnel et coloré' },
  { value: 'bollywood', label: 'Bollywood', icon: '💃', description: 'Festif et vibrant' },
  { value: 'moderne', label: 'Moderne', icon: '✨', description: 'Contemporain et chic' },
  { value: 'traditionnel', label: 'Traditionnel', icon: '⛪', description: 'Classique et formel' },
  { value: 'bonne_franquette', label: 'Bonne Franquette', icon: '🎉', description: 'Convivial et détendu' }
];

const venueTypes = [
  'Château', 'Domaine viticole', 'Salle de réception', 'Plage', 'Jardin/Parc', 
  'Lieu religieux', 'Restaurant', 'Maison familiale', 'Loft/Atelier', 'Autre'
];

const mealFormats = [
  'Dîner assis', 'Apéritif dinatoire', 'Cocktail', 'Brunch', 'Buffet', 'Pique-nique chic'
];

const dietaryOptions = [
  'Végétarien', 'Végétalien', 'Sans gluten', 'Halal', 'Casher', 'Sans lactose', 'Allergies spécifiques'
];

const budgetRanges = [
  { value: 5000, label: 'Moins de 5 000€' },
  { value: 15000, label: '5 000€ - 15 000€' },
  { value: 30000, label: '15 000€ - 30 000€' },
  { value: 50000, label: '30 000€ - 50 000€' },
  { value: 100000, label: 'Plus de 50 000€' }
];

const themeColors = [
  { value: 'rose-blanc', label: 'Rose & Blanc', colors: ['#fce7f3', '#ffffff'] },
  { value: 'or-champagne', label: 'Or & Champagne', colors: ['#fbbf24', '#f3e8ff'] },
  { value: 'bleu-argent', label: 'Bleu & Argent', colors: ['#3b82f6', '#e5e7eb'] },
  { value: 'vert-nature', label: 'Vert Nature', colors: ['#10b981', '#f0fdf4'] },
  { value: 'rouge-bordeaux', label: 'Rouge Bordeaux', colors: ['#dc2626', '#fef2f2'] },
  { value: 'violet-lilas', label: 'Violet & Lilas', colors: ['#8b5cf6', '#f3e8ff'] }
];

export default function OnboardingPage() {
  const user = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasCompleted, isLoading: checkingOnboarding } = useHasCompletedOnboarding();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<OnboardingData>({
    weddingDate: '',
    weddingType: '',
    venueType: '',
    mealFormat: '',
    dietaryRestrictions: [],
    estimatedGuests: 50,
    estimatedBudget: 15000,
    partnerName: '',
    weddingLocation: '',
    themeColors: [],
    specialRequests: ''
  });

  // Rediriger si l'onboarding est déjà complété
  useEffect(() => {
    if (!checkingOnboarding && hasCompleted) {
      router.push('/app');
    }
  }, [checkingOnboarding, hasCompleted, router]);

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }));
  };

  const saveProfile = async () => {
    console.log('💾 saveProfile appelé');
    console.log('User data:', user.data);
    
    if (!user.data) {
      console.log('❌ Pas de user.data - Mode demo sans authentification');
      // Créer un utilisateur fictif pour le mode demo
      const demoUser = {
        id: 'demo-user-' + Date.now(),
        email: 'demo@example.com',
        created_at: new Date().toISOString()
      };
      
      // Sauvegarder le profil en mode demo
      const profileData = {
        user_id: demoUser.id,
        wedding_date: formData.weddingDate || null,
        wedding_type: formData.weddingType,
        venue_type: formData.venueType,
        meal_format: formData.mealFormat,
        dietary_restrictions: formData.dietaryRestrictions,
        estimated_guests: formData.estimatedGuests,
        estimated_budget: formData.estimatedBudget,
        partner_name: formData.partnerName,
        wedding_location: formData.weddingLocation,
        theme_colors: formData.themeColors,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem('wedding-profile-demo', JSON.stringify(profileData));
      localStorage.setItem('demo-user', JSON.stringify(demoUser));
      
      console.log('✅ Profil sauvegardé en mode demo sans auth');
      
      // Invalider le cache
      await queryClient.invalidateQueries({
        queryKey: ['wedding-profile']
      });
      
      // Rediriger vers le dashboard
      console.log('🎯 Redirection vers /app');
      router.push('/app');
      return;
    }

    console.log('🔄 Démarrage de la sauvegarde...');
    setLoading(true);
    setError(null);
    
    try {
      // Vérifier si Supabase est configuré
      const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                                   process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';
      
      console.log('🔧 Supabase configuré:', isSupabaseConfigured);
      
      if (isSupabaseConfigured) {
        console.log('🎮 Mode Supabase - Sauvegarde en mode demo pour éviter les problèmes RLS');
        
        // TEMPORAIRE : Utiliser le mode demo même avec Supabase configuré
        // pour éviter les problèmes de RLS jusqu'à ce qu'ils soient résolus
        const profileData = {
          user_id: user.data.id,
          wedding_date: formData.weddingDate || null,
          wedding_type: formData.weddingType,
          venue_type: formData.venueType,
          meal_format: formData.mealFormat,
          dietary_restrictions: formData.dietaryRestrictions,
          estimated_guests: formData.estimatedGuests,
          estimated_budget: formData.estimatedBudget,
          partner_name: formData.partnerName,
          wedding_location: formData.weddingLocation,
          theme_colors: formData.themeColors,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem('wedding-profile-demo', JSON.stringify(profileData));
        console.log('✅ Profil sauvegardé en mode demo (temporaire)');
        
      } else {
        console.log('🎮 Mode demo - sauvegarde localStorage');
        
        const profileData = {
          user_id: user.data.id,
          wedding_date: formData.weddingDate || null,
          wedding_type: formData.weddingType,
          venue_type: formData.venueType,
          meal_format: formData.mealFormat,
          dietary_restrictions: formData.dietaryRestrictions,
          estimated_guests: formData.estimatedGuests,
          estimated_budget: formData.estimatedBudget,
          partner_name: formData.partnerName,
          wedding_location: formData.weddingLocation,
          theme_colors: formData.themeColors,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem('wedding-profile-demo', JSON.stringify(profileData));
        console.log('✅ Profil sauvegardé en mode demo');
      }

      // Invalider le cache pour forcer le rechargement du profil
      await queryClient.invalidateQueries({
        queryKey: ['wedding-profile']
      });

      // Attendre un peu pour que le cache se mette à jour
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('🎯 Redirection vers /app');
      // Rediriger vers le dashboard
      router.push('/app');
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      console.log('🏁 Fin de saveProfile, loading = false');
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.weddingType && formData.partnerName;
      case 2:
        return formData.venueType && formData.mealFormat;
      case 3:
        return formData.estimatedGuests > 0 && formData.estimatedBudget > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (hasCompleted) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Bienvenue dans votre planificateur de mariage ! 💕
          </h1>
          <p className="text-lg text-gray-600">
            Répondez à quelques questions pour personnaliser votre expérience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Étape {step} sur 4</span>
            <span className="text-sm text-gray-600">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-rose-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Type de mariage et partenaire */}
        {step === 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartIcon className="h-6 w-6 text-rose-500" />
                Parlez-nous de votre mariage
              </CardTitle>
              <CardDescription>
                Choisissez le style qui vous ressemble et présentez-nous votre partenaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de votre partenaire
                </label>
                <input
                  type="text"
                  value={formData.partnerName}
                  onChange={(e) => handleInputChange('partnerName', e.target.value)}
                  placeholder="Ex: Marie Dupont"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de mariage
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {weddingTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange('weddingType', type.value)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.weddingType === type.value
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date prévue (optionnel)
                </label>
                <input
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Lieu et repas */}
        {step === 2 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="h-6 w-6 text-rose-500" />
                Lieu et restauration
              </CardTitle>
              <CardDescription>
                Où souhaitez-vous célébrer et comment voulez-vous régaler vos invités ?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville ou région
                </label>
                <input
                  type="text"
                  value={formData.weddingLocation}
                  onChange={(e) => handleInputChange('weddingLocation', e.target.value)}
                  placeholder="Ex: Paris, Lyon, Provence..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de lieu préféré
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {venueTypes.map((venue) => (
                    <button
                      key={venue}
                      onClick={() => handleInputChange('venueType', venue)}
                      className={`p-3 rounded-lg border text-sm transition-all ${
                        formData.venueType === venue
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      {venue}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format de repas
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {mealFormats.map((format) => (
                    <button
                      key={format}
                      onClick={() => handleInputChange('mealFormat', format)}
                      className={`p-3 rounded-lg border text-sm transition-all ${
                        formData.mealFormat === format
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restrictions alimentaires
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleArrayToggle('dietaryRestrictions', option)}
                      className={`p-3 rounded-lg border text-sm transition-all ${
                        formData.dietaryRestrictions.includes(option)
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Budget et invités */}
        {step === 3 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CurrencyEuroIcon className="h-6 w-6 text-rose-500" />
                Budget et invités
              </CardTitle>
              <CardDescription>
                Aidez-nous à dimensionner votre événement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'invités estimé
                </label>
                <input
                  type="number"
                  value={formData.estimatedGuests}
                  onChange={(e) => handleInputChange('estimatedGuests', parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget estimé
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {budgetRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleInputChange('estimatedBudget', range.value)}
                      className={`p-3 rounded-lg border text-sm transition-all ${
                        formData.estimatedBudget === range.value
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleurs du thème
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {themeColors.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleArrayToggle('themeColors', theme.value)}
                      className={`p-3 rounded-lg border text-sm transition-all ${
                        formData.themeColors.includes(theme.value)
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {theme.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {theme.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Demandes spéciales et finalisation */}
        {step === 4 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-rose-500" />
                Derniers détails
              </CardTitle>
              <CardDescription>
                Y a-t-il des éléments particuliers que vous souhaitez inclure ?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demandes spéciales ou idées particulières
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Ex: Cérémonie bilingue, animation pour enfants, photobooth vintage..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="bg-rose-50 p-4 rounded-lg">
                <h3 className="font-medium text-rose-900 mb-2">Récapitulatif</h3>
                <ul className="text-sm text-rose-800 space-y-1">
                  <li>• Mariage {formData.weddingType} avec {formData.partnerName}</li>
                  <li>• {formData.estimatedGuests} invités à {formData.weddingLocation}</li>
                  <li>• {formData.venueType} avec {formData.mealFormat}</li>
                  <li>• Budget: {formData.estimatedBudget.toLocaleString()}€</li>
                  {formData.weddingDate && <li>• Date: {new Date(formData.weddingDate).toLocaleDateString('fr-FR')}</li>}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            ← Précédent
          </Button>

          {step < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600"
            >
              Suivant →
            </Button>
          ) : (
            <Button
              onClick={() => {
                console.log('🚀 Bouton cliqué !');
                console.log('Loading state:', loading);
                console.log('Form data:', formData);
                console.log('User data:', user.data);
                saveProfile();
              }}
              disabled={loading}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Finalisation...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  Commencer l'aventure !
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 