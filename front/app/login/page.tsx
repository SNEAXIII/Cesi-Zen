'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Identifiants incorrects');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la connexion');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6'>
      <Card className='w-full max-w-md mx-auto shadow-lg transition-all duration-300 hover:shadow-xl'>
        <CardHeader className='space-y-1'>
          <div className='flex justify-center mb-2'>
            {/* Ajoutez votre logo ici si nécessaire */}
            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
              <svg className='w-8 h-8 text-primary' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
              </svg>
            </div>
          </div>
          <CardTitle className='text-2xl font-bold text-center text-gray-800'>
            Connexion
          </CardTitle>
          <p className='text-sm text-center text-gray-500'>
            Entrez vos identifiants pour accéder à votre compte
          </p>
        </CardHeader>
        <CardContent className='px-4 sm:px-6 py-4'>
          <form className='space-y-4' onSubmit={handleSubmit}>
            {error && (
              <Alert variant='destructive' className='mb-4'>
                <AlertTitle className='flex items-center'>
                  <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  Erreur
                </AlertTitle>
                <AlertDescription className='mt-1'>{error}</AlertDescription>
              </Alert>
            )}
            <div className='space-y-4'>
              <div>
                <label htmlFor='username' className='block text-sm font-medium text-gray-700 mb-1'>
                  Nom d'utilisateur
                </label>
                <Input
                  id='username'
                  name='username'
                  type='text'
                  required
                  className='w-full transition duration-200 border-gray-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20'
                />
              </div>
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                    Mot de passe
                  </label>
                  <a href='#' className='text-xs text-primary hover:underline'>
                    Mot de passe oublié ?
                  </a>
                </div>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  required
                  className='w-full transition duration-200 border-gray-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20'
                />
              </div>
            </div>
            <Button
              type='submit'
              className='w-full py-2 text-base font-medium text-white transition duration-200 bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-lg'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className='w-5 h-5 mr-2 animate-spin' />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
