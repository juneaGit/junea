import type { ReactNode } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Metadata } from 'next';

import { ReduxProvider } from '@/providers/redux-provider';
import { AppProvider } from '../app/provider';

// Initialiser i18n dès le démarrage de l'app
import '../lib/i18n';

import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Mon Mariage de Rêve - Organisez votre mariage facilement',
  description:
    'Application complète pour organiser votre mariage : budget, invités, planning et bien plus !',
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();

  // Commenté temporairement pour éviter les erreurs
  // await queryClient.prefetchQuery(getUserQueryOptions());

  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang="fr">
      <body>
        <ReduxProvider>
          <AppProvider>
            <HydrationBoundary state={dehydratedState}>
              {children}
            </HydrationBoundary>
          </AppProvider>
        </ReduxProvider>
      </body>
    </html>
  );
};

export default RootLayout;

// We are not prerendering anything because the app is highly dynamic
// and the data depends on the user so we need to send cookies with each request
export const dynamic = 'force-dynamic';
