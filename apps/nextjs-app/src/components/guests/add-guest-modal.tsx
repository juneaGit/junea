'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  XMarkIcon,
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  HeartIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

// ===================================
// SCHÉMA DE VALIDATION ZOD
// ===================================

const guestFormSchema = z.object({
  name: z.string().min(2, 'Le nom est requis (min. 2 caractères)'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  category: z.enum(['family', 'friends', 'colleagues', 'other'], {
    errorMap: () => ({ message: 'Sélectionnez une catégorie' })
  }),
  rsvp_status: z.enum(['pending', 'confirmed', 'declined']).default('pending'),
  plus_one: z.boolean().default(false),
  plus_one_name: z.string().optional(),
  dietary_restrictions: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export type AddGuestFormData = z.infer<typeof guestFormSchema>;

// ===================================
// CATÉGORIES D'INVITÉS
// ===================================

const GUEST_CATEGORIES = [
  { value: 'family', label: 'Famille', icon: '👨‍👩‍👧‍👦', color: 'bg-blue-100 text-blue-800' },
  { value: 'friends', label: 'Amis', icon: '👥', color: 'bg-purple-100 text-purple-800' },
  { value: 'colleagues', label: 'Collègues', icon: '🏢', color: 'bg-gray-100 text-gray-800' },
  { value: 'other', label: 'Autres', icon: '👤', color: 'bg-yellow-100 text-yellow-800' },
] as const;

// ===================================
// STATUTS RSVP
// ===================================

const RSVP_STATUSES = [
  { value: 'pending', label: 'En attente', icon: '⏳', color: 'text-yellow-600' },
  { value: 'confirmed', label: 'Confirmé', icon: '✅', color: 'text-green-600' },
  { value: 'declined', label: 'Décliné', icon: '❌', color: 'text-red-600' },
] as const;

// ===================================
// RESTRICTIONS ALIMENTAIRES COURANTES
// ===================================

const DIETARY_RESTRICTIONS = [
  'Végétarien',
  'Végétalien', 
  'Sans gluten',
  'Sans lactose',
  'Halal',
  'Casher',
  'Sans porc',
  'Sans fruits de mer',
  'Allergies aux noix',
  'Diabétique'
];

// ===================================
// PROPS DU COMPOSANT MODAL
// ===================================

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddGuestFormData) => Promise<void>;
  onSendInvitation?: (guestData: AddGuestFormData) => Promise<void>;
  loading?: boolean;
}

// ===================================
// COMPOSANT MODAL
// ===================================

export const AddGuestModal: React.FC<AddGuestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSendInvitation,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddGuestFormData>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      category: 'friends',
      rsvp_status: 'pending',
      plus_one: false,
      plus_one_name: '',
      dietary_restrictions: [],
      notes: '',
    },
  });

  // Surveiller les valeurs pour UI dynamique
  const selectedCategory = watch('category');
  const rsvpStatus = watch('rsvp_status');
  const hasPlusOne = watch('plus_one');
  const dietaryRestrictions = watch('dietary_restrictions');

  // Fonction de soumission
  const onFormSubmit = async (data: AddGuestFormData) => {
    try {
      await onSubmit(data);
      toast.success(`Invité "${data.name}" ajouté avec succès !`, {
        duration: 3000,
        position: 'top-right',
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'invité:', error);
      toast.error('Erreur lors de l\'ajout de l\'invité. Veuillez réessayer.', {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  // Fonction d'ajout + envoi d'invitation
  const onSubmitAndSendInvitation = async (data: AddGuestFormData) => {
    try {
      await onSubmit(data);
      
      if (onSendInvitation && data.email) {
        await onSendInvitation(data);
        toast.success(`Invité "${data.name}" ajouté et invitation envoyée !`, {
          duration: 4000,
          position: 'top-right',
        });
      } else {
        toast.success(`Invité "${data.name}" ajouté avec succès !`, {
          duration: 3000,
          position: 'top-right',
        });
      }
      
      reset();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout/envoi:', error);
      toast.error('Erreur lors de l\'ajout de l\'invité ou de l\'envoi de l\'invitation.', {
        duration: 4000,
        position: 'top-right',
      });
    }
  };

  // Fonction de fermeture avec reset
  const handleClose = () => {
    reset();
    onClose();
  };

  // Gestion des restrictions alimentaires
  const toggleDietaryRestriction = (restriction: string) => {
    const current = dietaryRestrictions || [];
    if (current.includes(restriction)) {
      setValue('dietary_restrictions', current.filter(r => r !== restriction));
    } else {
      setValue('dietary_restrictions', [...current, restriction]);
    }
  };

  // Trouver les données de la catégorie sélectionnée
  const selectedCategoryData = GUEST_CATEGORIES.find(
    (cat) => cat.value === selectedCategory
  );

  const selectedRsvpData = RSVP_STATUSES.find(
    (status) => status.value === rsvpStatus
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                {/* Header Modal */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                      <UserGroupIcon className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-semibold text-gray-900">
                        Ajouter un invité
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">
                        Ajoutez un nouvel invité à votre liste de mariage
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="rounded-md p-2 hover:bg-gray-100 transition-colors"
                    onClick={handleClose}
                    disabled={isSubmitting || loading}
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit(onFormSubmit)} className="mt-6 space-y-6">
                  
                  {/* Nom et Email - Ligne 1 */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    
                    {/* Nom */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        {...register('name')}
                        placeholder="Ex: Marie Dupont, Pierre Martin..."
                        className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          {...register('email')}
                          placeholder="nom@exemple.com"
                          className={`w-full rounded-lg border px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        <EnvelopeIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Téléphone et Catégorie - Ligne 2 */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    
                    {/* Téléphone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          {...register('phone')}
                          placeholder="06 12 34 56 78"
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                        <PhoneIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Catégorie */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie *
                      </label>
                      <div className="relative">
                        <select
                          {...register('category')}
                          className={`w-full rounded-lg border px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                            errors.category ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          {GUEST_CATEGORIES.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.icon} {category.label}
                            </option>
                          ))}
                        </select>
                        
                        {/* Indicateur catégorie sélectionnée */}
                        {selectedCategoryData && (
                          <div className="absolute right-10 top-3 text-lg">
                            {selectedCategoryData.icon}
                          </div>
                        )}
                      </div>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Statut RSVP et Plus One - Ligne 3 */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    
                    {/* Statut RSVP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statut RSVP
                      </label>
                      <select
                        {...register('rsvp_status')}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      >
                        {RSVP_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.icon} {status.label}
                          </option>
                        ))}
                      </select>
                      {selectedRsvpData && (
                        <p className={`mt-1 text-xs font-medium ${selectedRsvpData.color}`}>
                          {selectedRsvpData.icon} {selectedRsvpData.label}
                        </p>
                      )}
                    </div>

                    {/* Plus One */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Accompagnateur
                      </label>
                      <div className="flex items-center gap-3 mt-3">
                        <input
                          type="checkbox"
                          {...register('plus_one')}
                          className="w-5 h-5 text-rose-600 border-2 border-gray-300 rounded focus:ring-rose-500 focus:ring-2"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          {hasPlusOne ? '👫 Avec accompagnateur' : '👤 Sans accompagnateur'}
                        </label>
                      </div>
                      
                      {hasPlusOne && (
                        <div className="mt-3">
                          <input
                            type="text"
                            {...register('plus_one_name')}
                            placeholder="Nom de l'accompagnateur"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Restrictions alimentaires */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Restrictions alimentaires
                    </label>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                      {DIETARY_RESTRICTIONS.map((restriction) => (
                        <label
                          key={restriction}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                            dietaryRestrictions?.includes(restriction)
                              ? 'bg-rose-50 border-rose-300 text-rose-700'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={dietaryRestrictions?.includes(restriction) || false}
                            onChange={() => toggleDietaryRestriction(restriction)}
                            className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                          />
                          <span className="text-sm font-medium">{restriction}</span>
                        </label>
                      ))}
                    </div>
                    {dietaryRestrictions && dietaryRestrictions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {dietaryRestrictions.map((restriction) => (
                          <span
                            key={restriction}
                            className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium"
                          >
                            {restriction}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes privées
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      placeholder="Informations supplémentaires, contraintes, préférences..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmitting || loading}
                      className="px-6"
                    >
                      Annuler
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="bg-rose-500 hover:bg-rose-600 px-6"
                    >
                      {isSubmitting || loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Ajout en cours...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="w-4 h-4" />
                          Ajouter l'invité
                        </div>
                      )}
                    </Button>

                    {/* Bouton Ajouter + Envoyer Invitation */}
                    {watch('email') && onSendInvitation && (
                      <Button
                        type="button"
                        onClick={handleSubmit(onSubmitAndSendInvitation)}
                        disabled={isSubmitting || loading}
                        className="bg-green-500 hover:bg-green-600 px-6"
                      >
                        {isSubmitting || loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Envoi...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <EnvelopeIcon className="w-4 h-4" />
                            Ajouter + Envoyer invitation
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 