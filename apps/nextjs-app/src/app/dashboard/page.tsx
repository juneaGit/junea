'use client';

import React from 'react';

import { AIRecommendations } from '@/components/ai/ai-recommendations';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AppLayout } from '@/components/layouts/app-layout';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tableau de bord
                </h1>
                <p className="mt-1 text-gray-600">
                  Vue d'ensemble de votre mariage
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-pink-600">127</div>
                  <div className="text-sm text-gray-500">Jours restants</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-pink-100">
                    <span className="font-semibold text-pink-600">€</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    15,000€
                  </div>
                  <div className="text-sm text-gray-500">Budget total</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100">
                    <span className="font-semibold text-blue-600">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">85</div>
                  <div className="text-sm text-gray-500">Invités confirmés</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-green-100">
                    <span className="font-semibold text-green-600">✓</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">12/25</div>
                  <div className="text-sm text-gray-500">Tâches terminées</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center">
                <div className="shrink-0">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100">
                    <span className="font-semibold text-purple-600">📍</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  <div className="text-sm text-gray-500">
                    Prestataires choisis
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Activité récente
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="size-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    Lieu confirmé : Château de Versailles
                  </p>
                  <p className="text-xs text-gray-500">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="size-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    15 nouvelles confirmations d'invités
                  </p>
                  <p className="text-xs text-gray-500">Il y a 1 jour</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="size-2 rounded-full bg-yellow-500"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Devis traiteur reçu</p>
                  <p className="text-xs text-gray-500">Il y a 3 jours</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <AIRecommendations />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
