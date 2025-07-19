'use client';

import {
  PhotoIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CameraIcon,
  ClockIcon,
  CurrencyEuroIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

import { AIButton } from '@/components/ai/ai-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeddingProfile } from '@/hooks/use-wedding-profile';
import { useAI } from '@/hooks/use-ai';
import { useUser } from '@/lib/auth';
import { cn } from '@/utils/cn';

// Types
interface Photo {
  id: string;
  url: string;
  title: string;
  category: 'cérémonie' | 'cocktail' | 'reception' | 'couple' | 'portrait' | 'détails';
  isVideo?: boolean;
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  includes: string[];
  deliveryTime: string;
  photos: number;
  videos?: number;
  popular?: boolean;
}

interface Photographer {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  profileImage: string;
  coverImage: string;
  bio: string;
  style: string[];
  experience: number;
  languages: string[];
  equipment: string[];
  portfolio: Photo[];
  packages: Package[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
  };
  availability: boolean;
  isFavorite?: boolean;
  awards: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

// Données de démonstration
const DEMO_PHOTOGRAPHERS: Photographer[] = [
  {
    id: '1',
    name: 'Sophie Martinez',
    location: 'Paris, France',
    rating: 4.9,
    reviewCount: 127,
    profileImage: '/api/placeholder/150/150',
    coverImage: '/api/placeholder/800/400',
    bio: 'Photographe de mariage passionnée avec 8 ans d\'expérience. Je capture les moments authentiques et les émotions vraies de votre jour J avec un style romantique et intemporel.',
    style: ['Romantique', 'Naturel', 'Classique', 'Lifestyle'],
    experience: 8,
    languages: ['Français', 'Anglais', 'Espagnol'],
    equipment: ['Canon R5', 'Objectifs professionnels', 'Éclairage portable', 'Drone certifié'],
    awards: ['Wedding Awards 2023', 'Photographe de l\'année 2022'],
    availability: true,
    isFavorite: false,
    priceRange: { min: 1200, max: 2500 },
    contact: {
      phone: '+33 6 12 34 56 78',
      email: 'sophie@martinez-photo.fr',
      website: 'www.martinez-photo.fr',
      instagram: '@sophie_martinez_photo'
    },
    portfolio: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop',
        title: 'Cérémonie à la mairie',
        category: 'cérémonie',
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&h=400&fit=crop',
        title: 'Portrait des mariés',
        category: 'couple',
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&h=400&fit=crop',
        title: 'Cocktail en extérieur',
        category: 'cocktail',
      },
      // Plus de photos...
    ],
    packages: [
      {
        id: 'p1',
        name: 'Essentiel',
        description: 'Couverture complète de votre mariage avec les moments essentiels',
        price: 1200,
        duration: '8 heures',
        includes: ['Cérémonie complète', 'Cocktail', 'Début de soirée', '300+ photos retouchées', 'Galerie en ligne'],
        deliveryTime: '4 semaines',
        photos: 300,
      },
      {
        id: 'p2',
        name: 'Premium',
        description: 'Couverture étendue avec préparatifs et soirée complète',
        price: 1800,
        duration: '12 heures',
        includes: ['Préparatifs', 'Cérémonie complète', 'Cocktail', 'Soirée complète', '500+ photos retouchées', 'Album photo', 'Galerie privée'],
        deliveryTime: '3 semaines',
        photos: 500,
        popular: true,
      },
      {
        id: 'p3',
        name: 'Luxe',
        description: 'Expérience complète avec séance engagement et vidéo',
        price: 2500,
        duration: '14 heures + séance',
        includes: ['Séance engagement', 'Préparatifs', 'Journée complète', '800+ photos', 'Film de mariage', 'Albums premium', 'Tirages encadrés'],
        deliveryTime: '6 semaines',
        photos: 800,
        videos: 1,
      }
    ]
  },
  {
    id: '2',
    name: 'Lucas Dubois',
    location: 'Lyon, France',
    rating: 4.7,
    reviewCount: 94,
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=400&fit=crop',
    bio: 'Photographe documentaire spécialisé dans les mariages intimistes. Mon approche discrète permet de capturer l\'authenticité de chaque moment.',
    style: ['Documentaire', 'Vintage', 'Artistique', 'Noir et blanc'],
    experience: 6,
    languages: ['Français', 'Anglais'],
    equipment: ['Leica M11', 'Objectifs vintage', 'Film argentique'],
    awards: ['Prix du reportage 2023'],
    availability: true,
    isFavorite: true,
    priceRange: { min: 900, max: 2000 },
    contact: {
      phone: '+33 6 98 76 54 32',
      email: 'lucas@dubois-photo.fr',
      website: 'www.dubois-photo.fr'
    },
    portfolio: [],
    packages: [
      {
        id: 'p4',
        name: 'Intimiste',
        description: 'Pour les mariages de moins de 50 invités',
        price: 900,
        duration: '6 heures',
        includes: ['Cérémonie', 'Cocktail', '200+ photos', 'Retouche artistique'],
        deliveryTime: '3 semaines',
        photos: 200,
      },
    ]
  },
  {
    id: '3',
    name: 'Emma Chen',
    location: 'Nice, France',
    rating: 4.8,
    reviewCount: 156,
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&h=400&fit=crop',
    bio: 'Photographe de mode reconvertie dans le mariage. J\'apporte une touche fashion et moderne à vos photos de mariage avec un style unique.',
    style: ['Fashion', 'Moderne', 'Coloré', 'Editorial'],
    experience: 5,
    languages: ['Français', 'Anglais', 'Mandarin'],
    equipment: ['Sony A7R V', 'Éclairage studio', 'Accessoires créatifs'],
    awards: ['International Wedding Photo Award'],
    availability: false,
    isFavorite: false,
    priceRange: { min: 1500, max: 3000 },
    contact: {
      email: 'emma@chen-photography.com',
      website: 'www.chen-photography.com',
      instagram: '@emma_chen_photo'
    },
    portfolio: [],
    packages: []
  }
];

