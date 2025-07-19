'use client';

import {
  CakeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  UsersIcon,
  CurrencyEuroIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon,
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { AIButton } from '@/components/ai/ai-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAI } from '@/hooks/use-ai';
import { useWeddingProfile } from '@/hooks/use-wedding-profile';
import { useUser } from '@/lib/auth';
import { cn } from '@/utils/cn';

// Types
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'entrée' | 'plat' | 'dessert' | 'boisson';
  dietaryInfo: string[];
  allergens: string[];
  image?: string;
  popular?: boolean;
}

interface Menu {
  id: string;
  name: string;
  type: 'apéritif-dinatoire' | 'repas-assis' | 'buffet' | 'cocktail' | 'brunch';
  description: string;
  pricePerPerson: number;
  items: MenuItem[];
  servingStyle: string;
  minimumGuests: number;
}

interface Caterer {
  id: string;
  name: string;
  type: 'traiteur' | 'restaurant' | 'chef-domicile' | 'self-service';
  location: string;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  specialties: string[];
  cuisineTypes: string[];
  menus: Menu[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  services: string[];
  priceRange: {
    min: number;
    max: number;
  };
  isFavorite?: boolean;
  certifications: string[];
}

// Image Fallback Component avec error handling robuste
const SafeImage = ({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Images de fallback thématiques
  const fallbackImages = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop', // Restaurant élégant
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop', // Plats gastronomiques
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop', // Cuisine végétale
  ];

  const randomFallback =
    fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

  const handleImageLoad = () => {
    setIsLoading(false);
    console.log('✅ Image loaded successfully:', src);
  };

  const handleImageError = () => {
    console.warn('⚠️ Image failed to load:', src);
    setImageError(true);
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center',
          className,
        )}
      >
        <div className="p-4 text-center">
          <CakeIcon className="mx-auto mb-2 size-8 text-pink-400" />
          <p className="text-xs text-pink-600">Image indisponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      )}

      <Image
        src={imageError ? randomFallback : src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        priority={priority}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          fill ? 'object-cover' : '',
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
    </div>
  );
};

// Loading Skeleton Component
const CatererSkeleton = () => (
  <Card className="h-full overflow-hidden">
    <div className="aspect-video animate-pulse bg-gray-200" />
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="h-4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
        </div>
        <div className="h-8 animate-pulse rounded bg-gray-200" />
      </div>
    </CardContent>
  </Card>
);

// Error Fallback Component
const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 px-4">
    <div className="max-w-md text-center">
      <ExclamationTriangleIcon className="mx-auto mb-4 size-16 text-red-500" />
      <h2 className="mb-4 text-2xl font-bold text-gray-900">
        Oops ! Une erreur s'est produite
      </h2>
      <p className="mb-6 text-gray-600">
        La page des traiteurs a rencontré un problème. Ne vous inquiétez pas,
        nous pouvons la réparer !
      </p>
      <div className="space-y-3">
        <Button onClick={resetErrorBoundary} className="w-full">
          <SparklesIcon className="mr-2 size-4" />
          Réessayer
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => (window.location.href = '/app')}
        >
          Retour au tableau de bord
        </Button>
      </div>
      <details className="mt-4 text-xs text-gray-500">
        <summary className="cursor-pointer">Détails techniques</summary>
        <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-left">
          {error.message}
        </pre>
      </details>
    </div>
  </div>
);

