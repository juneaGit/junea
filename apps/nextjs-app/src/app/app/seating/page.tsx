'use client';

import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  HeartIcon,
  SparklesIcon,
  EyeIcon,
  PrinterIcon,
  ShareIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { AIButton } from '@/components/ai/ai-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAI } from '@/hooks/use-ai';
import { useWeddingProfile } from '@/hooks/use-wedding-profile';
import { useUser } from '@/lib/auth';
import { cn } from '@/utils/cn';

// Types
interface Guest {
  id: string;
  name: string;
  email?: string;
  dietaryRestrictions?: string[];
  relationship: 'famille' | 'amis' | 'collegues' | 'autres';
  side: 'bride' | 'groom';
  isChild: boolean;
  plusOne?: boolean;
  tableId?: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  shape: 'round' | 'rectangular';
  position: { x: number; y: number };
  guests: Guest[];
  theme?: string;
}

// Données de démonstration
const DEMO_GUESTS: Guest[] = [
  {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie@example.com',
    relationship: 'famille',
    side: 'bride',
    isChild: false,
    dietaryRestrictions: ['végétarien'],
  },
  {
    id: '2',
    name: 'Pierre Martin',
    email: 'pierre@example.com',
    relationship: 'amis',
    side: 'groom',
    isChild: false,
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    relationship: 'famille',
    side: 'bride',
    isChild: false,
    dietaryRestrictions: ['sans gluten'],
  },
  {
    id: '4',
    name: 'Lucas Petit',
    relationship: 'amis',
    side: 'groom',
    isChild: false,
  },
  // Ajout de plus d'invités pour la démonstration
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `guest-${i + 5}`,
    name: `Invité ${i + 5}`,
    relationship: ['famille', 'amis', 'collegues'][i % 3] as any,
    side: i % 2 === 0 ? ('bride' as const) : ('groom' as const),
    isChild: i % 8 === 0,
  })),
];

const DEMO_TABLES: Table[] = [
  {
    id: 'table-1',
    name: 'Table des mariés',
    capacity: 10,
    shape: 'round',
    position: { x: 400, y: 300 },
    guests: [],
    theme: 'principale',
  },
  {
    id: 'table-2',
    name: 'Table famille mariée',
    capacity: 8,
    shape: 'round',
    position: { x: 200, y: 200 },
    guests: [],
  },
  {
    id: 'table-3',
    name: 'Table famille marié',
    capacity: 8,
    shape: 'round',
    position: { x: 600, y: 200 },
    guests: [],
  },
  {
    id: 'table-4',
    name: 'Table amis',
    capacity: 8,
    shape: 'rectangular',
    position: { x: 300, y: 500 },
    guests: [],
  },
];

