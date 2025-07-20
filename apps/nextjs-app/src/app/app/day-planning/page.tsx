'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ClockIcon, PlusIcon, SparklesIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIButton } from '@/components/ai';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';

interface WeddingEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  responsible?: string;
  location?: string;
  color?: string;
  ai_generated?: boolean;
}

// Événements de démonstration avec couleurs améliorées
const DEMO_EVENTS: WeddingEvent[] = [
  {
    id: '1',
    title: 'Arrivée des mariés - Préparatifs',
    start: '2024-06-15T08:00:00',
    end: '2024-06-15T10:00:00',
    description: 'Arrivée sur le lieu, derniers préparatifs et photos des préparations',
    responsible: 'Wedding planner',
    location: 'Suite nuptiale',
    color: '#8B5CF6', // Violet saturé
  },
  {
    id: '2',
    title: '📸 Séance photo couple',
    start: '2024-06-15T10:30:00',
    end: '2024-06-15T11:30:00',
    description: 'Photos du couple dans les jardins',
    responsible: 'Photographe',
    location: 'Jardins du château',
    color: '#F59E0B', // Jaune/orange saturé
  },
  {
    id: '3',
    title: '💒 Cérémonie religieuse',
    start: '2024-06-15T14:00:00',
    end: '2024-06-15T15:30:00',
    description: 'Cérémonie à l\'église Saint-Martin',
    responsible: 'Prêtre + Wedding planner',
    location: 'Église Saint-Martin',
    color: '#DC2626', // Rouge saturé pour importance
  },
  {
    id: '4',
    title: '🥂 Cocktail de réception',
    start: '2024-06-15T16:00:00',
    end: '2024-06-15T18:00:00',
    description: 'Cocktail avec canapés et champagne dans les jardins',
    responsible: 'Traiteur + Service',
    location: 'Terrasse du château',
    color: '#EC4899', // Rose saturé
  },
  {
    id: '5',
    title: '🍽️ Dîner de gala',
    start: '2024-06-15T19:00:00',
    end: '2024-06-15T22:30:00',
    description: 'Dîner assis avec menu gastronomique 5 services',
    responsible: 'Traiteur',
    location: 'Grande salle de réception',
    color: '#059669', // Vert saturé
  },
  {
    id: '6',
    title: '🎵 Première danse',
    start: '2024-06-15T22:30:00',
    end: '2024-06-15T23:00:00',
    description: 'Première danse des mariés',
    responsible: 'DJ + Éclairagiste',
    location: 'Piste de danse',
    color: '#D97706', // Orange saturé
  },
  {
    id: '7',
    title: '🎉 Soirée dansante',
    start: '2024-06-15T23:00:00',
    end: '2024-06-16T02:00:00',
    description: 'Soirée dansante avec DJ et bar ouvert',
    responsible: 'DJ + Barman',
    location: 'Salle de bal',
    color: '#1D4ED8', // Bleu saturé
  },
];

