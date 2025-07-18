'use client';

import {
  SparklesIcon,
  MapPinIcon,
  CakeIcon,
  CameraIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

import { AIRecommendation } from '../../services/ai-service';

const getRecommendationIcon = (type: string) => {
  switch (type) {
    case 'venue':
      return MapPinIcon;
    case 'catering':
      return CakeIcon;
    case 'photography':
      return CameraIcon;
    case 'music':
      return MusicalNoteIcon;
    case 'decor':
      return PaintBrushIcon;
    default:
      return SparklesIcon;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'low':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Données de démonstration pour tester l'interface
const mockRecommendations: AIRecommendation[] = [
  {
    id: '1',
    type: 'venue',
    title: 'Château de Versailles - Orangerie',
    description:
      'Pour un mariage romantique, ce lieu historique offre un cadre exceptionnel avec ses jardins à la française et son architecture classique.',
    estimatedCost: '8 000 - 12 000€',
    priority: 'high',
    tags: ['château', 'historique', 'jardins', 'romantique'],
  },
  {
    id: '2',
    type: 'catering',
    title: 'Menu gastronomique français',
    description:
      'Un menu raffiné mettant en valeur la cuisine française traditionnelle, parfait pour un mariage élégant.',
    estimatedCost: '120 - 180€/personne',
    priority: 'high',
    tags: ['gastronomique', 'français', 'raffiné'],
  },
  {
    id: '3',
    type: 'photography',
    title: 'Photographe spécialisé mariage romantique',
    description:
      'Style photographique naturel et romantique, spécialisé dans les mariages en extérieur et les portraits intimistes.',
    estimatedCost: '2 500 - 4 000€',
    priority: 'medium',
    tags: ['romantique', 'naturel', 'extérieur'],
  },
];

export function AIRecommendations() {
  const [recommendations] = useState<AIRecommendation[]>(mockRecommendations);
  const [loading, setLoading] = useState(false);

  const handleGenerateRecommendations = async () => {
    setLoading(true);
    // Simuler un appel API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="size-6 text-rose-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Recommandations IA
            </h2>
          </div>
          <button
            onClick={handleGenerateRecommendations}
            disabled={loading}
            className="inline-flex items-center rounded-md border border-transparent bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="-ml-1 mr-2 size-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Génération...
              </>
            ) : (
              <>
                <SparklesIcon className="mr-2 size-4" />
                Actualiser
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading && recommendations.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="size-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                    <div className="h-3 w-full rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const Icon = getRecommendationIcon(rec.type);
              return (
                <div
                  key={rec.id}
                  className="flex items-start space-x-4 rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
                    <Icon className="size-5 text-rose-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="mb-1 text-lg font-medium text-gray-900">
                        {rec.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(rec.priority)}`}
                      >
                        {rec.priority === 'high'
                          ? 'Priorité haute'
                          : rec.priority === 'medium'
                            ? 'Priorité moyenne'
                            : 'Priorité basse'}
                      </span>
                    </div>

                    <p className="mb-3 leading-relaxed text-gray-600">
                      {rec.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {rec.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {rec.estimatedCost && (
                        <span className="text-sm font-medium text-gray-900">
                          {rec.estimatedCost}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {recommendations.length === 0 && !loading && (
              <div className="py-8 text-center">
                <SparklesIcon className="mx-auto mb-3 size-12 text-gray-300" />
                <p className="text-gray-500">
                  Aucune recommandation disponible pour le moment
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Complétez votre profil de mariage pour obtenir des suggestions
                  personnalisées
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