export default function SeatingPlanPage() {
  const user = useUser();
  const { data: profile } = useWeddingProfile();
  const { generateRecommendations, loading: aiLoading } = useAI();

  const [tables, setTables] = useState<Table[]>(DEMO_TABLES);
  const [unassignedGuests, setUnassignedGuests] =
    useState<Guest[]>(DEMO_GUESTS);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'2d' | 'list'>('2d');
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<{
    relationship: string;
    side: string;
    dietary: boolean;
  }>({
    relationship: 'all',
    side: 'all',
    dietary: false,
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (
      source.droppableId === 'unassigned' &&
      destination.droppableId.startsWith('table-')
    ) {
      // Déplacer un invité de la liste non assignée vers une table
      const guest = unassignedGuests.find((g) => g.id === draggableId);
      if (!guest) return;

      const targetTable = tables.find((t) => t.id === destination.droppableId);
      if (!targetTable || targetTable.guests.length >= targetTable.capacity)
        return;

      setUnassignedGuests((prev) => prev.filter((g) => g.id !== draggableId));
      setTables((prev) =>
        prev.map((t) =>
          t.id === destination.droppableId
            ? { ...t, guests: [...t.guests, { ...guest, tableId: t.id }] }
            : t,
        ),
      );
    } else if (
      source.droppableId.startsWith('table-') &&
      destination.droppableId === 'unassigned'
    ) {
      // Déplacer un invité d'une table vers la liste non assignée
      const sourceTable = tables.find((t) => t.id === source.droppableId);
      if (!sourceTable) return;

      const guest = sourceTable.guests[source.index];
      if (!guest) return;

      setTables((prev) =>
        prev.map((t) =>
          t.id === source.droppableId
            ? { ...t, guests: t.guests.filter((g) => g.id !== draggableId) }
            : t,
        ),
      );
      setUnassignedGuests((prev) => [
        ...prev,
        { ...guest, tableId: undefined },
      ]);
    } else if (
      source.droppableId.startsWith('table-') &&
      destination.droppableId.startsWith('table-')
    ) {
      // Déplacer un invité d'une table à une autre
      if (source.droppableId === destination.droppableId) return;

      const sourceTable = tables.find((t) => t.id === source.droppableId);
      const targetTable = tables.find((t) => t.id === destination.droppableId);

      if (
        !sourceTable ||
        !targetTable ||
        targetTable.guests.length >= targetTable.capacity
      )
        return;

      const guest = sourceTable.guests[source.index];
      if (!guest) return;

      setTables((prev) =>
        prev.map((t) => {
          if (t.id === source.droppableId) {
            return {
              ...t,
              guests: t.guests.filter((g) => g.id !== draggableId),
            };
          }
          if (t.id === destination.droppableId) {
            return { ...t, guests: [...t.guests, { ...guest, tableId: t.id }] };
          }
          return t;
        }),
      );
    }
  };

  const generateAIRecommendations = async () => {
    try {
      const recommendations = await generateRecommendations(
        user,
        profile,
        'venue',
      );
      // Traiter les recommandations d'IA pour l'agencement des tables
      console.log('Recommandations IA pour le plan de table:', recommendations);
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
    }
  };

  const filteredGuests = unassignedGuests.filter((guest) => {
    const matchesSearch = guest.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRelationship =
      filter.relationship === 'all' ||
      guest.relationship === filter.relationship;
    const matchesSide = filter.side === 'all' || guest.side === filter.side;
    const matchesDietary =
      !filter.dietary ||
      (guest.dietaryRestrictions && guest.dietaryRestrictions.length > 0);

    return (
      matchesSearch && matchesRelationship && matchesSide && matchesDietary
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <TableCellsIcon className="size-8 text-pink-600" />
            Plan de Table
          </h1>
          <p className="mt-1 text-gray-600">
            Organisez vos invités pour créer l'ambiance parfaite
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === '2d' ? 'list' : '2d')}
          >
            <EyeIcon className="mr-2 size-4" />
            {viewMode === '2d' ? 'Vue Liste' : 'Vue 2D'}
          </Button>
          <AIButton onGenerate={generateAIRecommendations} loading={aiLoading}>
            Optimiser avec l'IA
          </AIButton>
          <Button variant="outline" size="sm">
            <ShareIcon className="mr-2 size-4" />
            Partager
          </Button>
          <Button variant="outline" size="sm">
            <PrinterIcon className="mr-2 size-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Panneau des invités non assignés */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserGroupIcon className="size-5" />
                    Invités ({unassignedGuests.length})
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <AdjustmentsHorizontalIcon className="size-4" />
                  </Button>
                </div>

                {/* Barre de recherche */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un invité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                {/* Filtres */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 border-t pt-3"
                    >
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Relation
                        </label>
                        <select
                          value={filter.relationship}
                          onChange={(e) =>
                            setFilter((prev) => ({
                              ...prev,
                              relationship: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="all">Toutes</option>
                          <option value="famille">Famille</option>
                          <option value="amis">Amis</option>
                          <option value="collegues">Collègues</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Côté
                        </label>
                        <select
                          value={filter.side}
                          onChange={(e) =>
                            setFilter((prev) => ({
                              ...prev,
                              side: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="all">Tous</option>
                          <option value="bride">Mariée</option>
                          <option value="groom">Marié</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardHeader>

              <CardContent>
                <Droppable droppableId="unassigned">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'min-h-[400px] space-y-2 p-2 rounded-lg transition-colors',
                        snapshot.isDraggingOver
                          ? 'bg-pink-50 border-2 border-pink-200'
                          : 'bg-gray-50',
                      )}
                    >
                      {filteredGuests.map((guest, index) => (
                        <Draggable
                          key={guest.id}
                          draggableId={guest.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className={cn(
                                  'p-3 bg-white border rounded-lg shadow-sm cursor-move transition-all',
                                  snapshot.isDragging
                                    ? 'shadow-lg rotate-3 bg-pink-50'
                                    : 'hover:shadow-md',
                                  guest.side === 'bride'
                                    ? 'border-l-4 border-l-pink-400'
                                    : 'border-l-4 border-l-blue-400',
                                )}
                              >
                                <div className="font-medium text-gray-900">
                                  {guest.name}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span
                                    className={cn(
                                      'px-2 py-1 rounded-full text-xs',
                                      guest.relationship === 'famille'
                                        ? 'bg-purple-100 text-purple-700'
                                        : guest.relationship === 'amis'
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-orange-100 text-orange-700',
                                    )}
                                  >
                                    {guest.relationship}
                                  </span>
                                  {guest.isChild && (
                                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                                      Enfant
                                    </span>
                                  )}
                                </div>
                                {guest.dietaryRestrictions &&
                                  guest.dietaryRestrictions.length > 0 && (
                                    <div className="mt-1 text-xs text-amber-600">
                                      🥗 {guest.dietaryRestrictions.join(', ')}
                                    </div>
                                  )}
                              </motion.div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {filteredGuests.length === 0 && (
                        <div className="py-8 text-center text-gray-500">
                          <UserGroupIcon className="mx-auto mb-2 size-8 opacity-50" />
                          <p>Aucun invité non assigné</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>

          {/* Zone principale - Vue 2D du plan de table */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <SparklesIcon className="size-5 text-pink-600" />
                    Disposition des Tables
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {tables.reduce(
                        (acc, table) => acc + table.guests.length,
                        0,
                      )}
                      /{tables.reduce((acc, table) => acc + table.capacity, 0)}{' '}
                      places assignées
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === '2d' ? (
                  <div className="relative min-h-[600px] overflow-hidden rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 p-8">
                    {/* Décoration de fond */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute left-10 top-10 size-20 rounded-full bg-pink-200"></div>
                      <div className="absolute bottom-10 right-10 size-16 rounded-full bg-rose-200"></div>
                      <div className="absolute left-1/4 top-1/2 size-12 rounded-full bg-yellow-200"></div>
                    </div>

                    {/* Scène - zone de drop pour les tables */}
                    <div className="relative size-full">
                      {tables.map((table) => (
                        <Droppable key={table.id} droppableId={table.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={{
                                position: 'absolute',
                                left: table.position.x,
                                top: table.position.y,
                                transform: 'translate(-50%, -50%)',
                              }}
                              className={cn(
                                'transition-all duration-200 cursor-pointer',
                                selectedTable?.id === table.id
                                  ? 'scale-105 z-10'
                                  : 'hover:scale-102',
                                snapshot.isDraggingOver ? 'scale-105 z-20' : '',
                              )}
                              onClick={() =>
                                setSelectedTable(
                                  selectedTable?.id === table.id ? null : table,
                                )
                              }
                            >
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={cn(
                                  'relative bg-white rounded-full shadow-lg border-4 transition-all duration-200',
                                  table.shape === 'round'
                                    ? 'w-32 h-32'
                                    : 'w-40 h-24 rounded-lg',
                                  table.theme === 'principale'
                                    ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50'
                                    : 'border-pink-200',
                                  snapshot.isDraggingOver
                                    ? 'border-pink-400 bg-pink-50'
                                    : '',
                                  selectedTable?.id === table.id
                                    ? 'ring-4 ring-pink-300 ring-opacity-50'
                                    : '',
                                )}
                              >
                                {/* Nom et capacité de la table */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                                  <div className="text-sm font-semibold leading-tight text-gray-800">
                                    {table.name}
                                  </div>
                                  <div className="mt-1 text-xs text-gray-600">
                                    {table.guests.length}/{table.capacity}
                                  </div>
                                  {table.theme === 'principale' && (
                                    <HeartIcon className="mt-1 size-4 text-yellow-600" />
                                  )}
                                </div>

                                {/* Zone de drop pour les invités */}
                                <div
                                  className={cn(
                                    'absolute inset-0 rounded-full opacity-0 transition-opacity',
                                    table.shape === 'rectangular'
                                      ? 'rounded-lg'
                                      : '',
                                    snapshot.isDraggingOver
                                      ? 'opacity-100 bg-pink-200/50'
                                      : '',
                                  )}
                                />

                                {/* Invités assignés à la table */}
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                  <div className="flex max-w-40 flex-wrap justify-center gap-1">
                                    {table.guests
                                      .slice(0, 3)
                                      .map((guest, index) => (
                                        <Draggable
                                          key={guest.id}
                                          draggableId={guest.id}
                                          index={index}
                                        >
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className={cn(
                                                'w-6 h-6 rounded-full text-xs flex items-center justify-center text-white font-medium cursor-move shadow-sm',
                                                guest.side === 'bride'
                                                  ? 'bg-pink-400'
                                                  : 'bg-blue-400',
                                              )}
                                              title={guest.name}
                                            >
                                              {guest.name.charAt(0)}
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                    {table.guests.length > 3 && (
                                      <div className="flex size-6 items-center justify-center rounded-full bg-gray-400 text-xs font-medium text-white">
                                        +{table.guests.length - 3}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {provided.placeholder}
                              </motion.div>
                            </div>
                          )}
                        </Droppable>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Vue Liste
                  <div className="space-y-4">
                    {tables.map((table) => (
                      <Card key={table.id} className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                                {table.theme === 'principale' && (
                                  <HeartIcon className="size-4 text-yellow-600" />
                                )}
                                {table.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {table.guests.length}/{table.capacity} places •{' '}
                                {table.shape === 'round'
                                  ? 'Table ronde'
                                  : 'Table rectangulaire'}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <Droppable droppableId={table.id}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={cn(
                                  'min-h-[60px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 rounded-lg transition-colors',
                                  snapshot.isDraggingOver
                                    ? 'bg-pink-50 border-2 border-pink-200'
                                    : 'bg-gray-50',
                                )}
                              >
                                {table.guests.map((guest, index) => (
                                  <Draggable
                                    key={guest.id}
                                    draggableId={guest.id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        <motion.div
                                          whileHover={{ scale: 1.02 }}
                                          className={cn(
                                            'p-2 bg-white border rounded-lg cursor-move transition-all',
                                            snapshot.isDragging
                                              ? 'shadow-lg rotate-1'
                                              : 'hover:shadow-md',
                                            guest.side === 'bride'
                                              ? 'border-l-4 border-l-pink-400'
                                              : 'border-l-4 border-l-blue-400',
                                          )}
                                        >
                                          <div className="text-sm font-medium text-gray-900">
                                            {guest.name}
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            {guest.relationship}
                                          </div>
                                          {guest.dietaryRestrictions &&
                                            guest.dietaryRestrictions.length >
                                              0 && (
                                              <div className="mt-1 text-xs text-amber-600">
                                                🥗{' '}
                                                {guest.dietaryRestrictions.join(
                                                  ', ',
                                                )}
                                              </div>
                                            )}
                                        </motion.div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                {table.guests.length === 0 && (
                                  <div className="col-span-full py-4 text-center text-gray-500">
                                    <TableCellsIcon className="mx-auto mb-2 size-8 opacity-50" />
                                    <p className="text-sm">
                                      Glissez des invités ici
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DragDropContext>

      {/* Panneau de détails de table sélectionnée */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 w-80 max-w-sm"
          >
            <Card className="border-2 border-pink-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedTable.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTable(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Capacité</span>
                    <span className="font-medium">
                      {selectedTable.guests.length}/{selectedTable.capacity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Forme</span>
                    <span className="font-medium">
                      {selectedTable.shape === 'round'
                        ? 'Ronde'
                        : 'Rectangulaire'}
                    </span>
                  </div>
                  {selectedTable.guests.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-700">
                        Invités assignés :
                      </h4>
                      <div className="space-y-1">
                        {selectedTable.guests.map((guest) => (
                          <div
                            key={guest.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className={cn(
                                'w-3 h-3 rounded-full',
                                guest.side === 'bride'
                                  ? 'bg-pink-400'
                                  : 'bg-blue-400',
                              )}
                            />
                            <span>{guest.name}</span>
                            {guest.dietaryRestrictions &&
                              guest.dietaryRestrictions.length > 0 && (
                                <span className="text-xs text-amber-600">
                                  🥗
                                </span>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
