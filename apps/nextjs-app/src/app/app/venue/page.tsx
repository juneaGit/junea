'use client';

import {
  HomeIcon,
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
  MapPinIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { AIButton } from '@/components/ai/ai-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeddingProfile } from '@/hooks/use-wedding-profile';
import { useAI } from '@/hooks/use-ai';
import { useUser } from '@/lib/auth';
import { cn } from '@/utils/cn';

// Types
interface Venue {
  id: string;
  name: string;
  type: 'château' | 'domaine' | 'salle' | 'plein-air' | 'restaurant' | 'lieu-insolite';
  location: string;
  capacity: {
    min: number;
    max: number;
  };
  priceRange: {
    min: number;
    max: number;
  };
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  amenities: string[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  style: string[];
  accessibility: boolean;
  isAvailable: boolean;
  isFavorite?: boolean;
}

// SafeImage Component avec error handling robuste
const SafeImage = ({ 
  src, 
  alt, 
  className, 
  fill = false, 
  width, 
  height,
  priority = false 
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

  // Images de fallback pour venues
  const fallbackImages = [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop', // Château
    'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop', // Jardin mariage
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop', // Salle élégante
  ];
  
  const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

  const handleImageLoad = () => {
    setIsLoading(false);
    console.log('✅ Venue image loaded successfully:', src);
  };

  const handleImageError = () => {
    console.warn('⚠️ Venue image failed to load:', src);
    setImageError(true);
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div className={cn("bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center", className)}>
        <div className="text-center p-4">
          <HomeIcon className="size-8 text-pink-400 mx-auto mb-2" />
          <p className="text-xs text-pink-600">Image indisponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}
      
      <Image
        src={imageError ? randomFallback : src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        priority={priority}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          fill ? "object-cover" : ""
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
const VenueSkeleton = () => (
  <Card className="overflow-hidden h-full">
    <div className="aspect-video bg-gray-200 animate-pulse" />
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
        </div>
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 px-4">
    <div className="text-center max-w-md">
      <ExclamationTriangleIcon className="size-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Oops ! Une erreur s'est produite
      </h2>
      <p className="text-gray-600 mb-6">
        La page des lieux a rencontré un problème. Ne vous inquiétez pas, nous pouvons la réparer !
      </p>
      <div className="space-y-3">
        <Button onClick={resetErrorBoundary} className="w-full">
          <SparklesIcon className="size-4 mr-2" />
          Réessayer
        </Button>
        <Button variant="outline" className="w-full" onClick={() => window.location.href = '/app'}>
          Retour au tableau de bord
        </Button>
      </div>
      <details className="mt-4 text-xs text-gray-500">
        <summary className="cursor-pointer">Détails techniques</summary>
        <pre className="mt-2 text-left bg-gray-100 p-2 rounded overflow-auto">
          {error.message}
        </pre>
      </details>
    </div>
  </div>
);

// Données avec images corrigées
const DEMO_VENUES: Venue[] = [
  {
    id: '1',
    name: 'Château de la Rose',
    type: 'château',
    location: 'Versailles, France',
    capacity: { min: 80, max: 200 },
    priceRange: { min: 150, max: 300 },
    rating: 4.8,
    reviewCount: 124,
    images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop'],
    description: 'Un château romantique du XVIIIe siècle avec des jardins à la française exceptionnels. Parfait pour des mariages de rêve.',
    amenities: ['Jardins', 'Parking', 'Cuisine équipée', 'Hébergement', 'Décoration incluse'],
    contact: {
      phone: '+33 1 23 45 67 89',
      email: 'contact@chateaudelarose.fr',
      website: 'www.chateaudelarose.fr'
    },
    style: ['Romantique', 'Classique', 'Élégant'],
    accessibility: true,
    isAvailable: true,
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Domaine des Vignes',
    type: 'domaine',
    location: 'Champagne, France',
    capacity: { min: 50, max: 150 },
    priceRange: { min: 80, max: 180 },
    rating: 4.6,
    reviewCount: 89,
    images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop'],
    description: 'Domaine viticole avec vue panoramique sur les vignes. Ambiance authentique et conviviale.',
    amenities: ['Cave à vin', 'Terrasse', 'Parking', 'Traiteur partenaire'],
    contact: {
      phone: '+33 3 26 12 34 56',
      email: 'info@domaine-vignes.fr'
    },
    style: ['Champêtre', 'Authentique', 'Convivial'],
    accessibility: true,
    isAvailable: true,
    isFavorite: true,
  },
  {
    id: '3',
    name: 'Villa Méditerranée',
    type: 'plein-air',
    location: 'Nice, France',
    capacity: { min: 40, max: 120 },
    priceRange: { min: 120, max: 250 },
    rating: 4.7,
    reviewCount: 156,
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&h=600&fit=crop'],
    description: 'Villa avec vue mer exceptionnelle, piscine et jardins méditerranéens.',
    amenities: ['Vue mer', 'Piscine', 'Jardins', 'Parking', 'Cuisine d\'été'],
    contact: {
      phone: '+33 4 93 12 34 56',
      email: 'contact@villa-mediterranee.fr',
      website: 'www.villa-mediterranee.fr'
    },
    style: ['Méditerranéen', 'Moderne', 'Vue mer'],
    accessibility: false,
    isAvailable: true,
    isFavorite: false,
  },
  {
    id: '4',
    name: 'Loft Parisien',
    type: 'salle',
    location: 'Paris 11e, France',
    capacity: { min: 30, max: 80 },
    priceRange: { min: 200, max: 400 },
    rating: 4.4,
    reviewCount: 67,
    images: ['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1551524164-6cf2ac15ad87?w=800&h=600&fit=crop'],
    description: 'Loft industriel moderne au cœur de Paris. Parfait pour des mariages urbains et contemporains.',
    amenities: ['Métro proche', 'Éclairage LED', 'Son inclus', 'Mobilier moderne'],
    contact: {
      phone: '+33 1 43 12 34 56',
      email: 'info@loft-parisien.fr'
    },
    style: ['Industriel', 'Moderne', 'Urbain'],
    accessibility: true,
    isAvailable: false,
    isFavorite: false,
  },
];

const VENUE_TYPES = [
  { value: 'all', label: 'Tous types', icon: '🏛️' },
  { value: 'château', label: 'Château', icon: '🏰' },
  { value: 'domaine', label: 'Domaine', icon: '🍇' },
  { value: 'salle', label: 'Salle', icon: '🏢' },
  { value: 'plein-air', label: 'Plein air', icon: '🌳' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'lieu-insolite', label: 'Lieu insolite', icon: '✨' },
];

// Composant principal avec error handling
function VenuePageContent() {
  const user = useUser();
  const { data: profile } = useWeddingProfile();
  const { generateRecommendations, loading: aiLoading } = useAI();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    capacity: [0, 500],
    priceRange: [0, 500],
    rating: 0,
    amenities: [] as string[],
    accessibility: false,
    availableOnly: true,
  });

  // Chargement initial avec error handling
  useEffect(() => {
    const loadVenues = async () => {
      try {
        console.log('🏛️ Loading venues data...');
        setLoading(true);
        setError(null);
        
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setVenues(DEMO_VENUES);
        console.log('✅ Venues loaded successfully:', DEMO_VENUES.length);
      } catch (err) {
        console.error('❌ Error loading venues:', err);
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    loadVenues();
  }, []);

  const toggleFavorite = (venueId: string) => {
    console.log('💝 Toggling favorite for venue:', venueId);
    setVenues(prev => prev.map(venue => 
      venue.id === venueId 
        ? { ...venue, isFavorite: !venue.isFavorite }
        : venue
    ));
  };

  const generateAIRecommendations = async () => {
    try {
      console.log('🤖 Generating AI venue recommendations...');
      const recommendations = await generateRecommendations(
        user,
        profile,
        'venue'
      );
      console.log('✅ AI venue recommendations generated:', recommendations);
    } catch (error) {
      console.error('❌ Error generating AI venue recommendations:', error);
    }
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type === 'all' || venue.type === filters.type;
    const matchesCapacity = venue.capacity.max >= filters.capacity[0] && venue.capacity.min <= filters.capacity[1];
    const matchesPrice = venue.priceRange.min <= filters.priceRange[1] && venue.priceRange.max >= filters.priceRange[0];
    const matchesRating = venue.rating >= filters.rating;
    const matchesAccessibility = !filters.accessibility || venue.accessibility;
    const matchesAvailability = !filters.availableOnly || venue.isAvailable;

    return matchesSearch && matchesType && matchesCapacity && matchesPrice && 
           matchesRating && matchesAccessibility && matchesAvailability;
  });

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <VenueSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <ExclamationTriangleIcon className="size-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <HomeIcon className="size-8 text-pink-600" />
            Lieux de Réception
          </h1>
          <p className="mt-1 text-gray-600">
            Trouvez le lieu parfait pour célébrer votre amour
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AIButton onGenerate={generateAIRecommendations} loading={aiLoading}>
            Suggestions IA
          </AIButton>
          <Button variant="outline" size="sm">
            <ShareIcon className="size-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un lieu par nom, ville, style..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {VENUE_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={filters.type === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, type: type.value }))}
                  className="whitespace-nowrap"
                >
                  <span className="mr-2">{type.icon}</span>
                  {type.label}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="size-4" />
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
                className="mt-6 pt-6 border-t space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacité (personnes)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.capacity[0]}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          capacity: [Number(e.target.value), prev.capacity[1]]
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.capacity[1]}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          capacity: [prev.capacity[0], Number(e.target.value)]
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget (€)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange[0]}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: [Number(e.target.value), prev.priceRange[1]]
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange[1]}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], Number(e.target.value)]
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note minimum
                    </label>
                    <select
                      value={filters.rating}
                      onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500"
                    >
                      <option value={0}>Toutes les notes</option>
                      <option value={4.5}>4.5+ étoiles</option>
                      <option value={4}>4+ étoiles</option>
                      <option value={3.5}>3.5+ étoiles</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="accessibility"
                      checked={filters.accessibility}
                      onChange={(e) => setFilters(prev => ({ ...prev, accessibility: e.target.checked }))}
                      className="mr-2 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <label htmlFor="accessibility" className="text-sm text-gray-700">
                      Accessible PMR
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="availableOnly"
                      checked={filters.availableOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, availableOnly: e.target.checked }))}
                      className="mr-2 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <label htmlFor="availableOnly" className="text-sm text-gray-700">
                      Disponibles uniquement
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Résultats */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredVenues.length} lieu{filteredVenues.length > 1 ? 'x' : ''} trouvé{filteredVenues.length > 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Trier par :</span>
          <select className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-pink-500">
            <option>Pertinence</option>
            <option>Prix croissant</option>
            <option>Prix décroissant</option>
            <option>Note</option>
            <option>Capacité</option>
          </select>
        </div>
      </div>

      {/* Grille des lieux */}
      {filteredVenues.length === 0 ? (
        <div className="text-center py-12">
          <HomeIcon className="size-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun lieu trouvé
          </h3>
          <p className="text-gray-600">
            Essayez de modifier vos critères de recherche ou explorez d'autres options.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="overflow-hidden h-full cursor-pointer group hover:shadow-lg transition-all duration-300">
                <div className="relative">
                  <div className="aspect-video relative">
                    <SafeImage
                      src={venue.images[0]}
                      alt={`${venue.name} - ${venue.location}`}
                      fill
                      className="group-hover:scale-105 transition-transform duration-300"
                      priority={false}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium capitalize">
                        {venue.type.replace('-', ' ')}
                      </span>
                      {venue.accessibility && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          ♿ PMR
                        </span>
                      )}
                      {!venue.isAvailable && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Indisponible
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(venue.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <HeartIcon className={cn(
                        "size-4 transition-colors",
                        venue.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
                      )} />
                    </button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                        {venue.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPinIcon className="size-3" />
                        {venue.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <StarSolidIcon className="size-4 text-yellow-400" />
                        <span className="font-medium text-sm">{venue.rating}</span>
                      </div>
                      <p className="text-xs text-gray-600">({venue.reviewCount})</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {venue.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {venue.style.slice(0, 2).map((style) => (
                      <span
                        key={style}
                        className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs"
                      >
                        {style}
                      </span>
                    ))}
                    {venue.style.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        +{venue.style.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <UsersIcon className="size-3" />
                      {venue.capacity.min}-{venue.capacity.max} pers.
                    </div>
                    <div className="flex items-center gap-1">
                      <CurrencyEuroIcon className="size-3" />
                      {venue.priceRange.min}-{venue.priceRange.max}€
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedVenue(venue)}
                      disabled={!venue.isAvailable}
                    >
                      Voir détails
                    </Button>
                    {venue.contact.phone && (
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

      {/* Modal détails lieu */}
      <AnimatePresence>
        {selectedVenue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedVenue(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <div className="aspect-video relative bg-gray-200">
                  <SafeImage
                    src={selectedVenue.images[0]}
                    alt={selectedVenue.name}
                    fill
                    priority
                  />
                  <button
                    onClick={() => setSelectedVenue(null)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedVenue.name}
                    </h2>
                    <p className="text-gray-600 mb-2 flex items-center gap-1">
                      <MapPinIcon className="size-4" />
                      {selectedVenue.location}
                    </p>
                    <p className="text-gray-700">{selectedVenue.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarSolidIcon
                            key={star}
                            className={cn(
                              "size-4",
                              star <= selectedVenue.rating ? "text-yellow-400" : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{selectedVenue.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600">({selectedVenue.reviewCount} avis)</p>
                    <p className="text-lg font-bold text-pink-600 mt-2">
                      {selectedVenue.priceRange.min}-{selectedVenue.priceRange.max}€
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Commodités</h3>
                    <div className="space-y-2">
                      {selectedVenue.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircleIconSolid className="size-4 text-green-500 flex-shrink-0" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Informations pratiques</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="size-4 text-gray-400 flex-shrink-0" />
                        <span>Capacité : {selectedVenue.capacity.min} à {selectedVenue.capacity.max} personnes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CurrencyEuroIcon className="size-4 text-gray-400 flex-shrink-0" />
                        <span>Budget : {selectedVenue.priceRange.min}€ à {selectedVenue.priceRange.max}€</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className={cn(
                          "size-4 flex-shrink-0",
                          selectedVenue.accessibility ? "text-green-500" : "text-gray-400"
                        )} />
                        <span>Accès PMR : {selectedVenue.accessibility ? 'Oui' : 'Non'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
                  <div className="flex flex-wrap gap-4">
                    {selectedVenue.contact.phone && (
                      <a
                        href={`tel:${selectedVenue.contact.phone}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        <PhoneIcon className="size-4" />
                        {selectedVenue.contact.phone}
                      </a>
                    )}
                    {selectedVenue.contact.email && (
                      <a
                        href={`mailto:${selectedVenue.contact.email}`}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        <EnvelopeIcon className="size-4" />
                        {selectedVenue.contact.email}
                      </a>
                    )}
                    {selectedVenue.contact.website && (
                      <a
                        href={selectedVenue.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        <GlobeAltIcon className="size-4" />
                        Site web
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1" disabled={!selectedVenue.isAvailable}>
                    {selectedVenue.isAvailable ? 'Réserver une visite' : 'Indisponible'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toggleFavorite(selectedVenue.id)}
                  >
                    <HeartIcon className={cn(
                      "size-4 mr-2",
                      selectedVenue.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                    )} />
                    {selectedVenue.isFavorite ? 'Favoris' : 'Ajouter'}
                  </Button>
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
export default function VenuePage() {
  console.log('🏛️ VenuePage component mounting...');
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('❌ VenuePage Error Boundary caught an error:', error, errorInfo);
      }}
    >
      <VenuePageContent />
    </ErrorBoundary>
  );
} 