const PHOTOGRAPHY_STYLES = [
  { value: 'all', label: 'Tous styles', icon: '📸' },
  { value: 'romantique', label: 'Romantique', icon: '💕' },
  { value: 'documentaire', label: 'Documentaire', icon: '📖' },
  { value: 'artistique', label: 'Artistique', icon: '🎨' },
  { value: 'fashion', label: 'Fashion', icon: '💃' },
  { value: 'vintage', label: 'Vintage', icon: '🎞️' },
  { value: 'moderne', label: 'Moderne', icon: '✨' },
];

export default function PhotographyPage() {
  const user = useUser();
  const { data: profile } = useWeddingProfile();
  const { generateRecommendations, loading: aiLoading } = useAI();

  const [photographers, setPhotographers] = useState<Photographer[]>(DEMO_PHOTOGRAPHERS);
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<'grid' | 'portfolio'>('grid');
  const [filters, setFilters] = useState({
    style: 'all',
    priceRange: [0, 3000],
    experience: 0,
    rating: 0,
    availability: true,
    location: '',
  });

  const toggleFavorite = (photographerId: string) => {
    setPhotographers(prev => prev.map(photographer => 
      photographer.id === photographerId 
        ? { ...photographer, isFavorite: !photographer.isFavorite }
        : photographer
    ));
  };

  const generateAIRecommendations = async () => {
    try {
      const recommendations = await generateRecommendations(
        user,
        profile,
'venue'
      );
      console.log('Recommandations IA pour les photographes:', recommendations);
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
    }
  };

  const filteredPhotographers = photographers.filter(photographer => {
    const matchesSearch = photographer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photographer.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photographer.style.some(style => style.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStyle = filters.style === 'all' || 
                        photographer.style.some(style => style.toLowerCase().includes(filters.style));
    const matchesPrice = photographer.priceRange.min >= filters.priceRange[0] && 
                        photographer.priceRange.max <= filters.priceRange[1];
    const matchesExperience = photographer.experience >= filters.experience;
    const matchesRating = photographer.rating >= filters.rating;
    const matchesAvailability = !filters.availability || photographer.availability;
    const matchesLocation = !filters.location || 
                           photographer.location.toLowerCase().includes(filters.location.toLowerCase());

    return matchesSearch && matchesStyle && matchesPrice && matchesExperience && 
           matchesRating && matchesAvailability && matchesLocation;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <PhotoIcon className="size-8 text-pink-600" />
            Photographes
          </h1>
          <p className="mt-1 text-gray-600">
            Immortalisez les plus beaux moments de votre mariage
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView(activeView === 'grid' ? 'portfolio' : 'grid')}
          >
            <EyeIcon className="size-4 mr-2" />
            {activeView === 'grid' ? 'Vue Portfolio' : 'Vue Grille'}
          </Button>
          <AIButton onGenerate={generateAIRecommendations} loading={aiLoading}>
            Correspondances IA
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
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, style, localisation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
                />
              </div>
            </div>

            {/* Styles photographiques */}
            <div className="flex flex-wrap gap-2">
              {PHOTOGRAPHY_STYLES.map((style) => (
                <Button
                  key={style.value}
                  variant={filters.style === style.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, style: style.value }))}
                  className="whitespace-nowrap"
                >
                  <span className="mr-2">{style.icon}</span>
                  {style.label}
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
                className="mt-6 pt-6 border-t space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      Expérience minimum
                    </label>
                    <select
                      value={filters.experience}
                      onChange={(e) => setFilters(prev => ({ ...prev, experience: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500"
                    >
                      <option value={0}>Toute expérience</option>
                      <option value={2}>2+ années</option>
                      <option value={5}>5+ années</option>
                      <option value={10}>10+ années</option>
                    </select>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localisation
                    </label>
                    <input
                      type="text"
                      placeholder="Ville, région..."
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="availability"
                    checked={filters.availability}
                    onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.checked }))}
                    className="mr-2 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label htmlFor="availability" className="text-sm text-gray-700">
                    Disponible uniquement
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Résultats */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {filteredPhotographers.length} photographe{filteredPhotographers.length > 1 ? 's' : ''} trouvé{filteredPhotographers.length > 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Trier par :</span>
          <select className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-pink-500">
            <option>Pertinence</option>
            <option>Prix croissant</option>
            <option>Prix décroissant</option>
            <option>Note</option>
            <option>Expérience</option>
          </select>
        </div>
      </div>

      {/* Grille des photographes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotographers.map((photographer) => (
          <motion.div
            key={photographer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="overflow-hidden h-full cursor-pointer group hover:shadow-lg transition-all duration-300">
              <div className="relative">
                <div className="aspect-video relative bg-gray-200">
                  <Image
                    src={photographer.coverImage}
                    alt={`Travail de ${photographer.name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {photographer.availability ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Disponible
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Complet
                      </span>
                    )}
                    {photographer.awards.length > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Primé
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(photographer.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    {photographer.isFavorite ? (
                      <HeartSolidIcon className="size-4 text-red-500" />
                    ) : (
                      <HeartIcon className="size-4 text-gray-600 hover:text-red-500" />
                    )}
                  </button>
                </div>

                {/* Photo de profil */}
                <div className="absolute -bottom-6 left-4">
                  <div className="size-12 rounded-full border-4 border-white overflow-hidden">
                    <Image
                      src={photographer.profileImage}
                      alt={photographer.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <CardContent className="pt-8 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                      {photographer.name}
                    </h3>
                    <p className="text-sm text-gray-600">{photographer.location}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {photographer.experience} ans d'expérience
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <StarSolidIcon className="size-4 text-yellow-400" />
                      <span className="font-medium text-sm">{photographer.rating}</span>
                    </div>
                    <p className="text-xs text-gray-600">({photographer.reviewCount})</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {photographer.bio}
                </p>

                {/* Styles */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {photographer.style.slice(0, 2).map((style) => (
                    <span
                      key={style}
                      className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs"
                    >
                      {style}
                    </span>
                  ))}
                  {photographer.style.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      +{photographer.style.length - 2}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <CurrencyEuroIcon className="size-4" />
                    {photographer.priceRange.min}-{photographer.priceRange.max}€
                  </div>
                  <div className="text-sm text-gray-600">
                    {photographer.packages.length} forfait{photographer.packages.length > 1 ? 's' : ''}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedPhotographer(photographer)}
                  >
                    <CameraIcon className="size-4 mr-2" />
                    Voir portfolio
                  </Button>
                  {photographer.contact.phone && (
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

      {/* Modal détails photographe */}
      <AnimatePresence>
        {selectedPhotographer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPhotographer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cover image */}
              <div className="relative h-64">
                <Image
                  src={selectedPhotographer.coverImage}
                  alt={`Travail de ${selectedPhotographer.name}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setSelectedPhotographer(null)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="size-5" />
                </button>
                
                {/* Profile info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="flex items-end gap-4">
                    <div className="size-20 rounded-full border-4 border-white overflow-hidden">
                      <Image
                        src={selectedPhotographer.profileImage}
                        alt={selectedPhotographer.name}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                    <div className="text-white">
                      <h2 className="text-2xl font-bold">{selectedPhotographer.name}</h2>
                      <p className="text-gray-200">{selectedPhotographer.location}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <StarSolidIcon className="size-4 text-yellow-400" />
                          <span className="font-medium">{selectedPhotographer.rating}</span>
                          <span className="text-gray-300">({selectedPhotographer.reviewCount})</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-200">{selectedPhotographer.experience} ans</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Colonne principale */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">À propos</h3>
                      <p className="text-gray-700">{selectedPhotographer.bio}</p>
                    </div>

                    {/* Portfolio */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Portfolio</h3>
                      {selectedPhotographer.portfolio.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedPhotographer.portfolio.slice(0, 6).map((photo) => (
                            <div
                              key={photo.id}
                              className="aspect-square relative cursor-pointer group overflow-hidden rounded-lg"
                              onClick={() => setSelectedPhoto(photo)}
                            >
                              <Image
                                src={photo.url}
                                alt={photo.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {photo.isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <PlayIcon className="size-12 text-white drop-shadow-lg" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity">
                                <div className="absolute bottom-2 left-2 right-2">
                                  <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    {photo.title}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <PhotoIcon className="size-12 mx-auto mb-2 opacity-50" />
                          <p>Portfolio en cours de mise à jour</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Prix et disponibilité */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Tarifs</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">
                            {selectedPhotographer.priceRange.min}€ - {selectedPhotographer.priceRange.max}€
                          </div>
                          <div className="text-sm text-gray-600">selon le forfait</div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-sm">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            selectedPhotographer.availability ? "bg-green-400" : "bg-red-400"
                          )} />
                          <span className={selectedPhotographer.availability ? "text-green-700" : "text-red-700"}>
                            {selectedPhotographer.availability ? "Disponible" : "Complet"}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <Button className="w-full">
                            <CalendarDaysIcon className="size-4 mr-2" />
                            Vérifier disponibilité
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => toggleFavorite(selectedPhotographer.id)}
                          >
                            {selectedPhotographer.isFavorite ? (
                              <HeartSolidIcon className="size-4 mr-2 text-red-500" />
                            ) : (
                              <HeartIcon className="size-4 mr-2" />
                            )}
                            {selectedPhotographer.isFavorite ? 'Retirer favoris' : 'Ajouter favoris'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Forfaits */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Forfaits</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedPhotographer.packages.map((pkg) => (
                          <div key={pkg.id} className={cn(
                            "p-4 border rounded-lg cursor-pointer transition-colors",
                            pkg.popular ? "border-pink-300 bg-pink-50" : "border-gray-200 hover:border-pink-200"
                          )}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium flex items-center gap-2">
                                  {pkg.name}
                                  {pkg.popular && <span className="text-xs bg-pink-600 text-white px-2 py-1 rounded-full">Populaire</span>}
                                </h4>
                                <p className="text-sm text-gray-600">{pkg.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-pink-600">{pkg.price}€</div>
                                <div className="text-xs text-gray-600">{pkg.duration}</div>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <PhotoIcon className="size-3" />
                                <span>{pkg.photos}+ photos</span>
                              </div>
                              {pkg.videos && (
                                <div className="flex items-center gap-2">
                                  <PlayIcon className="size-3" />
                                  <span>{pkg.videos} vidéo</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <ClockIcon className="size-3" />
                                <span>Livraison en {pkg.deliveryTime}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contact</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedPhotographer.contact.phone && (
                          <a
                            href={`tel:${selectedPhotographer.contact.phone}`}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                          >
                            <PhoneIcon className="size-4" />
                            {selectedPhotographer.contact.phone}
                          </a>
                        )}
                        {selectedPhotographer.contact.email && (
                          <a
                            href={`mailto:${selectedPhotographer.contact.email}`}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                          >
                            <EnvelopeIcon className="size-4" />
                            {selectedPhotographer.contact.email}
                          </a>
                        )}
                        {selectedPhotographer.contact.website && (
                          <a
                            href={selectedPhotographer.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                          >
                            <GlobeAltIcon className="size-4" />
                            Site web
                          </a>
                        )}
                        {selectedPhotographer.contact.instagram && (
                          <a
                            href={`https://instagram.com/${selectedPhotographer.contact.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                          >
                            <span className="text-pink-500 font-bold">@</span>
                            {selectedPhotographer.contact.instagram}
                          </a>
                        )}
                      </CardContent>
                    </Card>

                    {/* Récompenses */}
                    {selectedPhotographer.awards.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Récompenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedPhotographer.awards.map((award, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <span className="text-yellow-500">🏆</span>
                                <span>{award}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox pour les photos */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-4xl max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  width={800}
                  height={600}
                  className="max-w-full max-h-[80vh] object-contain"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              <div className="mt-4 text-center text-white">
                <h3 className="text-lg font-medium">{selectedPhoto.title}</h3>
                <p className="text-gray-300 capitalize">{selectedPhoto.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 