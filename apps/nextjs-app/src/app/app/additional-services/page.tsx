'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { PlusIcon, SparklesIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIButton } from '@/components/ai';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';
import { useAdditionalServices } from '@/features/additionalServices/api/get-additional-services';
import { useUpdateServicesOrder } from '@/features/additionalServices/api/update-additional-service';
import { useGenerateServiceSuggestions } from '@/features/additionalServices/api/ai-service-suggestions';
import { ServiceCard } from '@/features/additionalServices/components/service-card';
import { AddServiceModal } from '@/features/additionalServices/components/add-service-modal';
import { AIRecommendationsModal } from '@/features/additionalServices/components/ai-recommendations-modal';
import { DEFAULT_SERVICE_TYPES } from '@/features/additionalServices/types';
import type { AdditionalService } from '@/features/additionalServices/types';
import { cn } from '@/utils/cn';

export default function AdditionalServicesPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  
  // États locaux
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [services, setServices] = useState<AdditionalService[]>([]);

  // API hooks
  const { data: servicesData, isLoading, error } = useAdditionalServices(user?.id || '');
  const updateOrderMutation = useUpdateServicesOrder();
  const generateSuggestionsMutation = useGenerateServiceSuggestions();

  // Synchroniser les données locales avec les données du serveur
  useEffect(() => {
    if (servicesData) {
      setServices(servicesData);
    }
  }, [servicesData]);

  // Filtrage des services
  const filteredServices = services.filter(service => {
    const matchesSearch = !searchTerm || 
      service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.provider_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || service.service_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Gestion du drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(filteredServices);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Mettre à jour l'ordre local immédiatement pour l'UX
    const updatedServices = items.map((item, index) => ({
      ...item,
      sort_order: index
    }));
    setServices(updatedServices);

    // Mettre à jour en base de données
    if (user?.id) {
      const orderUpdates = updatedServices.map((item, index) => ({
        id: item.id,
        sort_order: index
      }));
      
      updateOrderMutation.mutate({
        services: orderUpdates,
        user_id: user.id
      });
    }
  };

  // Génération de suggestions IA
  const handleGenerateAISuggestions = async () => {
    if (!user?.id) return;

    try {
      await generateSuggestionsMutation.mutateAsync({
        wedding_type: 'romantique', // TODO: récupérer depuis le profil de mariage
        estimated_guests: 80, // TODO: récupérer depuis le profil
        estimated_budget: 15000, // TODO: récupérer depuis le profil
        existing_services: services.map(s => s.service_type),
      });
      setShowAIModal(true);
    } catch (error) {
      console.error('Erreur génération suggestions IA:', error);
    }
  };

  // Statistiques
  const stats = {
    total: services.length,
    confirmed: services.filter(s => s.status === 'confirme').length,
    totalBudget: services.reduce((sum, s) => sum + (s.actual_cost || s.estimated_budget), 0),
    pending: services.filter(s => s.status === 'recherche').length,
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">{t('auth.login')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <PlusIcon className="size-8 text-rose-600" />
            {t('additionalServices.title')}
          </h1>
          <p className="mt-1 text-gray-600">
            {t('additionalServices.description')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AIButton 
            onGenerate={handleGenerateAISuggestions}
            loading={generateSuggestionsMutation.isPending}
          >
            {t('additionalServices.aiSuggestions')}
          </AIButton>
          <Button onClick={() => setShowAddModal(true)}>
            <PlusIcon className="mr-2 size-4" />
            {t('additionalServices.addService')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('additionalServices.totalServices', { count: stats.total })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Confirmés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              En recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Budget total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {stats.totalBudget.toLocaleString()}€
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une prestation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <FunnelIcon className="size-5 text-gray-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="all">{t('common.all')}</option>
            {DEFAULT_SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des services avec drag & drop */}
      {filteredServices.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <PlusIcon className="mx-auto mb-4 size-12 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Aucune prestation supplémentaire
            </h3>
            <p className="mb-4 text-gray-500">
              Ajoutez vos premières prestations personnalisées ou générez des suggestions avec l'IA
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => setShowAddModal(true)}>
                <PlusIcon className="mr-2 size-4" />
                {t('additionalServices.addService')}
              </Button>
              <Button variant="outline" onClick={handleGenerateAISuggestions}>
                <SparklesIcon className="mr-2 size-4" />
                {t('additionalServices.aiSuggestions')}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Hint pour le drag & drop */}
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-700">
              💡 {t('additionalServices.dragDropHint')}
            </p>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="services">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'space-y-4',
                    snapshot.isDraggingOver && 'rounded-lg bg-rose-50 p-4'
                  )}
                >
                  {filteredServices.map((service, index) => (
                    <Draggable key={service.id} draggableId={service.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            'transition-transform',
                            snapshot.isDragging && 'rotate-2 scale-105 shadow-lg'
                          )}
                        >
                          <ServiceCard 
                            service={service} 
                            onEdit={() => {}} 
                            onDelete={() => {}}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}

      {/* Modals */}
      <AddServiceModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        userId={user?.id || ''}
      />

      <AIRecommendationsModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        recommendations={generateSuggestionsMutation.data}
        userId={user?.id || ''}
      />

      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-red-700">Erreur: {error.message}</p>
        </div>
      )}
    </div>
  );
} 