'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader, CheckCircle } from 'lucide-react';

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && searchParams.get('registered') === 'true') {
      setSuccess('Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.');
      const url = new URL(window.location.href);
      url.searchParams.delete('registered');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Identifiants invalides');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6'>
      <Card className='w-full max-w-md mx-auto shadow-lg transition-all duration-300 hover:shadow-xl'>
        <CardHeader className='space-y-1'>
          <div className='flex justify-center mb-2'>
            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
              <svg
                className='w-8 h-8 text-primary'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
            </div>
          </div>
          <CardTitle className='text-2xl font-bold text-center text-gray-800'>Connexion</CardTitle>
          <p className='text-sm text-center text-gray-500'>
            Entrez vos identifiants pour accéder à votre compte
          </p>
        </CardHeader>
        <CardContent className='px-4 sm:px-6 py-4'>
          <form
            className='space-y-4'
            onSubmit={handleSubmit}
          >
            {success && (
              <Alert>
                <CheckCircle className='h-4 w-4 mr-2' />
                <AlertTitle>Succès !</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant='destructive'>
                <AlertTitle className='flex items-center'>
                  <svg
                    className='w-4 h-4 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  Erreur
                </AlertTitle>
                <AlertDescription className='mt-1'>{error}</AlertDescription>
              </Alert>
            )}
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='username'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Nom d'utilisateur
                </label>
                <Input
                  id='username'
                  name='username'
                  type='text'
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className='w-full transition duration-200 border-gray-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20'
                />
              </div>
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Mot de passe
                  </label>
                  {/* TODO FAIRE CA */}
                  <a
                    href='#'
                    className='text-xs text-primary hover:underline'
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  required
                  value={formData.password}
                  onChange={handleChange}
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
            <div className='text-center text-sm mt-4'>
              <span className='text-gray-600'>Pas encore de compte ? </span>
              <Link
                href='/register'
                className='text-primary hover:underline font-medium'
              >
                Créer un compte
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
