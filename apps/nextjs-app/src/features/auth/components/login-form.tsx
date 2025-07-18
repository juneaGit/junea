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

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
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

  // Phrases pour l'effet typewriter
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

  // Effet typewriter
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
      {/* Section gauche - Engageante avec typewriter */}
      <div className="hidden bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-12">
        <div className="mx-auto max-w-md">
          {/* Logo et nom */}
          <div className="mb-8 flex items-center">
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

          {/* Texte avec animation typewriter */}
          <div className="space-y-6">
            <div className="text-4xl font-bold text-gray-900">
              <span>Junea vous aide</span>
              <span className="block text-rose-600">
                {currentText}
                <span className="animate-pulse">|</span>
              </span>
            </div>

            <p className="text-lg text-gray-600">
              La plateforme complète pour organiser votre mariage parfait, de la
              planification au jour J.
            </p>

            {/* Éléments visuels subtils */}
            <div className="flex items-center space-x-6 pt-8">
              <div className="flex items-center space-x-2">
                <div className="size-3 rounded-full bg-rose-400"></div>
                <span className="text-sm text-gray-600">Planification</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="size-3 rounded-full bg-pink-400"></div>
                <span className="text-sm text-gray-600">Budget</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="size-3 rounded-full bg-rose-300"></div>
                <span className="text-sm text-gray-600">Invités</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite - Formulaire */}
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

          {/* Formulaire */}
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
