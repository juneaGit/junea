'use client';

import { useEffect, useState } from 'react';

export const useSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Charger l'état sauvegardé au montage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Sauvegarder l'état à chaque changement
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  // Classes dynamiques pour le contenu principal
  const getMainContentClasses = () => {
    return isCollapsed ? 'lg:pl-16' : 'lg:pl-80';
  };

  const getMainContentMarginClasses = () => {
    return isCollapsed ? 'lg:ml-16' : 'lg:ml-80';
  };

  // Largeur de la sidebar
  const getSidebarWidth = () => {
    return isCollapsed ? 'lg:w-16' : 'lg:w-80';
  };

  return {
    isCollapsed,
    isMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    getMainContentClasses,
    getMainContentMarginClasses,
    getSidebarWidth,
  };
}; 