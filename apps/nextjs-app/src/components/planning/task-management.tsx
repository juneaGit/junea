'use client';

import {
  BellIcon,
  LightBulbIcon,
  ChatBubbleLeftEllipsisIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  FireIcon,
  ClockIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  timeline: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'todo' | 'inprogress' | 'done';
  dueDate?: string;
  estimatedDuration?: string;
  tips?: string[];
  relatedBudget?: number;
}

interface TaskManagementProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onShowAIAssistant: () => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({
  tasks,
  onUpdateTask,
  onShowAIAssistant,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [encouragementMessage, setEncouragementMessage] = useState('');

  // Messages d'encouragement personnalisés
  const encouragementMessages = useMemo(
    () => [
      '🌸 Vous progressez magnifiquement ! Chaque étape vous rapproche de votre jour magique.',
      '💕 Bravo ! Votre organisation méthodique impressionne. Junea est fière de vous !',
      '🎉 Fantastique ! Votre mariage prend forme grâce à votre dévouement.',
      '✨ Excellent travail ! Vous transformez vos rêves en réalité, une tâche à la fois.',
      '🌟 Continuez ainsi ! Votre attention aux détails fera de ce mariage un moment inoubliable.',
    ],
    [],
  );

  // Conseils personnalisés basés sur les tâches
  const getPersonalizedTips = () => {
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const totalTasks = tasks.length;
    const progress = (completedTasks / totalTasks) * 100;

    if (progress < 20) {
      return [
        '🎯 Commencez par les tâches urgentes (marquées en rouge) pour sécuriser les éléments essentiels.',
        '📋 Créez un planning hebdomadaire pour répartir les tâches et éviter la surcharge.',
        "💡 N'hésitez pas à déléguer certaines tâches à votre famille ou vos amis proches.",
      ];
    } else if (progress < 50) {
      return [
        '🌸 Excellent début ! Pensez à faire des pauses régulières pour éviter le stress.',
        '📞 Contactez vos prestataires pour confirmer les détails et éviter les surprises.',
        '💰 Faites un point budget régulier pour rester dans vos objectifs financiers.',
      ];
    } else if (progress < 80) {
      return [
        '🎊 Bravo ! Vous êtes sur la bonne voie. Commencez à penser aux détails de dernière minute.',
        '📝 Préparez une checklist pour la semaine du mariage avec tous les contacts importants.',
        '🤝 Désignez une personne de confiance pour vous assister le jour J.',
      ];
    } else {
      return [
        '👑 Félicitations ! Vous maîtrisez parfaitement votre organisation.',
        '🧘‍♀️ Prenez du temps pour vous relaxer avant le grand jour.',
        '💕 Profitez de ces derniers préparatifs, le plus dur est fait !',
      ];
    }
  };

  // Notifications intelligentes
  const getSmartNotifications = () => {
    const now = new Date();
    const urgentTasks = tasks.filter(
      (t) => t.urgency === 'high' && t.status !== 'done',
    );
    const overdueTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now && t.status !== 'done';
    });

    const notifications = [];

    if (urgentTasks.length > 0) {
      notifications.push({
        type: 'urgent',
        title: `${urgentTasks.length} tâche(s) urgente(s)`,
        message: 'Ces tâches nécessitent votre attention immédiate',
        tasks: urgentTasks,
        icon: FireIcon,
        color: 'text-red-500',
      });
    }

    if (overdueTasks.length > 0) {
      notifications.push({
        type: 'overdue',
        title: `${overdueTasks.length} tâche(s) en retard`,
        message: 'Il serait bien de vous en occuper rapidement',
        tasks: overdueTasks,
        icon: ClockIcon,
        color: 'text-orange-500',
      });
    }

    // Suggestions positives
    const completedToday = tasks.filter(
      (t) =>
        t.status === 'done' &&
        new Date(t.dueDate || '').toDateString() === now.toDateString(),
    );

    if (completedToday.length > 0) {
      notifications.push({
        type: 'celebration',
        title: `🎉 ${completedToday.length} tâche(s) terminée(s) aujourd'hui !`,
        message: "Bravo ! Vous avez été productif(ve) aujourd'hui",
        tasks: completedToday,
        icon: CheckCircleIcon,
        color: 'text-green-500',
      });
    }

    return notifications;
  };

  // Calculer les métriques importantes
  const getMetrics = () => {
    const totalBudget = tasks.reduce(
      (sum, task) => sum + (task.relatedBudget || 0),
      0,
    );
    const completedBudget = tasks
      .filter((t) => t.status === 'done')
      .reduce((sum, task) => sum + (task.relatedBudget || 0), 0);

    const urgentCount = tasks.filter(
      (t) => t.urgency === 'high' && t.status !== 'done',
    ).length;
    const categoryProgress = tasks.reduce(
      (acc, task) => {
        if (!acc[task.category]) {
          acc[task.category] = { total: 0, completed: 0 };
        }
        acc[task.category].total++;
        if (task.status === 'done') {
          acc[task.category].completed++;
        }
        return acc;
      },
      {} as Record<string, { total: number; completed: number }>,
    );

    return {
      totalBudget,
      completedBudget,
      urgentCount,
      categoryProgress,
    };
  };

  const metrics = getMetrics();
  const notifications = getSmartNotifications();
  const personalizedTips = getPersonalizedTips();

  // Afficher un message d'encouragement périodique
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessage =
        encouragementMessages[
          Math.floor(Math.random() * encouragementMessages.length)
        ];
      setEncouragementMessage(randomMessage);
      setTimeout(() => setEncouragementMessage(''), 5000);
    }, 60000); // Chaque minute

    return () => clearInterval(interval);
  }, [encouragementMessages]);

  return (
    <div className="space-y-6">
      {/* Message d'encouragement flottant */}
      <AnimatePresence>
        {encouragementMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed left-1/2 top-20 z-50 max-w-md -translate-x-1/2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 p-4 text-center text-white shadow-lg"
          >
            <p className="text-sm font-medium">{encouragementMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications intelligentes */}
      <Card className="border-pink-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BellIcon className="size-5 text-pink-500" />
              Notifications & Rappels
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-pink-600 hover:text-pink-700"
            >
              {showNotifications ? 'Masquer' : 'Afficher'}
            </Button>
          </div>
        </CardHeader>
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-6"
            >
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <motion.div
                      key={notification.type}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 rounded-lg bg-gray-50 p-3"
                    >
                      <notification.icon
                        className={cn('size-5 mt-0.5', notification.color)}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.message}
                        </p>
                        {notification.tasks.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {notification.tasks.slice(0, 3).map((task) => (
                              <div
                                key={task.id}
                                className="text-xs text-gray-500"
                              >
                                • {task.title}
                              </div>
                            ))}
                            {notification.tasks.length > 3 && (
                              <div className="text-xs text-gray-500">
                                ... et {notification.tasks.length - 3} autres
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-6 text-center">
                    <CheckCircleIcon className="mx-auto mb-2 size-12 text-green-500" />
                    <p className="text-gray-600">
                      Excellent ! Aucune notification urgente.
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Continuez votre excellent travail ! 🎉
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Conseils personnalisés */}
      <Card className="border-pink-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LightBulbIcon className="size-5 text-yellow-500" />
              Conseils Personnalisés
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTips(!showTips)}
              className="text-yellow-600 hover:text-yellow-700"
            >
              {showTips ? 'Masquer' : 'Afficher'}
            </Button>
          </div>
        </CardHeader>
        <AnimatePresence>
          {showTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-6 pb-6"
            >
              <div className="space-y-3">
                {personalizedTips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 rounded-lg bg-yellow-50 p-3"
                  >
                    <InformationCircleIcon className="mt-0.5 size-5 text-yellow-600" />
                    <p className="text-sm text-gray-700">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Métriques et insights */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-3">
              <CurrencyDollarIcon className="size-6 text-green-500" />
              <h3 className="font-medium text-gray-900">Budget Progress</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Dépenses confirmées</span>
                <span className="font-medium">{metrics.completedBudget}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Budget total estimé</span>
                <span className="font-medium">{metrics.totalBudget}€</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all duration-500"
                  style={{
                    width: `${metrics.totalBudget > 0 ? (metrics.completedBudget / metrics.totalBudget) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-3">
              <UserGroupIcon className="size-6 text-purple-500" />
              <h3 className="font-medium text-gray-900">Catégories</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(metrics.categoryProgress)
                .slice(0, 3)
                .map(([category, progress]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 rounded-full bg-gray-200">
                        <div
                          className="h-1 rounded-full bg-purple-500 transition-all duration-500"
                          style={{
                            width: `${(progress.completed / progress.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right font-medium">
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assistant IA flottant */}
      <Button
        onClick={onShowAIAssistant}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-4 text-white shadow-lg hover:from-pink-600 hover:to-rose-600"
        size="lg"
      >
        <ChatBubbleLeftEllipsisIcon className="size-6" />
        <span className="ml-2 hidden sm:inline">Besoin d'aide ?</span>
      </Button>
    </div>
  );
};
