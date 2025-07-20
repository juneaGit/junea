'use client';

import { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SERVICE_STATUS_LABELS, PRIORITY_LEVELS } from '../types';
import type { AdditionalService } from '../types';
import { cn } from '@/utils/cn';

interface ServiceCardProps {
  service: AdditionalService;
  onEdit: (service: AdditionalService) => void;
  onDelete: (serviceId: string) => void;
  isDragging?: boolean;
}

export const ServiceCard = ({ service, onEdit, onDelete, isDragging = false }: ServiceCardProps) => {
  const { t, i18n } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  
  const currentLanguage = i18n.language as 'fr' | 'en' | 'es';

  // Couleurs selon le statut
  const statusColors = {
    recherche: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    contact: 'bg-blue-100 text-blue-800 border-blue-200',
    reserve: 'bg-purple-100 text-purple-800 border-purple-200',
    confirme: 'bg-green-100 text-green-800 border-green-200',
    annule: 'bg-red-100 text-red-800 border-red-200',
  };

  // Couleurs selon la priorité
  const priorityColors = {
    1: 'bg-gray-100 text-gray-600',
    2: 'bg-blue-100 text-blue-600',
    3: 'bg-yellow-100 text-yellow-600',
    4: 'bg-orange-100 text-orange-600',
    5: 'bg-red-100 text-red-600',
  };

  const statusLabel = SERVICE_STATUS_LABELS[service.status][currentLanguage] || service.status;
  const priorityLabel = PRIORITY_LEVELS[service.priority as keyof typeof PRIORITY_LEVELS]?.[currentLanguage] || 'Normal';

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md',
      isDragging && 'shadow-lg bg-white border-rose-300',
      service.ai_generated && 'border-l-4 border-l-blue-400'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Drag Handle */}
          <div className="mr-3 mt-1 cursor-grab active:cursor-grabbing">
            <Bars3Icon className="size-5 text-gray-400" />
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {service.service_name}
                  </h3>
                  {service.ai_generated && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      IA
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    {service.service_type}
                  </span>
                  {service.provider_name && (
                    <span className="text-sm text-gray-500">
                      • {service.provider_name}
                    </span>
                  )}
                </div>

                {/* Badges de statut et priorité */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border',
                    statusColors[service.status]
                  )}>
                    {statusLabel}
                  </span>
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full',
                    priorityColors[service.priority as keyof typeof priorityColors] || priorityColors[3]
                  )}>
                    {priorityLabel}
                  </span>
                </div>

                {/* Budget */}
                <div className="flex items-center gap-4 mb-3 text-sm">
                  <span className="text-gray-600">
                    Budget estimé: <span className="font-semibold text-gray-900">{service.estimated_budget.toLocaleString()}€</span>
                  </span>
                  {service.actual_cost && (
                    <span className="text-gray-600">
                      Coût réel: <span className="font-semibold text-gray-900">{service.actual_cost.toLocaleString()}€</span>
                    </span>
                  )}
                </div>

                {/* Notes (aperçu) */}
                {service.notes && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {service.notes}
                  </p>
                )}

                {/* Informations de contact */}
                {service.contact_info && (
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {service.contact_info.phone && (
                      <div className="flex items-center gap-1">
                        <PhoneIcon className="size-4" />
                        <span>{service.contact_info.phone}</span>
                      </div>
                    )}
                    {service.contact_info.email && (
                      <div className="flex items-center gap-1">
                        <EnvelopeIcon className="size-4" />
                        <span>{service.contact_info.email}</span>
                      </div>
                    )}
                    {service.contact_info.website && (
                      <div className="flex items-center gap-1">
                        <GlobeAltIcon className="size-4" />
                        <span>Site web</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(service)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(service.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="size-4" />
                </Button>
              </div>
            </div>

            {/* Détails étendus */}
            {showDetails && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                {service.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                    <p className="text-sm text-gray-600">{service.notes}</p>
                  </div>
                )}
                
                {service.ai_generated && service.ai_prompt && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Prompt IA</h4>
                    <p className="text-sm text-gray-500 italic">{service.ai_prompt}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Créé le {new Date(service.created_at).toLocaleDateString('fr-FR')}</span>
                  <span>Modifié le {new Date(service.updated_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            )}

            {/* Bouton pour afficher/masquer les détails */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-3 text-xs text-rose-600 hover:text-rose-800 font-medium"
            >
              {showDetails ? 'Voir moins' : 'Voir plus'}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 