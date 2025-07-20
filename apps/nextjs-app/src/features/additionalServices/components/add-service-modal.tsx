'use client';

import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateAdditionalService } from '../api/create-additional-service';
import { DEFAULT_SERVICE_TYPES, SERVICE_STATUS_LABELS, PRIORITY_LEVELS } from '../types';
import type { CreateAdditionalServiceData, ContactInfo } from '../types';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const AddServiceModal = ({ isOpen, onClose, userId }: AddServiceModalProps) => {
  const { t, i18n } = useTranslation();
  const createServiceMutation = useCreateAdditionalService();
  const currentLanguage = i18n.language as 'fr' | 'en' | 'es';

  // État du formulaire
  const [formData, setFormData] = useState<CreateAdditionalServiceData & { contact_info: ContactInfo }>({
    service_name: '',
    service_type: '',
    provider_name: '',
    estimated_budget: 0,
    status: 'recherche',
    priority: 3,
    notes: '',
    contact_info: {
      name: '',
      email: '',
      phone: '',
      website: '',
      address: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showContactSection, setShowContactSection] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.service_name.trim()) {
      newErrors.service_name = 'Le nom de la prestation est requis';
    }

    if (!formData.service_type.trim()) {
      newErrors.service_type = 'Le type de prestation est requis';
    }

    if (formData.estimated_budget < 0) {
      newErrors.estimated_budget = 'Le budget doit être positif';
    }

    if (formData.contact_info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_info.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.contact_info.website && !/^https?:\/\/.+/.test(formData.contact_info.website)) {
      newErrors.website = 'URL invalide (doit commencer par http:// ou https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Nettoyer les données de contact (ne pas envoyer les champs vides)
      const cleanContactInfo: ContactInfo = {};
      Object.entries(formData.contact_info).forEach(([key, value]) => {
        if (value && value.trim()) {
          (cleanContactInfo as any)[key] = value.trim();
        }
      });

      const serviceData: CreateAdditionalServiceData = {
        service_name: formData.service_name.trim(),
        service_type: formData.service_type.trim(),
        provider_name: formData.provider_name?.trim() || undefined,
        estimated_budget: formData.estimated_budget,
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes?.trim() || undefined,
        contact_info: Object.keys(cleanContactInfo).length > 0 ? cleanContactInfo : undefined,
      };

      await createServiceMutation.mutateAsync({
        ...serviceData,
        user_id: userId,
      });

      // Réinitialiser le formulaire et fermer le modal
      handleClose();
    } catch (error) {
      console.error('Erreur création service:', error);
      // L'erreur sera affichée par le composant d'erreur
    }
  };

  const handleClose = () => {
    setFormData({
      service_name: '',
      service_type: '',
      provider_name: '',
      estimated_budget: 0,
      status: 'recherche',
      priority: 3,
      notes: '',
      contact_info: {
        name: '',
        email: '',
        phone: '',
        website: '',
        address: '',
      },
    });
    setErrors({});
    setShowContactSection(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusIcon className="size-5 text-rose-600" />
            {t('additionalServices.addService')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations principales */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('additionalServices.serviceName')} *
              </label>
              <input
                type="text"
                value={formData.service_name}
                onChange={(e) => handleInputChange('service_name', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="ex: Fleuriste pour décoration"
              />
              {errors.service_name && (
                <p className="mt-1 text-sm text-red-600">{errors.service_name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('additionalServices.serviceType')} *
                </label>
                <select
                  value={formData.service_type}
                  onChange={(e) => handleInputChange('service_type', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">Sélectionner un type</option>
                  {DEFAULT_SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.service_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.service_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('additionalServices.provider')}
                </label>
                <input
                  type="text"
                  value={formData.provider_name || ''}
                  onChange={(e) => handleInputChange('provider_name', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  placeholder="Nom du prestataire"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('additionalServices.estimatedBudget')} (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.estimated_budget}
                  onChange={(e) => handleInputChange('estimated_budget', Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                {errors.estimated_budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimated_budget}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('additionalServices.status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {Object.entries(SERVICE_STATUS_LABELS).map(([key, labels]) => (
                    <option key={key} value={key}>
                      {labels[currentLanguage]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {Object.entries(PRIORITY_LEVELS).map(([level, labels]) => (
                    <option key={level} value={level}>
                      {labels[currentLanguage]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('additionalServices.notes')}
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                placeholder="Notes, conseils, remarques..."
              />
            </div>
          </div>

          {/* Section Contact (optionnelle) */}
          <div>
            <button
              type="button"
              onClick={() => setShowContactSection(!showContactSection)}
              className="flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-800"
            >
              {showContactSection ? 'Masquer' : 'Ajouter'} les informations de contact
            </button>

            {showContactSection && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du contact
                    </label>
                    <input
                      type="text"
                      value={formData.contact_info.name || ''}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_info.phone || ''}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact_info.email || ''}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site web
                    </label>
                    <input
                      type="url"
                      value={formData.contact_info.website || ''}
                      onChange={(e) => handleContactChange('website', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      placeholder="https://"
                    />
                    {errors.website && (
                      <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <textarea
                    value={formData.contact_info.address || ''}
                    onChange={(e) => handleContactChange('address', e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit"
              disabled={createServiceMutation.isPending}
            >
              {createServiceMutation.isPending ? 'Ajout en cours...' : t('common.add')}
            </Button>
          </div>

          {createServiceMutation.error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">
                Erreur: {createServiceMutation.error.message}
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}; 