// Données de démonstration avec URLs d'images corrigées
const DEMO_CATERERS: Caterer[] = [
  {
    id: '1',
    name: 'Maison Gourmet',
    type: 'traiteur',
    location: 'Paris, France',
    rating: 4.8,
    reviewCount: 156,
    images: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    ],
    description:
      'Traiteur haut de gamme spécialisé dans la cuisine française raffinée avec des produits locaux et de saison.',
    specialties: ['Cuisine française', 'Produits bio', 'Présentation raffinée'],
    cuisineTypes: ['Française', 'Méditerranéenne', 'Contemporaine'],
    services: [
      'Service en salle',
      'Vaisselle incluse',
      'Animation culinaire',
      'Accords mets-vins',
    ],
    priceRange: { min: 85, max: 150 },
    certifications: ['Certifié Bio', 'Label Rouge', 'Agriculture raisonnée'],
    isFavorite: false,
    contact: {
      phone: '+33 1 23 45 67 89',
      email: 'contact@maison-gourmet.fr',
      website: 'www.maison-gourmet.fr',
    },
    menus: [
      {
        id: 'menu-1',
        name: 'Menu Excellence',
        type: 'repas-assis',
        description:
          'Un menu raffiné mettant en valeur les saveurs françaises traditionnelles',
        pricePerPerson: 120,
        servingStyle: "Service à l'assiette",
        minimumGuests: 30,
        items: [
          {
            id: '1',
            name: 'Foie gras mi-cuit',
            description: 'Foie gras maison, chutney de figues, pain brioche',
            price: 25,
            category: 'entrée',
            dietaryInfo: ['Sans gluten disponible'],
            allergens: ['Œufs', 'Lait'],
            popular: true,
          },
          {
            id: '2',
            name: 'Filet de bœuf Wellington',
            description:
              'Filet de bœuf en croûte, sauce aux morilles, légumes de saison',
            price: 45,
            category: 'plat',
            dietaryInfo: [],
            allergens: ['Gluten', 'Lait'],
            popular: true,
          },
          {
            id: '3',
            name: 'Tarte au citron revisitée',
            description:
              'Tarte au citron yuzu, meringue italienne, sorbet basilic',
            price: 18,
            category: 'dessert',
            dietaryInfo: ['Végétarien'],
            allergens: ['Gluten', 'Œufs', 'Lait'],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Saveurs du Monde',
    type: 'traiteur',
    location: 'Lyon, France',
    rating: 4.6,
    reviewCount: 89,
    images: [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
    ], // URL CORRIGÉE
    description:
      'Traiteur multiculturel proposant des cuisines du monde entier avec des options halal et casher.',
    specialties: ['Cuisine multiculturelle', 'Halal', 'Casher', 'Végétalien'],
    cuisineTypes: ['Orientale', 'Indienne', 'Méditerranéenne', 'Fusion'],
    services: [
      'Cuisine halal certifiée',
      'Options véganes',
      'Décoration orientale',
      'Animation musicale',
    ],
    priceRange: { min: 45, max: 95 },
    certifications: ['Certification Halal', 'Certification Casher'],
    isFavorite: true,
    contact: {
      phone: '+33 4 78 12 34 56',
      email: 'info@saveurs-monde.fr',
    },
    menus: [
      {
        id: 'menu-2',
        name: 'Buffet Oriental',
        type: 'buffet',
        description: 'Un voyage culinaire à travers les saveurs orientales',
        pricePerPerson: 65,
        servingStyle: 'Buffet libre-service',
        minimumGuests: 50,
        items: [
          {
            id: '4',
            name: 'Mezze variés',
            description: "Houmous, taboulé, caviar d'aubergine, falafel",
            price: 15,
            category: 'entrée',
            dietaryInfo: ['Végétarien', 'Végan', 'Halal'],
            allergens: ['Sésame'],
          },
          {
            id: '5',
            name: "Tajine d'agneau",
            description: 'Agneau aux pruneaux et amandes, semoule parfumée',
            price: 28,
            category: 'plat',
            dietaryInfo: ['Halal'],
            allergens: ['Fruits à coque'],
            popular: true,
          },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Green Kitchen',
    type: 'chef-domicile',
    location: 'Bordeaux, France',
    rating: 4.9,
    reviewCount: 67,
    images: [
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
    ],
    description:
      'Chef à domicile spécialisé dans la cuisine végétale créative et les produits bio locaux.',
    specialties: ['Cuisine végétale', '100% Bio', 'Locavore', 'Zéro déchet'],
    cuisineTypes: ['Végétarienne', 'Végane', 'Crudivore'],
    services: [
      'Chef sur place',
      'Produits 100% bio',
      'Cours de cuisine',
      'Compost fourni',
    ],
    priceRange: { min: 70, max: 120 },
    certifications: ['Certifié Bio', 'Label Végane', 'Commerce équitable'],
    isFavorite: false,
    contact: {
      phone: '+33 5 56 12 34 56',
      email: 'chef@green-kitchen.fr',
      website: 'www.green-kitchen.bio',
    },
    menus: [],
  },
];

const CUISINE_TYPES = [
  { value: 'all', label: 'Toutes', icon: '🍽️' },
  { value: 'française', label: 'Française', icon: '🇫🇷' },
  { value: 'orientale', label: 'Orientale', icon: '🕌' },
  { value: 'italienne', label: 'Italienne', icon: '🇮🇹' },
  { value: 'asiatique', label: 'Asiatique', icon: '🥢' },
  { value: 'végétarienne', label: 'Végétarienne', icon: '🥗' },
  { value: 'fusion', label: 'Fusion', icon: '✨' },
];

const DIETARY_RESTRICTIONS = [
  'Végétarien',
  'Végan',
  'Sans gluten',
  'Sans lactose',
  'Halal',
  'Casher',
  'Sans noix',
  'Sans fruits de mer',
];

// Composant principal avec error handling complet
function CateringPageContent() {
  const user = useUser();
  const { data: profile } = useWeddingProfile();
  const { generateRecommendations, loading: aiLoading } = useAI();

  const [caterers, setCaterers] = useState<Caterer[]>([]);
  const [selectedCaterer, setSelectedCaterer] = useState<Caterer | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'traiteurs' | 'menus'>(
    'traiteurs',
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    cuisineType: 'all',
    type: 'all',
    priceRange: [0, 200],
    rating: 0,
    certifications: [] as string[],
    dietaryRestrictions: [] as string[],
  });

  // Chargement initial avec error handling
  useEffect(() => {
    const loadCaterers = async () => {
      try {
        console.log('🔄 Loading caterers data...');
        setLoading(true);
        setError(null);

        // Simuler un appel API ou charger depuis Supabase
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simule network delay

        setCaterers(DEMO_CATERERS);
        console.log('✅ Caterers loaded successfully:', DEMO_CATERERS.length);
      } catch (err) {
        console.error('❌ Error loading caterers:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    loadCaterers();
  }, []);

  const toggleFavorite = (catererId: string) => {
    console.log('💝 Toggling favorite for caterer:', catererId);
    setCaterers((prev) =>
      prev.map((caterer) =>
        caterer.id === catererId
          ? { ...caterer, isFavorite: !caterer.isFavorite }
          : caterer,
      ),
    );
  };

  const generateAIRecommendations = async () => {
    try {
      console.log('🤖 Generating AI recommendations...');
      const recommendations = await generateRecommendations(
        user,
        profile,
        'catering',
      );
      console.log('✅ AI recommendations generated:', recommendations);
    } catch (error) {
      console.error('❌ Error generating AI recommendations:', error);
    }
  };

  const filteredCaterers = caterers.filter((caterer) => {
    const matchesSearch =
      caterer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caterer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caterer.cuisineTypes.some((type) =>
        type.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesPrice =
      caterer.priceRange.min >= filters.priceRange[0] &&
      caterer.priceRange.max <= filters.priceRange[1];
    const matchesRating = caterer.rating >= filters.rating;
    const matchesCuisine =
      filters.cuisineType === 'all' ||
      caterer.cuisineTypes.some((type) =>
        type.toLowerCase().includes(filters.cuisineType),
      );
    const matchesType = filters.type === 'all' || caterer.type === filters.type;

    return (
      matchesSearch &&
      matchesPrice &&
      matchesRating &&
      matchesCuisine &&
      matchesType
    );
  });

  const allMenus = caterers.flatMap((caterer) =>
    caterer.menus.map((menu) => ({
      ...menu,
      _catererName: caterer.name,
      _catererRating: caterer.rating,
    })),
  );

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 h-8 w-64 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Grille skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CatererSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <ExclamationTriangleIcon className="mx-auto mb-4 size-16 text-red-500" />
          <h3 className="mb-2 text-xl font-bold text-gray-900">
            Erreur de chargement
          </h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <CakeIcon className="size-8 text-pink-600" />
            Traiteurs & Menus
          </h1>
          <p className="mt-1 text-gray-600">
            Régalez vos invités avec les meilleurs prestataires
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AIButton onGenerate={generateAIRecommendations} loading={aiLoading}>
            Suggestions menu IA
          </AIButton>
          <Button variant="outline" size="sm">
            <ShareIcon className="mr-2 size-4" />
            Partager
          </Button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('traiteurs')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'traiteurs'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            )}
          >
            Traiteurs ({caterers.length})
          </button>
          <button
            onClick={() => setActiveTab('menus')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'menus'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            )}
          >
            Menus ({allMenus.length})
          </button>
        </nav>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, cuisine, spécialité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-lg focus:border-transparent focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Types de cuisine */}
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={
                    filters.cuisineType === type.value ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, cuisineType: type.value }))
                  }
                  className="whitespace-nowrap"
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </Button>
              ))}
            </div>

            {/* Filtres avancés */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <AdjustmentsHorizontalIcon className="size-4" />
              Filtres
            </Button>
          </div>

          {/* Panneau de filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 space-y-4 border-t pt-6"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Budget par personne (€)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange[0]}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            priceRange: [
                              Number(e.target.value),
                              prev.priceRange[1],
                            ],
                          }))
                        }
                        className="flex-1 rounded-md border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-pink-500"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange[1]}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            priceRange: [
                              prev.priceRange[0],
                              Number(e.target.value),
                            ],
                          }))
                        }
                        className="flex-1 rounded-md border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Type de prestataire
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="all">Tous types</option>
                      <option value="traiteur">Traiteur</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="chef-domicile">Chef à domicile</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Note minimum
                    </label>
                    <select
                      value={filters.rating}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          rating: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-md border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-pink-500"
                    >
                      <option value={0}>Toutes les notes</option>
                      <option value={4.5}>4.5+ étoiles</option>
                      <option value={4}>4+ étoiles</option>
                      <option value={3.5}>3.5+ étoiles</option>
                    </select>
                  </div>
                </div>

                {/* Restrictions alimentaires */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-700">
                    Restrictions alimentaires
                  </label>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {DIETARY_RESTRICTIONS.map((restriction) => (
                      <div key={restriction} className="flex items-center">
                        <input
                          type="checkbox"
                          id={restriction}
                          checked={filters.dietaryRestrictions.includes(
                            restriction,
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters((prev) => ({
                                ...prev,
                                dietaryRestrictions: [
                                  ...prev.dietaryRestrictions,
                                  restriction,
                                ],
                              }));
                            } else {
                              setFilters((prev) => ({
                                ...prev,
                                dietaryRestrictions:
                                  prev.dietaryRestrictions.filter(
                                    (r) => r !== restriction,
                                  ),
                              }));
                            }
                          }}
                          className="mr-2 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                        <label
                          htmlFor={restriction}
                          className="text-sm text-gray-700"
                        >
                          {restriction}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'traiteurs' ? (
        <>
          {/* Résultats traiteurs */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredCaterers.length} traiteur
              {filteredCaterers.length > 1 ? 's' : ''} trouvé
              {filteredCaterers.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Trier par :</span>
              <select className="rounded-md border border-gray-200 px-3 py-1 text-sm focus:ring-2 focus:ring-pink-500">
                <option>Pertinence</option>
                <option>Prix croissant</option>
                <option>Prix décroissant</option>
                <option>Note</option>
              </select>
            </div>
          </div>

          {/* Grille des traiteurs */}
          {filteredCaterers.length === 0 ? (
            <div className="py-12 text-center">
              <CakeIcon className="mx-auto mb-4 size-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Aucun traiteur trouvé
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche ou explorez
                d'autres options.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCaterers.map((caterer) => (
                <motion.div
                  key={caterer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="group h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <div className="relative">
                      <div className="relative aspect-video">
                        <SafeImage
                          src={caterer.images[0]}
                          alt={`Cuisine de ${caterer.name}`}
                          fill
                          className="transition-transform duration-300 group-hover:scale-105"
                          priority={false}
                        />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <span className="rounded-full bg-pink-100 px-2 py-1 text-xs font-medium capitalize text-pink-700">
                            {caterer.type.replace('-', ' ')}
                          </span>
                          {caterer.certifications.length > 0 && (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                              Certifié
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(caterer.id);
                          }}
                          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
                        >
                          <HeartIcon
                            className={cn(
                              'size-4 transition-colors',
                              caterer.isFavorite
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-600 hover:text-red-500',
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-pink-600">
                            {caterer.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {caterer.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <StarSolidIcon className="size-4 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {caterer.rating}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            ({caterer.reviewCount})
                          </p>
                        </div>
                      </div>

                      <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                        {caterer.description}
                      </p>

                      {/* Spécialités */}
                      <div className="mb-3 flex flex-wrap gap-1">
                        {caterer.specialties.slice(0, 2).map((specialty) => (
                          <span
                            key={specialty}
                            className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700"
                          >
                            {specialty}
                          </span>
                        ))}
                        {caterer.specialties.length > 2 && (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                            +{caterer.specialties.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                          <CurrencyEuroIcon className="size-4" />
                          {caterer.priceRange.min}-{caterer.priceRange.max}
                          €/pers.
                        </div>
                        <div className="text-sm text-gray-600">
                          {caterer.menus.length} menu
                          {caterer.menus.length > 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedCaterer(caterer)}
                        >
                          Voir détails
                        </Button>
                        {caterer.contact.phone && (
                          <Button variant="outline" size="sm">
                            <PhoneIcon className="size-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Onglet Menus */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {allMenus.length === 0 ? (
            <div className="col-span-2 py-12 text-center">
              <CakeIcon className="mx-auto mb-4 size-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Aucun menu disponible
              </h3>
              <p className="text-gray-600">
                Les menus détaillés seront bientôt disponibles.
              </p>
            </div>
          ) : (
            allMenus.map((menu) => (
              <Card
                key={menu.id}
                className="cursor-pointer transition-all hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{menu.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {menu._catererName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <StarSolidIcon className="size-4 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {menu._catererRating}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-pink-600">
                        {menu.pricePerPerson}€
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-gray-600">{menu.description}</p>

                  <div className="mb-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UsersIcon className="size-4" />
                      Minimum {menu.minimumGuests} personnes
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ClockIcon className="size-4" />
                      {menu.servingStyle}
                    </div>
                  </div>

                  {/* Aperçu des plats */}
                  <div className="mb-4 space-y-2">
                    <h4 className="font-medium text-gray-900">
                      Plats inclus :
                    </h4>
                    {menu.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-start gap-2">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                            item.category === 'entrée'
                              ? 'bg-green-400'
                              : item.category === 'plat'
                                ? 'bg-orange-400'
                                : 'bg-pink-400',
                          )}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                            {item.popular && (
                              <span className="text-xs text-yellow-600">
                                ⭐ Populaire
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            {item.description}
                          </p>
                          {item.dietaryInfo.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.dietaryInfo.map((info) => (
                                <span
                                  key={info}
                                  className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                                >
                                  {info}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {menu.items.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{menu.items.length - 3} autres plats...
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setSelectedMenu(menu)}
                  >
                    Voir le menu complet
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal détails traiteur */}
      <AnimatePresence>
        {selectedCaterer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedCaterer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <div className="relative aspect-video bg-gray-200">
                  <SafeImage
                    src={selectedCaterer.images[0]}
                    alt={selectedCaterer.name}
                    fill
                    priority
                  />
                  <button
                    onClick={() => setSelectedCaterer(null)}
                    className="absolute right-4 top-4 rounded-full bg-white p-2 transition-colors hover:bg-gray-100"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">
                      {selectedCaterer.name}
                    </h2>
                    <p className="mb-2 text-gray-600">
                      {selectedCaterer.location}
                    </p>
                    <p className="text-gray-700">
                      {selectedCaterer.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarSolidIcon
                            key={star}
                            className={cn(
                              'size-4',
                              star <= selectedCaterer.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300',
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-medium">
                        {selectedCaterer.rating}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      ({selectedCaterer.reviewCount} avis)
                    </p>
                    <p className="mt-2 text-lg font-bold text-pink-600">
                      {selectedCaterer.priceRange.min}-
                      {selectedCaterer.priceRange.max}€/pers.
                    </p>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Services */}
                  <div>
                    <h3 className="mb-3 font-semibold text-gray-900">
                      Services proposés
                    </h3>
                    <div className="space-y-2">
                      {selectedCaterer.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircleIconSolid className="size-4 shrink-0 text-green-500" />
                          <span>{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h3 className="mb-3 font-semibold text-gray-900">
                      Certifications
                    </h3>
                    <div className="space-y-2">
                      {selectedCaterer.certifications.map((cert, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircleIconSolid className="size-4 shrink-0 text-blue-500" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="mb-6">
                  <h3 className="mb-3 font-semibold text-gray-900">Contact</h3>
                  <div className="flex flex-wrap gap-4">
                    {selectedCaterer.contact.phone && (
                      <a
                        href={`tel:${selectedCaterer.contact.phone}`}
                        className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-pink-600"
                      >
                        <PhoneIcon className="size-4" />
                        {selectedCaterer.contact.phone}
                      </a>
                    )}
                    {selectedCaterer.contact.email && (
                      <a
                        href={`mailto:${selectedCaterer.contact.email}`}
                        className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-pink-600"
                      >
                        <EnvelopeIcon className="size-4" />
                        {selectedCaterer.contact.email}
                      </a>
                    )}
                    {selectedCaterer.contact.website && (
                      <a
                        href={selectedCaterer.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-pink-600"
                      >
                        <GlobeAltIcon className="size-4" />
                        Site web
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="flex-1">Demander un devis</Button>
                  <Button
                    variant="outline"
                    onClick={() => toggleFavorite(selectedCaterer.id)}
                  >
                    <HeartIcon
                      className={cn(
                        'size-4 mr-2',
                        selectedCaterer.isFavorite
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600',
                      )}
                    />
                    {selectedCaterer.isFavorite ? 'Favoris' : 'Ajouter'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal détails menu */}
      <AnimatePresence>
        {selectedMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedMenu(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">
                      {selectedMenu.name}
                    </h2>
                    <p className="mb-2 text-gray-600">
                      {
                        caterers.find((c) =>
                          c.menus.some((m) => m.id === selectedMenu?.id),
                        )?.name
                      }
                    </p>
                    <p className="text-gray-700">{selectedMenu.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMenu(null)}
                    className="rounded-full p-2 transition-colors hover:bg-gray-100"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="text-2xl font-bold text-pink-600">
                      {selectedMenu.pricePerPerson}€
                    </div>
                    <div className="text-sm text-gray-600">par personne</div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="text-lg font-medium text-gray-900">
                      {selectedMenu.minimumGuests}+
                    </div>
                    <div className="text-sm text-gray-600">
                      personnes minimum
                    </div>
                  </div>
                </div>

                {/* Plats du menu */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    Composition du menu
                  </h3>
                  {selectedMenu.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">
                              {item.name}
                            </h4>
                            <span
                              className={cn(
                                'px-2 py-1 rounded-full text-xs font-medium',
                                item.category === 'entrée'
                                  ? 'bg-green-100 text-green-700'
                                  : item.category === 'plat'
                                    ? 'bg-orange-100 text-orange-700'
                                    : item.category === 'dessert'
                                      ? 'bg-pink-100 text-pink-700'
                                      : 'bg-blue-100 text-blue-700',
                              )}
                            >
                              {item.category}
                            </span>
                            {item.popular && (
                              <span className="text-yellow-500">⭐</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                        <span className="font-medium text-gray-900">
                          {item.price}€
                        </span>
                      </div>

                      {/* Informations diététiques */}
                      {(item.dietaryInfo.length > 0 ||
                        item.allergens.length > 0) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.dietaryInfo.map((info) => (
                            <span
                              key={info}
                              className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                            >
                              ✓ {info}
                            </span>
                          ))}
                          {item.allergens.map((allergen) => (
                            <span
                              key={allergen}
                              className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700"
                            >
                              ⚠ {allergen}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button className="flex-1">Sélectionner ce menu</Button>
                  <Button variant="outline">Demander personnalisation</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Composant principal avec Error Boundary
export default function CateringPage() {
  console.log('🎂 CateringPage component mounting...');

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error(
          '❌ CateringPage Error Boundary caught an error:',
          error,
          errorInfo,
        );
      }}
    >
      <CateringPageContent />
    </ErrorBoundary>
  );
}
