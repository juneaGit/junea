'use client';

import {
  HomeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MapPinIcon,
  CakeIcon,
  MusicalNoteIcon,
  PhotoIcon,
  SparklesIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

import { useAppSelector } from '@/store/hooks';
import { weddingTypeThemes } from '@/styles/theme';
import { cn } from '@/utils/cn';

const navigationItems = [
  {
    name: 'Accueil',
    href: '/app',
    icon: HomeIcon,
    description: "Vue d'ensemble de votre mariage",
  },
  {
    name: 'Tâches',
    href: '/app/planning',
    icon: ClipboardDocumentListIcon,
    description: 'Rétro-planning et tâches',
  },
  {
    name: 'Budget',
    href: '/app/budget',
    icon: CurrencyDollarIcon,
    description: 'Gestion des dépenses',
  },
  {
    name: 'Invités',
    href: '/app/guests',
    icon: UserGroupIcon,
    description: 'Liste des invités et RSVP',
  },
  {
    name: 'Plan de Table',
    href: '/app/seating',
    icon: UserGroupIcon,
    description: 'Organisation des tables',
  },
  {
    name: 'Lieu',
    href: '/app/venue',
    icon: MapPinIcon,
    description: 'Sélection du lieu',
  },
  {
    name: 'Traiteur',
    href: '/app/catering',
    icon: CakeIcon,
    description: 'Menus et prestataires',
  },
  {
    name: 'Musique & DJ',
    href: '/app/music',
    icon: MusicalNoteIcon,
    description: 'Ambiance musicale',
  },
  {
    name: 'Photographie',
    href: '/app/photography',
    icon: PhotoIcon,
    description: 'Photographe et souvenirs',
  },
  {
    name: 'Prestations',
    href: '/app/services',
    icon: SparklesIcon,
    description: 'Services supplémentaires',
  },
  {
    name: 'Planning Jour J',
    href: '/app/day-planning',
    icon: ClockIcon,
    description: 'Timeline du jour J',
  },
  {
    name: 'Paramètres',
    href: '/app/settings',
    icon: Cog6ToothIcon,
    description: 'Paramètres du compte',
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const weddingProfile = useAppSelector(
    (state) => (state as any).wedding.profile,
  );

  const currentTheme = weddingProfile?.wedding_type
    ? weddingTypeThemes[
        weddingProfile.wedding_type as keyof typeof weddingTypeThemes
      ]
    : weddingTypeThemes.romantique;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <HeartIcon className="size-8 text-pink-500" />
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {weddingProfile?.couple_name || 'Mon Mariage'}
              </h1>
              <p className="text-sm text-gray-500">
                {weddingProfile?.wedding_date
                  ? new Date(weddingProfile.wedding_date).toLocaleDateString(
                      'fr-FR',
                    )
                  : 'Date à définir'}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="hidden rounded-md p-1 transition-colors hover:bg-gray-100 lg:block"
        >
          {isCollapsed ? (
            <Bars3Icon className="size-5 text-gray-500" />
          ) : (
            <XMarkIcon className="size-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group',
                    isActive
                      ? 'bg-gradient-to-r text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                    isActive && `bg-gradient-to-r ${currentTheme.gradient}`,
                  )}
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`
                      : undefined,
                  }}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isActive
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-gray-700',
                    )}
                  />
                  {!isCollapsed && (
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span>{item.name}</span>
                      </div>
                      <p
                        className={cn(
                          'text-xs mt-1 transition-colors',
                          isActive ? 'text-white/80' : 'text-gray-500',
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        {!isCollapsed && (
          <div className="text-center">
            <div className="mb-2 text-xs text-gray-500">
              Thème : {weddingProfile?.wedding_type || 'Romantique'}
            </div>
            <div
              className="h-2 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <button
          onClick={toggleMobileSidebar}
          className="fixed left-4 top-4 z-50 rounded-md border border-gray-200 bg-white p-2 shadow-lg"
        >
          <Bars3Icon className="size-6 text-gray-600" />
        </button>

        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={toggleMobileSidebar}
            />
            <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
              <SidebarContent />
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-30 bg-white border-r border-gray-200 transition-all duration-300',
          isCollapsed ? 'lg:w-16' : 'lg:w-80',
          className,
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
}
