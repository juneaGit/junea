'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  XMarkIcon,
  CurrencyEuroIcon,
  BuildingOffice2Icon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

// ===================================
// SCHÉMA DE VALIDATION ZOD
// ===================================

const expenseFormSchema = z.object({
  category: z.string().min(1, 'La catégorie est requise'),
  name: z.string().min(2, 'Le nom de l\'article est requis (min. 2 caractères)'),
  vendor_name: z.string().optional(),
  amount: z.number().min(0.01, 'Le montant doit être supérieur à 0'),
  actual_cost: z.number().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  paid: z.boolean().default(false),
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;

// ===================================
// CATÉGORIES DE DÉPENSES
// ===================================

const EXPENSE_CATEGORIES = [
  { value: 'Lieu', label: 'Lieu de réception', icon: '🏰' },
  { value: 'Traiteur', label: 'Traiteur & Restauration', icon: '🍽️' },
  { value: 'Photographe', label: 'Photographe & Vidéo', icon: '📷' },
  { value: 'Fleurs', label: 'Fleurs & Décoration', icon: '🌸' },
  { value: 'Musique', label: 'Musique & Animation', icon: '🎵' },
  { value: 'Robe', label: 'Robe de mariée', icon: '👰' },
  { value: 'Costume', label: 'Costume du marié', icon: '🤵' },
  { value: 'Transport', label: 'Transport', icon: '🚗' },
  { value: 'Bijoux', label: 'Bijoux & Alliance', icon: '💍' },
  { value: 'Coiffure', label: 'Coiffure & Maquillage', icon: '💄' },
  { value: 'Invitations', label: 'Invitations & Papeterie', icon: '💌' },
  { value: 'Cadeaux', label: 'Cadeaux invités', icon: '🎁' },
  { value: 'Lune de miel', label: 'Voyage de noces', icon: '✈️' },
  { value: 'Autres', label: 'Autres dépenses', icon: '📋' },
];

// ===================================
// PROPS DU COMPOSANT MODAL
// ===================================

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  loading?: boolean;
}

// ===================================
// COMPOSANT MODAL
// ===================================

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: '',
      name: '',
      vendor_name: '',
      amount: 0,
      actual_cost: 0,
      description: '',
      notes: '',
      paid: false,
    },
  });

  // Surveiller les valeurs pour UI dynamique
  const selectedCategory = watch('category');
  const isPaid = watch('paid');

  // Fonction de soumission
  const onFormSubmit = async (data: ExpenseFormData) => {
    try {
      await onSubmit(data);
      toast.success('Dépense ajoutée avec succès !', {
        duration: 3000,
        position: 'top-right',
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la dépense:', error);
      toast.error('Erreur lors de l\'ajout de la dépense. Veuillez réessayer.', {
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

  // Trouver l'icône de la catégorie sélectionnée
  const selectedCategoryData = EXPENSE_CATEGORIES.find(
    (cat) => cat.value === selectedCategory
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                
                {/* Header Modal */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                      <CurrencyEuroIcon className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl font-semibold text-gray-900">
                        Ajouter une dépense
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">
                        Ajoutez une nouvelle dépense à votre budget mariage
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
                  
                  {/* Catégorie et Nom - Ligne 1 */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    
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
                          <option value="">Sélectionner une catégorie</option>
                          {EXPENSE_CATEGORIES.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.icon} {category.label}
                            </option>
                          ))}
                        </select>
                        
                        {/* Icône catégorie sélectionnée */}
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

                    {/* Nom de l'article */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'article *
                      </label>
                      <input
                        type="text"
                        {...register('name')}
                        placeholder="Ex: Château de Versailles, Menu 3 services..."
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
                  </div>

                  {/* Prestataire et Montants - Ligne 2 */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    
                    {/* Prestataire */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prestataire
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          {...register('vendor_name')}
                          placeholder="Nom du prestataire"
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                        <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Montant estimé */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant estimé *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('amount', { valueAsNumber: true })}
                          placeholder="0.00"
                          className={`w-full rounded-lg border px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent ${
                            errors.amount ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        <CurrencyEuroIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                      {errors.amount && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.amount.message}
                        </p>
                      )}
                    </div>

                    {/* Montant réel */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Montant réel
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('actual_cost', { valueAsNumber: true })}
                          placeholder="0.00"
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        />
                        <CurrencyEuroIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Laissez vide si pas encore défini
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      placeholder="Détails supplémentaires sur cette dépense..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Notes et État payé */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    
                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes privées
                      </label>
                      <textarea
                        {...register('notes')}
                        rows={2}
                        placeholder="Notes personnelles, négociations..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* État payé */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        État du paiement
                      </label>
                      <div className="flex items-center gap-3 mt-3">
                        <input
                          type="checkbox"
                          {...register('paid')}
                          className="w-5 h-5 text-rose-600 border-2 border-gray-300 rounded focus:ring-rose-500 focus:ring-2"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          {isPaid ? '✅ Dépense payée' : '⏳ En attente de paiement'}
                        </label>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Cochez si la dépense a déjà été réglée
                      </p>
                    </div>
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
                          <CurrencyEuroIcon className="w-4 h-4" />
                          Ajouter la dépense
                        </div>
                      )}
                    </Button>
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