export default function DayPlanningPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  
  const [events, setEvents] = useState<WeddingEvent[]>(DEMO_EVENTS);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WeddingEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [calendarView, setCalendarView] = useState<'timeGridDay' | 'timeline'>('timeGridDay');

  // Statistiques
  const stats = {
    totalEvents: events.length,
    duration: '18h00', // De 8h à 2h du matin
    criticalEvents: events.filter(e => e.title.includes('Cérémonie') || e.title.includes('Dîner')).length,
    aiGenerated: events.filter(e => e.ai_generated).length,
  };

  const handleEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setShowEventModal(true);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    const title = prompt('Titre de l\'événement:');
    if (title) {
      const newEvent: WeddingEvent = {
        id: Date.now().toString(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        color: '#f3e8ff',
      };
      setEvents([...events, newEvent]);
    }
  };

  const generateAITimeline = async () => {
    setLoading(true);
    try {
      // Simulation d'une génération IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ajouter quelques événements générés par IA
      const aiEvents: WeddingEvent[] = [
        {
          id: 'ai-1',
          title: '🌸 Lancer de pétales de rose',
          start: '2024-06-15T15:30:00',
          end: '2024-06-15T15:45:00',
          description: 'Sortie de l\'église avec lancer de pétales par les invités',
          responsible: 'Invités + Photographe',
          color: '#7C3AED', // Violet saturé pour IA
          ai_generated: true,
        },
        {
          id: 'ai-2',
          title: '🎭 Animation enfants',
          start: '2024-06-15T16:30:00',
          end: '2024-06-15T17:30:00',
          description: 'Coin enfants avec animatrice pendant le cocktail',
          responsible: 'Animatrice',
          color: '#0891B2', // Cyan saturé pour IA
          ai_generated: true,
        },
      ];
      
      setEvents(prev => [...prev, ...aiEvents]);
    } catch (error) {
      console.error('Erreur génération timeline IA:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">{t('auth.login')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
            <ClockIcon className="size-8 text-blue-600" />
            {t('dayPlanning.title')}
          </h1>
          <p className="mt-1 text-gray-600">
            {t('dayPlanning.description')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AIButton onGenerate={generateAITimeline} loading={loading}>
            {t('dayPlanning.aiSuggestions')}
          </AIButton>
          <Button>
            <PlusIcon className="mr-2 size-4" />
            {t('dayPlanning.addEvent')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Événements totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Durée totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.duration}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Événements critiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Suggestions IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.aiGenerated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Vue Timeline */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Timeline du Jour J - 15 Juin 2024
          </h2>
          
          <div className="flex items-center gap-2">
            <Button
              variant={calendarView === 'timeGridDay' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalendarView('timeGridDay')}
            >
              <ClockIcon className="mr-2 size-4" />
              Vue Horaire
            </Button>
            <Button
              variant={calendarView === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCalendarView('timeline')}
            >
              <EyeIcon className="mr-2 size-4" />
              Vue Liste
            </Button>
          </div>
        </div>

        {calendarView === 'timeGridDay' ? (
          <div className="calendar-container" style={{ height: '700px' }}>
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridDay"
              headerToolbar={false}
              initialDate="2024-06-15"
              slotMinTime="07:00:00"
              slotMaxTime="26:00:00" // Permet d'aller jusqu'à 2h du matin
              events={events}
              eventClick={handleEventClick}
              select={handleDateSelect}
              selectable={true}
              height="100%"
              locale="fr"
              allDaySlot={false}
              slotDuration="00:30:00"
              eventDisplay="block"
              eventClassNames="rounded-lg border-2 px-2 py-1 text-sm font-medium shadow-md"
              // Amélioration UX/UI
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              dayHeaderFormat={{
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              }}
              // Styles personnalisés via les options
              eventContent={(eventInfo) => (
                <div 
                  className="p-2 rounded-md text-white font-semibold shadow-sm"
                  style={{
                    backgroundColor: eventInfo.event.backgroundColor,
                    fontSize: '0.875rem',
                    lineHeight: '1.2',
                    minHeight: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <div className="font-bold">{eventInfo.event.title}</div>
                  <div className="text-xs opacity-90">
                    {new Date(eventInfo.event.start!).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
            />
          </div>
          

        ) : (
          <div className="space-y-4">
            {/* Timeline en liste */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">{t('dayPlanning.timelineOverview')}</h3>
              
              {events
                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                .map((event, index) => {
                  const startTime = new Date(event.start);
                  const endTime = new Date(event.end);
                  
                  return (
                    <div key={event.id} className="flex items-start gap-4 mb-6 last:mb-0">
                      {/* Indicateur de temps */}
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        {index < events.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      
                      {/* Contenu de l'événement */}
                      <div className="flex-1">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                {event.ai_generated && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                                    IA
                                  </span>
                                )}
                              </div>
                              
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">
                                  {startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {' - '}
                                <span className="font-medium">
                                  {endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-gray-400 ml-2">
                                  ({Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))} min)
                                </span>
                              </div>
                              
                              {event.description && (
                                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {event.responsible && (
                                  <span>👤 {event.responsible}</span>
                                )}
                                {event.location && (
                                  <span>📍 {event.location}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </Card>

      {/* Légende */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3">💡 Conseils pour votre planning :</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Prévoyez 15-30 minutes de battement entre chaque événement</li>
          <li>• Communiquez les horaires à tous les prestataires 1 semaine avant</li>
          <li>• Désignez une personne responsable pour coordonner chaque moment</li>
          <li>• Préparez un planning de secours en cas d'intempéries</li>
        </ul>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <Spinner size="lg" />
            <div>
              <p className="font-medium">Génération IA en cours...</p>
              <p className="text-sm text-gray-600">Création de votre timeline personnalisée</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 