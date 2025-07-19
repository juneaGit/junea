'use client';

import {
  MusicalNoteIcon,
  MagnifyingGlassIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PlayIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  CurrencyEuroIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  PlusIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

import { AIButton } from '@/components/ai/ai-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeddingProfile } from '@/hooks/use-wedding-profile';
import { useAI } from '@/hooks/use-ai';
import { useUser } from '@/lib/auth';
import { cn } from '@/utils/cn';

// Types
interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  mood: 'romantic' | 'festive' | 'chill' | 'danceable' | 'classical';
  occasion: 'ceremony' | 'cocktail' | 'dinner' | 'party' | 'first-dance';
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: Track[];
  duration: string;
  occasion: string;
}

interface MusicService {
  id: string;
  name: string;
  type: 'dj' | 'band' | 'solo' | 'duo';
  location: string;
  rating: number;
  reviewCount: number;
  images: string[];
  profileImage: string;
  bio: string;
  genres: string[];
  services: string[];
  equipment: string[];
  experience: number;
  languages: string[];
  priceRange: {
    min: number;
    max: number;
  };
  availability: boolean;
  isFavorite?: boolean;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
  };
  portfolioTracks: Track[];
  testimonials: {
    client: string;
    comment: string;
    rating: number;
  }[];
}

// Données de démonstration
const DEMO_MUSIC_SERVICES: MusicService[] = [
  {
    id: '1',
    name: 'DJ Maxime Laurent',
    type: 'dj',
    location: 'Paris, France',
    rating: 4.9,
    reviewCount: 156,
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    ],
    profileImage:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: "DJ professionnel spécialisé dans les mariages avec 10 ans d'expérience. Je m'adapte à tous les styles musicaux et créé l'ambiance parfaite pour votre jour J.",
    genres: ['Pop', 'Rock', 'Électro', 'R&B', 'Classique', 'Français'],
    services: [
      'Animation complète',
      'Éclairage LED',
      'Sonorisation',
      'Micro sans fil',
      'Playlist personnalisée',
    ],
    equipment: [
      'Table de mixage Pioneer',
      'Enceintes JBL',
      'Éclairage RGB',
      'Micro HF',
    ],
    experience: 10,
    languages: ['Français', 'Anglais'],
    priceRange: { min: 800, max: 1500 },
    availability: true,
    isFavorite: false,
    contact: {
      phone: '+33 6 12 34 56 78',
      email: 'maxime@djlaurent.fr',
      website: 'www.dj-maxime-laurent.fr',
      instagram: '@dj_maxime_laurent',
    },
    portfolioTracks: [
      {
        id: '1',
        title: 'Perfect',
        artist: 'Ed Sheeran',
        genre: 'Pop',
        duration: '4:23',
        mood: 'romantic',
        occasion: 'first-dance',
      },
      {
        id: '2',
        title: 'Uptown Funk',
        artist: 'Mark Ronson ft. Bruno Mars',
        genre: 'Funk',
        duration: '4:30',
        mood: 'danceable',
        occasion: 'party',
      },
    ],
    testimonials: [
      {
        client: 'Sophie & Pierre',
        comment:
          "DJ Maxime a été parfait ! Il a su créer l'ambiance idéale et faire danser tout le monde.",
        rating: 5,
      },
    ],
  },
  {
    id: '2',
    name: 'Acoustic Duo - Emma & Jules',
    type: 'duo',
    location: 'Lyon, France',
    rating: 4.7,
    reviewCount: 89,
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    ],
    profileImage:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    bio: 'Duo acoustique spécialisé dans les cérémonies et cocktails. Nous proposons un répertoire varié de reprises acoustiques et de créations originales.',
    genres: ['Acoustique', 'Folk', 'Pop', 'Jazz', 'Français'],
    services: [
      'Cérémonie laïque',
      'Cocktail',
      "Vin d'honneur",
      'Sonorisation incluse',
    ],
    equipment: ['Guitares acoustiques', 'Sonorisation portable', 'Micros'],
    experience: 6,
    languages: ['Français', 'Anglais'],
    priceRange: { min: 600, max: 1000 },
    availability: true,
    isFavorite: true,
    contact: {
      phone: '+33 6 98 76 54 32',
      email: 'contact@emmajules.fr',
      website: 'www.acoustic-duo-emmajules.fr',
    },
    portfolioTracks: [],
    testimonials: [],
  },
  {
    id: '3',
    name: 'The Wedding Band',
    type: 'band',
    location: 'Marseille, France',
    rating: 4.8,
    reviewCount: 124,
    images: [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
    ],
    profileImage:
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face',
    bio: 'Groupe de 5 musiciens professionnels. Nous couvrons tous les styles musicaux et garantissons une ambiance festive pour votre mariage.',
    genres: ['Rock', 'Pop', 'Funk', 'Soul', 'Disco', 'Variété française'],
    services: [
      'Concert live',
      'Animation complète',
      'Sonorisation pro',
      'Éclairage scénique',
    ],
    equipment: [
      'Instruments live',
      'Sonorisation concert',
      'Éclairage professionnel',
    ],
    experience: 8,
    languages: ['Français', 'Anglais', 'Italien'],
    priceRange: { min: 2000, max: 3500 },
    availability: false,
    isFavorite: false,
    contact: {
      email: 'booking@theweddingband.fr',
      website: 'www.theweddingband.fr',
    },
    portfolioTracks: [],
    testimonials: [],
  },
];

