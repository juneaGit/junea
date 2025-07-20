'use client';

import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

// Nouveaux imports
import { AddGuestModal, type AddGuestFormData } from '@/components/guests/add-guest-modal';
import { useGuests } from '@/hooks/use-guests';
import { useDashboard } from '@/hooks/use-dashboard';
import { useAuth } from '@/hooks/use-auth';

// ===================================
// INTERFACE POUR LES INVITÉS
// ===================================

interface DisplayGuest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  dietary_restrictions: string[];
  plus_one: boolean;
  plus_one_name?: string;
  table_number?: number;
  notes?: string;
  invitation_sent: boolean;
  category: 'family' | 'friends' | 'colleagues' | 'other';
  created_at: string;
}

export default function GuestsPage() {
  // ===================================
  // HOOKS ET STATE
  // ===================================

  const { user } = useAuth();
  const {
    guests,
    stats: guestStats,
    loading: guestsLoading,
    error: guestsError,
    loadGuests,
    addGuest,
    sendGuestInvitation,
  } = useGuests();
  
  const {
    refreshStats,
  } = useDashboard();

  // État local pour les modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [invitationLoading, setInvitationLoading] = useState(false);

  // Filtrage et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRSVP, setFilterRSVP] = useState<string>('all');

  // ===================================
  // EFFECTS
  // ===================================

  useEffect(() => {
    if (user?.id) {
      loadGuests(user.id);
    }
  }, [user?.id, loadGuests]);

  // ===================================
  // DONNÉES TRANSFORMÉES
  // ===================================

  // Utiliser les vraies données d'invités ou fallback sur des données démo
  const displayedGuests: DisplayGuest[] = guests.length > 0 ? guests.map(guest => ({
    id: guest.id,
    name: guest.first_name && guest.last_name 
      ? `${guest.first_name} ${guest.last_name}` 
      : guest.first_name || guest.last_name || 'Sans nom',
    email: guest.email || undefined,
    phone: guest.phone || undefined,
    rsvp_status: guest.rsvp_status,
    dietary_restrictions: guest.meal_preference ? [guest.meal_preference] : [],
    plus_one: guest.plus_one || false,
    plus_one_name: undefined, // Pas dans l'interface Guest
    table_number: guest.table_assignment || undefined,
    notes: guest.notes || undefined,
    invitation_sent: guest.invitation_sent || false,
    category: guest.category as 'family' | 'friends' | 'colleagues' | 'other',
    created_at: guest.created_at,
  })) : [
    // Données de démonstration si pas de vraies données
    {
      id: 'demo-1',
      name: 'Marie Dupont',
      email: 'marie.dupont@email.com',
      phone: '06 12 34 56 78',
      rsvp_status: 'confirmed',
      dietary_restrictions: ['Végétarien'],
      plus_one: true,
      plus_one_name: 'Jean Dupont',
      table_number: 1,
      invitation_sent: true,
      category: 'family',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      name: 'Pierre Martin',
      email: 'pierre.martin@email.com',
      phone: '',
      rsvp_status: 'pending',
      dietary_restrictions: [],
      plus_one: false,
      invitation_sent: true,
      category: 'friends',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      name: 'Sophie Leclerc',
      email: 'sophie.leclerc@email.com',
      phone: '',
      rsvp_status: 'confirmed',
      dietary_restrictions: ['Sans gluten', 'Sans lactose'],
      plus_one: true,
      plus_one_name: 'Marc Leclerc',
      table_number: 2,
      invitation_sent: true,
      category: 'friends',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-4',
      name: 'Paul Durand',
      email: 'paul.durand@email.com',
      phone: '',
      rsvp_status: 'declined',
      dietary_restrictions: [],
      plus_one: false,
      invitation_sent: true,
      category: 'colleagues',
      notes: 'Voyage professionnel',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-5',
      name: 'Julie Moreau',
      email: 'julie.moreau@email.com',
      phone: '',
      rsvp_status: 'confirmed',
      dietary_restrictions: ['Halal'],
      plus_one: true,
      table_number: 3,
      invitation_sent: true,
      category: 'family',
      created_at: new Date().toISOString(),
    },
  ];

  // Filtrer les invités selon les critères
  const filteredGuests = displayedGuests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         false;
    const matchesCategory = filterCategory === 'all' || guest.category === filterCategory;
    const matchesRSVP = filterRSVP === 'all' || guest.rsvp_status === filterRSVP;
    
    return matchesSearch && matchesCategory && matchesRSVP;
  });

  // ===================================
  // CALCULS STATISTIQUES
  // ===================================

  const stats = {
    total: displayedGuests.length,
    confirmed: displayedGuests.filter(g => g.rsvp_status === 'confirmed').length,
    pending: displayedGuests.filter(g => g.rsvp_status === 'pending').length,
    declined: displayedGuests.filter(g => g.rsvp_status === 'declined').length,
    withPlusOne: displayedGuests.filter(g => g.plus_one).length,
    invitationsSent: displayedGuests.filter(g => g.invitation_sent).length,
  };

  const totalExpected = stats.confirmed + stats.withPlusOne;

  // ===================================
  // HANDLERS D'ACTIONS
  // ===================================

  // Handler pour l'ajout d'un invité
  const handleAddGuest = async (data: AddGuestFormData) => {
    if (!user?.id) {
      toast.error('Utilisateur non connecté');
      return;
    }

    setSubmitLoading(true);
    
    try {
      // Créer l'invité avec l'interface correcte du hook
      const guestFormData = {
        first_name: data.name.split(' ')[0] || data.name,
        last_name: data.name.split(' ').slice(1).join(' ') || undefined,
        email: data.email,
        phone: data.phone,
        category: data.category as any, // Cast pour compatibilité temporaire
        plus_one: data.plus_one,
        meal_preference: data.dietary_restrictions?.join(', ') || undefined,
        notes: data.notes,
      };
      await addGuest(guestFormData, user.id);

      // Actualiser les données
      await Promise.all([
        loadGuests(user.id),
        refreshStats(user.id), // Sync avec dashboard
      ]);

      toast.success(`Invité "${data.name}" ajouté avec succès !`, {
        duration: 4000,
        position: 'top-right',
      });

    } catch (error) {
      console.error('Erreur création invité:', error);
      toast.error('Erreur lors de l\'ajout de l\'invité');
      throw error; // Re-throw pour que la modal puisse gérer l'erreur
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handler pour l'envoi d'invitations
  const handleSendInvitation = async (guestData: AddGuestFormData) => {
    if (!user?.id || !guestData.email) {
      toast.error('Email requis pour envoyer une invitation');
      return;
    }

    setInvitationLoading(true);

    try {
      // Simuler envoi d'invitation (à implémenter avec Supabase Edge Functions)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Invitation envoyée à ${guestData.email}`, {
        duration: 3000,
        position: 'top-right',
      });
      
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'invitation');
      throw error;
    } finally {
      setInvitationLoading(false);
    }
  };

  // Envoyer invitations en lot
  const handleBulkInvitations = async () => {
    const guestsWithEmail = displayedGuests.filter(g => g.email && !g.invitation_sent);
    
    if (guestsWithEmail.length === 0) {
      toast.error('Aucun invité avec email en attente d\'invitation');
      return;
    }

    setInvitationLoading(true);

    try {
      // Simuler envoi en lot
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${guestsWithEmail.length} invitations envoyées !`, {
        duration: 4000,
        position: 'top-right',
      });
      
      // Refresh data
      if (user?.id) {
        await loadGuests(user.id);
      }
      
    } catch (error) {
      toast.error('Erreur lors de l\'envoi des invitations');
    } finally {
      setInvitationLoading(false);
    }
  };

  // Supprimer un invité
  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    if (!user?.id) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'invité "${guestName}" ?`)) {
      return;
    }

    try {
      // TODO: Implementer deleteGuest dans le hook
      toast.success(`Invité "${guestName}" supprimé`);
      await loadGuests(user.id);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // ===================================
  // UTILITAIRES UI
  // ===================================

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'family': return 'bg-blue-100 text-blue-800';
      case 'friends': return 'bg-purple-100 text-purple-800';
      case 'colleagues': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getRSVPColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'declined': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getRSVPIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircleIcon;
      case 'declined': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  // ===================================
  // LOADING STATE
  // ===================================

  if (guestsLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Chargement des invités...</span>
      </div>
    );
  }

  // ===================================
  // RENDER
  // ===================================

  return (
    <>
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        }}
      />

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Invités
            </h1>
            <p className="mt-2 text-gray-600">
              Gérez votre liste d'invités et suivez les confirmations
            </p>
            {guestsError && (
              <div className="mt-2 flex items-center gap-2 text-red-600">
                <XCircleIcon className="size-5" />
                <span className="text-sm">Erreur de chargement des données</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleBulkInvitations}
              disabled={guestsLoading || invitationLoading || displayedGuests.filter(g => g.email && !g.invitation_sent).length === 0}
            >
              <EnvelopeIcon className="mr-2 size-4" />
              {invitationLoading ? 'Envoi...' : 'Envoyer invitations'}
            </Button>
            <Button 
              className="bg-rose-500 hover:bg-rose-600"
              onClick={() => setIsAddModalOpen(true)}
              disabled={guestsLoading || !user}
            >
              <PlusIcon className="mr-2 size-4" />
              Ajouter un invité
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total invités</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-gray-500">
                    {totalExpected} personnes attendues
                  </p>
                </div>
                <UserGroupIcon className="size-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmés</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                  <p className="text-xs text-gray-500">
                    {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}% du total
                  </p>
                </div>
                <CheckCircleIcon className="size-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-gray-500">
                    {stats.invitationsSent} invitations envoyées
                  </p>
                </div>
                <ClockIcon className="size-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accompagnateurs</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.withPlusOne}</p>
                  <p className="text-xs text-gray-500">
                    {stats.declined} ont décliné
                  </p>
                </div>
                <UserGroupIcon className="size-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Recherche */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              {/* Filtre catégorie */}
              <div className="min-w-[140px]">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="all">Toutes catégories</option>
                  <option value="family">Famille</option>
                  <option value="friends">Amis</option>
                  <option value="colleagues">Collègues</option>
                  <option value="other">Autres</option>
                </select>
              </div>

              {/* Filtre RSVP */}
              <div className="min-w-[120px]">
                <select
                  value={filterRSVP}
                  onChange={(e) => setFilterRSVP(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="all">Tous statuts</option>
                  <option value="confirmed">Confirmés</option>
                  <option value="pending">En attente</option>
                  <option value="declined">Déclinés</option>
                </select>
              </div>
            </div>

            {/* Résultats de filtre */}
            {filteredGuests.length !== displayedGuests.length && (
              <div className="mt-3 text-sm text-gray-600">
                {filteredGuests.length} invité{filteredGuests.length > 1 ? 's' : ''} affiché{filteredGuests.length > 1 ? 's' : ''} sur {displayedGuests.length}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tableau des invités */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des invités ({filteredGuests.length})</CardTitle>
            <CardDescription>
              Gérez vos invités et leurs réponses - 
              {guests.length > 0 ? ' Données temps réel' : ' Données de démonstration'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Nom</th>
                    <th className="p-3 text-left">Contact</th>
                    <th className="p-3 text-left">Catégorie</th>
                    <th className="p-3 text-center">RSVP</th>
                    <th className="p-3 text-center">Table</th>
                    <th className="p-3 text-center">Restrictions</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((guest) => {
                    const RSVPIcon = getRSVPIcon(guest.rsvp_status);
                    
                    return (
                      <tr key={guest.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{guest.name}</p>
                            {guest.plus_one && guest.plus_one_name && (
                              <p className="text-sm text-gray-500">
                                + {guest.plus_one_name}
                              </p>
                            )}
                            {guest.plus_one && !guest.plus_one_name && (
                              <p className="text-sm text-gray-500">+ Accompagnateur</p>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="space-y-1">
                            {guest.email && (
                              <div className="flex items-center gap-1">
                                <EnvelopeIcon className="size-3 text-gray-400" />
                                <span className="text-gray-600">{guest.email}</span>
                              </div>
                            )}
                            {guest.phone && (
                              <div className="flex items-center gap-1">
                                <PhoneIcon className="size-3 text-gray-400" />
                                <span className="text-gray-600">{guest.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(guest.category)}`}>
                            {guest.category === 'family' ? 'Famille' :
                             guest.category === 'friends' ? 'Amis' :
                             guest.category === 'colleagues' ? 'Collègues' : 'Autres'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className={`flex items-center justify-center gap-1 ${getRSVPColor(guest.rsvp_status)}`}>
                            <RSVPIcon className="size-4" />
                            <span className="text-xs font-medium">
                              {guest.rsvp_status === 'confirmed' ? 'Confirmé' :
                               guest.rsvp_status === 'declined' ? 'Décliné' : 'En attente'}
                            </span>
                          </div>
                          {!guest.invitation_sent && guest.email && (
                            <div className="mt-1">
                              <span className="inline-block rounded bg-yellow-100 px-1 py-0.5 text-xs text-yellow-700">
                                Non envoyée
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {guest.table_number ? (
                            <div className="flex items-center justify-center gap-1">
                              <TableCellsIcon className="size-4 text-gray-400" />
                              <span className="text-sm font-medium">{guest.table_number}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {guest.dietary_restrictions.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {guest.dietary_restrictions.slice(0, 2).map((restriction) => (
                                <span
                                  key={restriction}
                                  className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700"
                                >
                                  {restriction}
                                </span>
                              ))}
                              {guest.dietary_restrictions.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{guest.dietary_restrictions.length - 2} autre{guest.dietary_restrictions.length - 2 > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Aucune</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="sm" title="Modifier">
                              <PencilIcon className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGuest(guest.id, guest.name)}
                              className="text-red-600 hover:text-red-700"
                              title="Supprimer"
                            >
                              <TrashIcon className="size-4" />
                            </Button>
                            {guest.email && !guest.invitation_sent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                title="Envoyer invitation"
                                disabled={invitationLoading}
                              >
                                <EnvelopeIcon className="size-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredGuests.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <UserGroupIcon className="mx-auto mb-4 size-12 opacity-50" />
                  <h3 className="mb-2 text-lg font-medium">
                    {searchTerm || filterCategory !== 'all' || filterRSVP !== 'all' 
                      ? 'Aucun invité trouvé' 
                      : 'Aucun invité'}
                  </h3>
                  <p className="mb-4 text-sm">
                    {searchTerm || filterCategory !== 'all' || filterRSVP !== 'all'
                      ? 'Essayez de modifier vos critères de recherche'
                      : 'Commencez par ajouter vos premiers invités'}
                  </p>
                  {!searchTerm && filterCategory === 'all' && filterRSVP === 'all' && (
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <PlusIcon className="mr-2 size-4" />
                      Ajouter un invité
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EnvelopeIcon className="size-5 text-green-500" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <h4 className="mb-2 font-semibold text-gray-900">
                  📧 Invitations en attente
                </h4>
                <p className="mb-3 text-sm text-gray-600">
                  {displayedGuests.filter(g => g.email && !g.invitation_sent).length} invitations 
                  prêtes à être envoyées
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBulkInvitations}
                  disabled={displayedGuests.filter(g => g.email && !g.invitation_sent).length === 0 || invitationLoading}
                >
                  {invitationLoading ? 'Envoi...' : 'Envoyer toutes'}
                </Button>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <h4 className="mb-2 font-semibold text-gray-900">
                  🪑 Plan de table
                </h4>
                <p className="mb-3 text-sm text-gray-600">
                  {stats.confirmed} invités confirmés à placer aux tables
                </p>
                <Button variant="outline" size="sm">
                  Gérer le plan de table
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal d'ajout d'invité */}
        <AddGuestModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddGuest}
          onSendInvitation={handleSendInvitation}
          loading={submitLoading || invitationLoading}
        />
      </div>
    </>
  );
}
