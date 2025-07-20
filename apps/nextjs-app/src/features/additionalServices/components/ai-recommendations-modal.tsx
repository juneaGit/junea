'use client';

import { useState } from 'react';
import { SparklesIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateAdditionalService } from '../api/create-additional-service';
import type { AIServiceRecommendation, AIServiceSuggestion } from '../types';

interface AIRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendations?: AIServiceRecommendation;
  userId: string;
}

export const AIRecommendationsModal = ({ 
  isOpen, 
  onClose, 
  recommendations, 
  userId 
}: AIRecommendationsModalProps) => {
  const { t } = useTranslation();
  const createServiceMutation = useCreateAdditionalService();
  
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [importingIds, setImportingIds] = useState<Set<number>>(new Set());

  const handleToggleSuggestion = (index: number) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleImportSuggestion = async (suggestion: AIServiceSuggestion, index: number) => {
    if (!userId) return;

         setImportingIds(prev => new Set(Array.from(prev).concat(index)));

    try {
      await createServiceMutation.mutateAsync({
        service_name: suggestion.service_name,
        service_type: suggestion.service_type,
        estimated_budget: Math.round((suggestion.estimated_budget_min + suggestion.estimated_budget_max) / 2),
        priority: suggestion.priority_level,
        notes: `${suggestion.description}\n\nConseils IA:\n${suggestion.tips.map(tip => `• ${tip}`).join('\n')}`,
        status: 'recherche',
        user_id: userId,
      });

      // Marquer comme importé
      setSelectedSuggestions(prev => {
        const newSet = new Set(prev);
        newSet.add(index);
        return newSet;
      });

    } catch (error) {
      console.error('Erreur import suggestion:', error);
    } finally {
      setImportingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const handleImportSelected = async () => {
    if (!recommendations?.suggestions || !userId) return;

    const selectedSuggestionsArray = Array.from(selectedSuggestions);
    
    // Importer toutes les suggestions sélectionnées
    for (const index of selectedSuggestionsArray) {
      const suggestion = recommendations.suggestions[index];
      if (suggestion && !importingIds.has(index)) {
        await handleImportSuggestion(suggestion, index);
      }
    }
  };

  const handleClose = () => {
    setSelectedSuggestions(new Set());
    setImportingIds(new Set());
    onClose();
  };

  if (!recommendations) {
    return null;
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'text-gray-600 bg-gray-100';
    if (priority === 3) return 'text-yellow-600 bg-yellow-100';
    if (priority === 4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-blue-600" />
            {t('additionalServices.aiSuggestions')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Explication des recommandations */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              Recommandations pour un mariage {recommendations.wedding_type}
            </h3>
            <p className="text-sm text-blue-700">
              {recommendations.reasoning}
            </p>
            <div className="mt-2 text-sm text-blue-600">
              <strong>Coût total estimé :</strong> {recommendations.total_estimated_cost.toLocaleString()}€
            </div>
          </div>

          {/* Actions groupées */}
          {selectedSuggestions.size > 0 && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <span className="text-sm text-gray-600">
                {selectedSuggestions.size} suggestion(s) sélectionnée(s)
              </span>
              <Button 
                onClick={handleImportSelected}
                disabled={createServiceMutation.isPending}
                size="sm"
              >
                <PlusIcon className="mr-2 size-4" />
                Importer la sélection
              </Button>
            </div>
          )}

          {/* Liste des suggestions */}
          <div className="space-y-4">
            {recommendations.suggestions.map((suggestion, index) => {
              const isSelected = selectedSuggestions.has(index);
              const isImporting = importingIds.has(index);
              const isImported = isSelected && !isImporting;

              return (
                <Card 
                  key={index} 
                  className={`transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => handleToggleSuggestion(index)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500 text-white' 
                              : 'border-gray-300'
                          }`}>
                            {isImported && <CheckIcon className="size-3" />}
                          </div>
                          {suggestion.service_name}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm font-medium text-gray-600">
                            {suggestion.service_type}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            getPriorityColor(suggestion.priority_level)
                          }`}>
                            Priorité {suggestion.priority_level}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {suggestion.estimated_budget_min.toLocaleString()}€ - {suggestion.estimated_budget_max.toLocaleString()}€
                        </div>
                        <div className="text-sm text-gray-500">
                          Budget estimé
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{suggestion.description}</p>

                    {/* Conseils */}
                    {suggestion.tips.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Conseils :</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {suggestion.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="text-sm text-gray-600">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Types de prestataires suggérés */}
                    {suggestion.providers_suggestions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Prestataires recommandés :</h4>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.providers_suggestions.map((provider, providerIndex) => (
                            <span 
                              key={providerIndex}
                              className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                            >
                              {provider}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions individuelles */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Cliquez sur la carte pour sélectionner
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImportSuggestion(suggestion, index);
                        }}
                        disabled={isImporting || isImported}
                      >
                        {isImporting ? (
                          'Import...'
                        ) : isImported ? (
                          <>
                            <CheckIcon className="mr-2 size-4" />
                            Importé
                          </>
                        ) : (
                          <>
                            <PlusIcon className="mr-2 size-4" />
                            Importer
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Actions du modal */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={handleClose}>
              Fermer
            </Button>
            {selectedSuggestions.size > 0 && (
              <Button 
                onClick={handleImportSelected}
                disabled={createServiceMutation.isPending}
              >
                <PlusIcon className="mr-2 size-4" />
                Importer {selectedSuggestions.size} suggestion(s)
              </Button>
            )}
          </div>

          {createServiceMutation.error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">
                Erreur: {createServiceMutation.error.message}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 