const MUSIC_GENRES = [
  { value: 'all', label: 'Tous genres', icon: '🎵' },
  { value: 'pop', label: 'Pop', icon: '🎤' },
  { value: 'rock', label: 'Rock', icon: '🎸' },
  { value: 'jazz', label: 'Jazz', icon: '🎷' },
  { value: 'classique', label: 'Classique', icon: '🎼' },
  { value: 'electro', label: 'Électro', icon: '🎛️' },
  { value: 'acoustique', label: 'Acoustique', icon: '🪕' },
];

const SERVICE_TYPES = [
  { value: 'all', label: 'Tous types', icon: '🎵' },
  { value: 'dj', label: 'DJ', icon: '🎧' },
  { value: 'band', label: 'Groupe', icon: '🎸' },
  { value: 'duo', label: 'Duo', icon: '👫' },
  { value: 'solo', label: 'Solo', icon: '🎤' },
];

export default function MusicPage() {
  const user = useUser();
  const { data: profile } = useWeddingProfile();
  const { generateRecommendations, loading: aiLoading } = useAI();

  const [musicServices, setMusicServices] =
    useState<MusicService[]>(DEMO_MUSIC_SERVICES);
  const [selectedService, setSelectedService] = useState<MusicService | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'playlist'>(
    'services',
  );
  const [filters, setFilters] = useState({
    genre: 'all',
    type: 'all',
    priceRange: [0, 4000],
    rating: 0,
    availability: true,
    location: '',
  });

  const [customPlaylist, setCustomPlaylist] = useState<Track[]>([]);

  const toggleFavorite = (serviceId: string) => {
    setMusicServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? { ...service, isFavorite: !service.isFavorite }
          : service,
      ),
    );
  };

  const generateAIRecommendations = async () => {
    try {
      const recommendations = await generateRecommendations(
        user,
        profile,
        'venue',
      );
      console.log('Recommandations IA pour la musique:', recommendations);
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
    }
  };

  const filteredServices = musicServices.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.genres.some((genre) =>
        genre.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesGenre =
      filters.genre === 'all' ||
      service.genres.some((genre) =>
        genre.toLowerCase().includes(filters.genre),
      );
    const matchesType = filters.type === 'all' || service.type === filters.type;
    const matchesPrice =
      service.priceRange.min >= filters.priceRange[0] &&
      service.priceRange.max <= filters.priceRange[1];
    const matchesRating = service.rating >= filters.rating;
    const matchesAvailability = !filters.availability || service.availability;
    const matchesLocation =
      !filters.location ||
      service.location.toLowerCase().includes(filters.location.toLowerCase());

    return (
      matchesSearch &&
      matchesGenre &&
      matchesType &&
      matchesPrice &&
      matchesRating &&
      matchesAvailability &&
      matchesLocation
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MusicalNoteIcon className="size-8 text-pink-600" />
            Musique & DJ
          </h1>
          <p className="mt-1 text-gray-600">
            Créez l'ambiance parfaite pour votre mariage
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AIButton onGenerate={generateAIRecommendations} loading={aiLoading}>
            Playlist IA personnalisée
          </AIButton>
          <Button variant="outline" size="sm">
            <ShareIcon className="size-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('services')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'services'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            )}
          >
            Prestataires ({musicServices.length})
          </button>
          <button
            onClick={() => setActiveTab('playlist')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'playlist'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            )}
          >
            Ma Playlist ({customPlaylist.length})
          </button>
        </nav>
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
                  placeholder="Rechercher par nom, style musical..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
                />
              </div>
            </div>

            {/* Filtres rapides */}
            <div className="flex flex-wrap gap-2">
              {activeTab === 'services' ? (
                <>
                  {SERVICE_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      variant={
                        filters.type === type.value ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, type: type.value }))
                      }
                      className="whitespace-nowrap"
                    >
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </Button>
                  ))}
                </>
              ) : (
                <>
                  {MUSIC_GENRES.slice(0, 4).map((genre) => (
                    <Button
                      key={genre.value}
                      variant={
                        filters.genre === genre.value ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, genre: genre.value }))
                      }
                      className="whitespace-nowrap"
                    >
                      <span className="mr-2">{genre.icon}</span>
                      {genre.label}
                    </Button>
                  ))}
                </>
              )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget (€)
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
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500"
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
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          rating: Number(e.target.value),
                        }))
                      }
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
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="availability"
                    checked={filters.availability}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        availability: e.target.checked,
                      }))
                    }
                    className="mr-2 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <label
                    htmlFor="availability"
                    className="text-sm text-gray-700"
                  >
                    Disponible uniquement
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'services' ? (
        <>
          {/* Résultats prestataires */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredServices.length} prestataire
              {filteredServices.length > 1 ? 's' : ''} trouvé
              {filteredServices.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Trier par :</span>
              <select className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-pink-500">
                <option>Pertinence</option>
                <option>Prix croissant</option>
                <option>Prix décroissant</option>
                <option>Note</option>
              </select>
            </div>
          </div>

          {/* Grille des prestataires */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="overflow-hidden h-full cursor-pointer group hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <div className="aspect-video relative bg-gray-200">
                      <Image
                        src={service.images[0]}
                        alt={`Performance de ${service.name}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {service.availability ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Disponible
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Complet
                          </span>
                        )}
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium capitalize">
                          {service.type === 'dj' ? 'DJ' : service.type}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(service.id);
                        }}
                        className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      >
                        {service.isFavorite ? (
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
                          src={service.profileImage}
                          alt={service.name}
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
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {service.location}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {service.experience} ans d'expérience
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <StarSolidIcon className="size-4 text-yellow-400" />
                          <span className="font-medium text-sm">
                            {service.rating}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          ({service.reviewCount})
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {service.bio}
                    </p>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {service.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                        >
                          {genre}
                        </span>
                      ))}
                      {service.genres.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{service.genres.length - 2}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                        <CurrencyEuroIcon className="size-4" />
                        {service.priceRange.min}-{service.priceRange.max}€
                      </div>
                      <div className="text-sm text-gray-600">
                        {service.services.length} service
                        {service.services.length > 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedService(service)}
                      >
                        <PlayIcon className="size-4 mr-2" />
                        Voir détails
                      </Button>
                      {service.contact.phone && (
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
        </>
      ) : (
        /* Onglet Playlist */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ListBulletIcon className="size-5" />
                Ma Playlist Personnalisée
              </CardTitle>
              <Button size="sm">
                <PlusIcon className="size-4 mr-2" />
                Ajouter une chanson
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {customPlaylist.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MusicalNoteIcon className="size-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  Votre playlist est vide
                </h3>
                <p className="text-sm mb-4">
                  Commencez à créer votre playlist parfaite pour le jour J
                </p>
                <Button>
                  <SparklesIcon className="size-4 mr-2" />
                  Générer avec l'IA
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {customPlaylist.map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-500 font-mono text-sm w-8 text-center">
                      {index + 1}
                    </span>
                    <PlayIcon className="size-8 text-pink-500 bg-pink-100 rounded-full p-2 cursor-pointer hover:bg-pink-200 transition-colors" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {track.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {track.artist}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {track.duration}
                    </div>
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        track.mood === 'romantic'
                          ? 'bg-pink-100 text-pink-700'
                          : track.mood === 'festive'
                            ? 'bg-yellow-100 text-yellow-700'
                            : track.mood === 'danceable'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700',
                      )}
                    >
                      {track.occasion}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal détails prestataire */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cover image */}
              <div className="relative h-64">
                <Image
                  src={selectedService.images[0]}
                  alt={`Performance de ${selectedService.name}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="size-5" />
                </button>

                {/* Profile info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="flex items-end gap-4">
                    <div className="size-20 rounded-full border-4 border-white overflow-hidden">
                      <Image
                        src={selectedService.profileImage}
                        alt={selectedService.name}
                        width={80}
                        height={80}
                        className="object-cover"
                      />
                    </div>
                    <div className="text-white">
                      <h2 className="text-2xl font-bold">
                        {selectedService.name}
                      </h2>
                      <p className="text-gray-200">
                        {selectedService.location}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <StarSolidIcon className="size-4 text-yellow-400" />
                          <span className="font-medium">
                            {selectedService.rating}
                          </span>
                          <span className="text-gray-300">
                            ({selectedService.reviewCount})
                          </span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-200">
                          {selectedService.experience} ans
                        </span>
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
                      <h3 className="font-semibold text-gray-900 mb-2">
                        À propos
                      </h3>
                      <p className="text-gray-700">{selectedService.bio}</p>
                    </div>

                    {/* Services */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Services proposés
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedService.services.map((service, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <SpeakerWaveIcon className="size-4 text-pink-500" />
                            <span>{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Équipements */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Équipements
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedService.equipment.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <MicrophoneIcon className="size-4 text-blue-500" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Prix */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Tarifs</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">
                            {selectedService.priceRange.min}€ -{' '}
                            {selectedService.priceRange.max}€
                          </div>
                          <div className="text-sm text-gray-600">
                            pour la soirée
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button className="w-full">
                            <PhoneIcon className="size-4 mr-2" />
                            Demander un devis
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => toggleFavorite(selectedService.id)}
                          >
                            {selectedService.isFavorite ? (
                              <HeartSolidIcon className="size-4 mr-2 text-red-500" />
                            ) : (
                              <HeartIcon className="size-4 mr-2" />
                            )}
                            {selectedService.isFavorite
                              ? 'Retirer favoris'
                              : 'Ajouter favoris'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contact</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedService.contact.phone && (
                          <a
                            href={`tel:${selectedService.contact.phone}`}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                          >
                            <PhoneIcon className="size-4" />
                            {selectedService.contact.phone}
                          </a>
                        )}
                        {selectedService.contact.email && (
                          <a
                            href={`mailto:${selectedService.contact.email}`}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                          >
                            <EnvelopeIcon className="size-4" />
                            {selectedService.contact.email}
                          </a>
                        )}
                        {selectedService.contact.website && (
                          <a
                            href={selectedService.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                          >
                            <GlobeAltIcon className="size-4" />
                            Site web
                          </a>
                        )}
                        {selectedService.contact.instagram && (
                          <a
                            href={`https://instagram.com/${selectedService.contact.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                          >
                            <span className="text-pink-500 font-bold">@</span>
                            {selectedService.contact.instagram}
                          </a>
                        )}
                      </CardContent>
                    </Card>

                    {/* Genres musicaux */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Genres musicaux
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedService.genres.map((genre) => (
                            <span
                              key={genre}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
