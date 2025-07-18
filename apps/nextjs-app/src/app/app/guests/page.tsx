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
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useWeddingProfile } from '@/hooks/use-wedding-profile';
import { useUser } from '@/lib/auth';

interface Guest {
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
}

const defaultGuests: Guest[] = [
  {
    id: '1',
    name: 'Marie Dupont',
    email: 'marie.dupont@email.com',
    phone: '06 12 34 56 78',
    rsvp_status: 'confirmed',
    dietary_restrictions: ['végétarien'],
    plus_one: true,
    plus_one_name: 'Jean Dupont',
    table_number: 1,
    invitation_sent: true,
    category: 'family',
  },
  {
    id: '2',
    name: 'Pierre Martin',
    email: 'pierre.martin@email.com',
    rsvp_status: 'pending',
    dietary_restrictions: [],
    plus_one: false,
    invitation_sent: true,
    category: 'friends',
  },
  {
    id: '3',
    name: 'Sophie Leclerc',
    email: 'sophie.leclerc@email.com',
    rsvp_status: 'confirmed',
    dietary_restrictions: ['sans gluten', 'sans lactose'],
    plus_one: true,
    plus_one_name: 'Marc Leclerc',
    table_number: 2,
    invitation_sent: true,
    category: 'friends',
  },
  {
    id: '4',
    name: 'Paul Durand',
    email: 'paul.durand@email.com',
    rsvp_status: 'declined',
    dietary_restrictions: [],
    plus_one: false,
    invitation_sent: true,
    category: 'colleagues',
    notes: 'Voyage professionnel',
  },
  {
    id: '5',
    name: 'Julie Moreau',
    email: 'julie.moreau@email.com',
    rsvp_status: 'confirmed',
    dietary_restrictions: ['halal'],
    plus_one: true,
    table_number: 3,
    invitation_sent: true,
    category: 'family',
  },
];

