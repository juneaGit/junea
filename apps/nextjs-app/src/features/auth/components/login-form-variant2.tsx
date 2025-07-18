'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';
import { paths } from '@/config/paths';
import { useLogin, loginInputSchema } from '@/lib/auth';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginFormVariant2 = ({ onSuccess }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const loginMutation = useLogin({
    onSuccess: () => {
      setIsLoading(false);
      onSuccess?.();
    },
  });

  const phrases = useMemo(
    () => [
      'organisez votre mariage',
      'planifiez votre budget',
      'gérez vos invités',
      'créez vos souvenirs',
      'réalisez vos rêves',
    ],
    [],
  );

  // Effet typewriter plus rapide et minimaliste
  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    if (isTyping) {
      if (currentText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        }, 80);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 1500);
        return () => clearTimeout(timeout);
      }
    } else {
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 40);
        return () => clearTimeout(timeout);
      } else {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsTyping(true);
      }
    }
  }, [currentText, isTyping, currentPhraseIndex, phrases]);

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync(values);
    } catch (error) {
      setIsLoading(false);
      console.error('Erreur lors de la connexion:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Section gauche - Très minimaliste */}
      <div className="hidden bg-gradient-to-br from-rose-50 to-pink-50 lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-16">
        <div className="mx-auto max-w-sm">
          {/* Logo simple */}
          <div className="mb-12 flex items-center justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-sm">
              <svg
                className="size-8 text-rose-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
          </div>

          {/* Texte avec animation typewriter - Plus simple */}
          <div className="space-y-6 text-center">
            <div className="text-2xl font-light text-gray-900">
              <span className="block">Junea vous aide à</span>
              <span className="block h-8 font-medium text-rose-600">
                {currentText}
                <span className="animate-pulse">|</span>
              </span>
            </div>

            <p className="text-gray-600">
              Votre compagnon pour un mariage parfait
            </p>
          </div>
        </div>
      </div>

      {/* Section droite - Formulaire épuré */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Header mobile minimaliste */}
          <div className="mb-8 lg:hidden">
            <div className="flex items-center justify-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-rose-50">
                <svg
                  className="size-6 text-rose-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h1 className="ml-3 text-xl font-medium text-gray-900">Junea</h1>
            </div>
          </div>

          {/* Titre simple */}
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-900">Connexion</h2>
            <p className="mt-2 text-sm text-gray-600">Accédez à votre espace</p>
          </div>

          {/* Formulaire minimaliste */}
          <Form
            onSubmit={handleSubmit}
            schema={loginInputSchema}
            options={{
              defaultValues: {
                email: '',
                password: '',
              },
            }}
          >
            {({ register, formState }) => (
              <div className="space-y-5">
                <div>
                  <Input
                    type="email"
                    label="Email"
                    placeholder="votre@email.com"
                    error={formState.errors.email}
                    registration={register('email')}
                    className="block w-full appearance-none rounded-md border border-gray-200 p-3 placeholder:text-gray-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 sm:text-sm"
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    label="Mot de passe"
                    placeholder="••••••••"
                    error={formState.errors.password}
                    registration={register('password')}
                    className="block w-full appearance-none rounded-md border border-gray-200 p-3 placeholder:text-gray-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 sm:text-sm"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Link href="#" className="text-rose-600 hover:text-rose-500">
                    Mot de passe oublié ?
                  </Link>
                </div>

                {loginMutation.error && (
                  <div className="rounded-md bg-red-50 p-3">
                    <div className="text-sm text-red-700">
                      {loginMutation.error.message}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || loginMutation.isPending}
                  className="w-full justify-center rounded-md bg-gray-900 p-3 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50"
                >
                  {isLoading || loginMutation.isPending ? (
                    <>
                      <svg
                        className="-ml-1 mr-3 size-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Pas de compte ?{' '}
                    <Link
                      href={paths.auth.register.getHref()}
                      className="font-medium text-rose-600 hover:text-rose-500"
                    >
                      S'inscrire
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};
