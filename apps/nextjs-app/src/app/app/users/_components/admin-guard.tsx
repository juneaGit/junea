'use client';

import { Spinner } from '@/components/ui/spinner';
import { useUser } from '@/lib/auth';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();

  if (!user?.data) {
    return <Spinner className="m-4" />;
  }

  // Pour l'instant, permettre à tous les utilisateurs d'accéder à cette page
  // TODO: Implémenter la vérification des rôles avec Supabase
  // if (!canViewUsers(user?.data)) {
  //   return <div>Only admin can view this.</div>;
  // }

  return children;
};