export default function GuestsPage() {
  const user = useUser();
  const { data: weddingProfile } = useWeddingProfile();
  const [guests, setGuests] = useState<Guest[]>(defaultGuests);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'confirmed' | 'pending' | 'declined'
  >('all');
  const [categoryFilter, setCategoryFilter] = useState<
    'all' | 'family' | 'friends' | 'colleagues' | 'other'
  >('all');

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const filteredGuests = guests.filter((guest) => {
    const statusMatch = filter === 'all' || guest.rsvp_status === filter;
    const categoryMatch =
      categoryFilter === 'all' || guest.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const stats = {
    total: guests.length,
    confirmed: guests.filter((g) => g.rsvp_status === 'confirmed').length,
    pending: guests.filter((g) => g.rsvp_status === 'pending').length,
    declined: guests.filter((g) => g.rsvp_status === 'declined').length,
    withPlusOne: guests.filter(
      (g) => g.plus_one && g.rsvp_status === 'confirmed',
    ).length,
    totalAttendees:
      guests.filter((g) => g.rsvp_status === 'confirmed').length +
      guests.filter((g) => g.plus_one && g.rsvp_status === 'confirmed').length,
  };

  const getRSVPIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="size-5 text-green-500" />;
      case 'declined':
        return <XCircleIcon className="size-5 text-red-500" />;
      default:
        return <ClockIcon className="size-5 text-orange-500" />;
    }
  };

  const getRSVPColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'family':
        return 'bg-blue-100 text-blue-800';
      case 'friends':
        return 'bg-purple-100 text-purple-800';
      case 'colleagues':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const updateRSVP = (
    guestId: string,
    status: 'confirmed' | 'declined' | 'pending',
  ) => {
    setGuests(
      guests.map((guest) =>
        guest.id === guestId ? { ...guest, rsvp_status: status } : guest,
      ),
    );
  };

  const deleteGuest = (guestId: string) => {
    setGuests(guests.filter((guest) => guest.id !== guestId));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
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
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <EnvelopeIcon className="mr-2 size-4" />
            Envoyer invitations
          </Button>
          <Button className="bg-rose-500 hover:bg-rose-600">
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
                <p className="text-2xl font-bold text-green-600">
                  {stats.confirmed}
                </p>
                <p className="text-xs text-gray-500">
                  {((stats.confirmed / stats.total) * 100).toFixed(0)}% du total
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
                <p className="text-2xl font-bold text-orange-600">
                  {stats.pending}
                </p>
                <p className="text-xs text-gray-500">Réponses attendues</p>
              </div>
              <ClockIcon className="size-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Présents au total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalAttendees}
                </p>
                <p className="text-xs text-gray-500">
                  +{stats.withPlusOne} accompagnants
                </p>
              </div>
              <UserGroupIcon className="size-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-700">
            Statut RSVP:
          </span>
          {(['all', 'confirmed', 'pending', 'declined'] as const).map(
            (status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status === 'all'
                  ? 'Tous'
                  : status === 'confirmed'
                    ? 'Confirmés'
                    : status === 'pending'
                      ? 'En attente'
                      : 'Déclinés'}
              </Button>
            ),
          )}
        </div>

        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-700">Catégorie:</span>
          {(['all', 'family', 'friends', 'colleagues', 'other'] as const).map(
            (category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(category)}
              >
                {category === 'all'
                  ? 'Toutes'
                  : category === 'family'
                    ? 'Famille'
                    : category === 'friends'
                      ? 'Amis'
                      : category === 'colleagues'
                        ? 'Collègues'
                        : 'Autres'}
              </Button>
            ),
          )}
        </div>
      </div>

      {/* Liste des invités */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des invités ({filteredGuests.length})</CardTitle>
          <CardDescription>
            Gérez vos invités et suivez leurs réponses
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
                  <th className="p-3 text-center">+1</th>
                  <th className="p-3 text-left">Restrictions</th>
                  <th className="p-3 text-center">Table</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{guest.name}</p>
                        {guest.plus_one && guest.plus_one_name && (
                          <p className="text-sm text-gray-500">
                            + {guest.plus_one_name}
                          </p>
                        )}
                        {guest.notes && (
                          <p className="text-xs text-gray-400">{guest.notes}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {guest.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <EnvelopeIcon className="size-3" />
                            {guest.email}
                          </div>
                        )}
                        {guest.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <PhoneIcon className="size-3" />
                            {guest.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${getCategoryColor(guest.category)}`}
                      >
                        {guest.category === 'family'
                          ? 'Famille'
                          : guest.category === 'friends'
                            ? 'Amis'
                            : guest.category === 'colleagues'
                              ? 'Collègues'
                              : 'Autres'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getRSVPIcon(guest.rsvp_status)}
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${getRSVPColor(guest.rsvp_status)}`}
                        >
                          {guest.rsvp_status === 'confirmed'
                            ? 'Confirmé'
                            : guest.rsvp_status === 'declined'
                              ? 'Décliné'
                              : 'En attente'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {guest.plus_one ? (
                        <CheckCircleIcon className="mx-auto size-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="mx-auto size-5 text-gray-300" />
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {guest.dietary_restrictions.map(
                          (restriction, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800"
                            >
                              {restriction}
                            </span>
                          ),
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {guest.table_number ? (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                          Table {guest.table_number}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm">
                          <PencilIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGuest(guest.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="p-6 text-center">
            <EnvelopeIcon className="mx-auto mb-2 size-8 text-blue-500" />
            <h3 className="font-semibold text-gray-900">
              Relances automatiques
            </h3>
            <p className="text-sm text-gray-600">
              Envoyer des rappels aux invités
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="p-6 text-center">
            <UserGroupIcon className="mx-auto mb-2 size-8 text-green-500" />
            <h3 className="font-semibold text-gray-900">Plan de table</h3>
            <p className="text-sm text-gray-600">Organiser les tables</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="p-6 text-center">
            <CheckCircleIcon className="mx-auto mb-2 size-8 text-purple-500" />
            <h3 className="font-semibold text-gray-900">Export liste</h3>
            <p className="text-sm text-gray-600">Exporter en CSV/PDF</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
