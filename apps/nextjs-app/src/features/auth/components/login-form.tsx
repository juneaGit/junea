'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';
import { paths } from '@/config/paths';
import { useLogin, loginInputSchema } from '@/lib/auth';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = useLogin({
    onSuccess: () => {
      setIsLoading(false);
      onSuccess?.();
    },
  });

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-rose-100">
            <svg
              className="size-6 text-rose-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accédez à votre espace de planification
          </p>
        </div>

        <div className="rounded-lg bg-white px-6 py-8 shadow-lg">
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
                <Input
                  type="email"
                  label="Email"
                  placeholder="votre@email.com"
                  error={formState.errors.email}
                  registration={register('email')}
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:z-10 focus:border-rose-500 focus:outline-none focus:ring-rose-500 sm:text-sm"
                />

                <Input
                  type="password"
                  label="Mot de passe"
                  placeholder="Votre mot de passe"
                  error={formState.errors.password}
                  registration={register('password')}
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-500 focus:z-10 focus:border-rose-500 focus:outline-none focus:ring-rose-500 sm:text-sm"
                />

                {loginMutation.error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">
                      {loginMutation.error.message}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || loginMutation.isPending}
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

                <div className="space-y-2 text-center">
                  <p className="text-sm text-gray-600">
                    Pas encore de compte ?{' '}
                    <Link
                      href={paths.auth.register.getHref()}
                      className="font-medium text-rose-600 transition-colors hover:text-rose-500"
                    >
                      Créer un compte
                    </Link>
                  </p>

                  <p className="text-sm">
                    <Link
                      href="#"
                      className="font-medium text-gray-500 transition-colors hover:text-gray-400"
                    >
                      Mot de passe oublié ?
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
