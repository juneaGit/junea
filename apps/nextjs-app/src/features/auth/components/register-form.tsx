'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';
import { paths } from '@/config/paths';
import { useRegister, registerInputSchema } from '@/lib/auth';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const registerMutation = useRegister({
    onSuccess: () => {
      setIsLoading(false);
      onSuccess?.();
    },
  });

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      await registerMutation.mutateAsync(values);
    } catch (error) {
      setIsLoading(false);
      console.error('Erreur lors de l\'inscription:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-rose-100">
            <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Commencez à planifier votre mariage de rêve
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <Form
            onSubmit={handleSubmit}
            schema={registerInputSchema}
            options={{
              defaultValues: {
                email: '',
                password: '',
                confirmPassword: '',
                fullName: '',
              },
            }}
          >
            {({ register, formState }) => (
              <div className="space-y-6">
                <Input
                  type="text"
                  label="Nom complet"
                  placeholder="Votre nom complet"
                  error={formState.errors.fullName}
                  registration={register('fullName')}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                />

                <Input
                  type="email"
                  label="Email"
                  placeholder="votre@email.com"
                  error={formState.errors.email}
                  registration={register('email')}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                />

                <Input
                  type="password"
                  label="Mot de passe"
                  placeholder="Minimum 6 caractères"
                  error={formState.errors.password}
                  registration={register('password')}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                />

                <Input
                  type="password"
                  label="Confirmer le mot de passe"
                  placeholder="Répétez votre mot de passe"
                  error={formState.errors.confirmPassword}
                  registration={register('confirmPassword')}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm"
                />

                {registerMutation.error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">
                      {registerMutation.error.message}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || registerMutation.isPending}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || registerMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création du compte...
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Vous avez déjà un compte ?{' '}
                    <Link
                      href={paths.auth.login.getHref()}
                      className="font-medium text-rose-600 hover:text-rose-500 transition-colors"
                    >
                      Se connecter
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
