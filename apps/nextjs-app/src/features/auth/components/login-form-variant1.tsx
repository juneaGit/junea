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

export const LoginFormVariant1 = ({ onSuccess }: LoginFormProps) => {
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
      'à organiser le mariage de vos rêves',
      'à planifier votre budget parfaitement',
      'à gérer vos invités facilement',
      'à créer des souvenirs inoubliables',
      'à réaliser votre vision unique',
      'à simplifier votre organisation',
    ],
    [],
  );

  // Effet typewriter identique
  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    if (isTyping) {
      if (currentText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 50);
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
      {/* Section gauche - Plus d'éléments visuels */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-12">
        {/* Éléments décoratifs de fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-20 top-20 size-32 rounded-full bg-rose-300 blur-2xl"></div>
          <div className="absolute bottom-20 right-20 size-40 rounded-full bg-pink-300 blur-2xl"></div>
          <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-200 blur-xl"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-md">
          {/* Logo et nom avec plus de style */}
          <div className="mb-8 flex items-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-200 shadow-lg">
              <svg
                className="size-8 text-blue-600"
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
            <h1 className="ml-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-3xl font-bold text-transparent">
              Junea
            </h1>
          </div>

          {/* Texte avec animation typewriter */}
          <div className="space-y-8">
            <div className="text-4xl font-bold text-gray-900">
              <span>Junea vous aide</span>
              <span className="block text-rose-600">
                {currentText}
                <span className="animate-pulse text-rose-400">|</span>
              </span>
            </div>

            <p className="text-lg leading-relaxed text-gray-600">
              La plateforme complète pour organiser votre mariage parfait, de la
              planification au jour J.
            </p>

            {/* Statistiques visuelles */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-rose-600">10k+</div>
                <div className="text-sm text-gray-600">Mariages organisés</div>
              </div>
              <div className="rounded-lg bg-white/50 p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-pink-600">98%</div>
                <div className="text-sm text-gray-600">Satisfaction client</div>
              </div>
            </div>

            {/* Fonctionnalités avec icônes */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-rose-100">
                  <svg
                    className="size-4 text-rose-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Planification complète</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-pink-100">
                  <svg
                    className="size-4 text-pink-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Gestion du budget</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-rose-100">
                  <svg
                    className="size-4 text-rose-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Organisation des invités</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite - Identique au design principal */}
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header mobile */}
          <div className="mb-8 lg:hidden">
            <div className="flex items-center justify-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="size-6 text-blue-600"
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
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Junea</h1>
            </div>
          </div>

          {/* Titre du formulaire */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Connexion à Junea
            </h2>
            <p className="mt-2 text-gray-600">
              Accédez à votre espace de planification
            </p>
          </div>

          {/* Formulaire identique */}
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
              <div className="space-y-6">
                <div>
                  <Input
                    type="email"
                    label="Adresse email"
                    placeholder="votre@email.com"
                    error={formState.errors.email}
                    registration={register('email')}
                    className="block w-full appearance-none rounded-lg border border-gray-300 p-3 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 sm:text-sm"
                  />
                </div>

                <div>
                  <Input
                    type="password"
                    label="Mot de passe"
                    placeholder="Votre mot de passe"
                    error={formState.errors.password}
                    registration={register('password')}
                    className="block w-full appearance-none rounded-lg border border-gray-300 p-3 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 sm:text-sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="size-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-600"
                    >
                      Se souvenir de moi
                    </label>
                  </div>

                  <Link
                    href="#"
                    className="text-sm font-medium text-rose-600 hover:text-rose-500"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                {loginMutation.error && (
                  <div className="rounded-lg bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <div className="text-sm text-red-700">
                          {loginMutation.error.message}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || loginMutation.isPending}
                  className="group relative flex w-full justify-center rounded-lg bg-rose-600 p-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading || loginMutation.isPending ? (
                    <>
                      <svg
                        className="-ml-1 mr-3 size-5 animate-spin text-white"
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
                    Pas encore de compte ?{' '}
                    <Link
                      href={paths.auth.register.getHref()}
                      className="font-semibold text-rose-600 hover:text-rose-500"
                    >
                      Créer un compte
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
