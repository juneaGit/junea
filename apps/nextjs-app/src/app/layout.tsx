import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { ReactNode } from 'react';

import { AppProvider } from '@/app/provider';
import { getUserQueryOptions } from '@/lib/auth';
import { ReduxProvider } from '@/providers/redux-provider';

import '@/styles/globals.css';

export const metadata = {
  title: 'Mon Mariage - Organisez votre mariage de rêve',
  description:
    'Application SaaS pour organiser votre mariage facilement avec IA et recommandations personnalisées',
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
