'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { registerUser } from '../services/users';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    try {
      await registerUser(formData);
      setSuccess('Inscription réussie ! Redirection...');
      router.push('/login?registered=true');
    } catch (err) {
      if (err instanceof Error) {
        const error = err as Error & { validationErrors?: Record<string, { message: string }> };

        if (error.validationErrors) {
          // Convertir les erreurs de validation en un format plus simple pour l'affichage
          const errors: Record<string, string> = {};
          Object.entries(error.validationErrors).forEach(([field, error]) => {
            errors[field] = error.message;
          });
          setFieldErrors(errors);
        } else {
          setError(error.message);
        }
      } else {
        setError('Une erreur inattendue est survenue');
      }
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
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                />
              </svg>
            </div>
          </div>
          <CardTitle className='text-2xl font-bold text-center text-gray-800'>
            Créer un compte
          </CardTitle>
          <p className='text-sm text-center text-gray-500'>
            Remplissez le formulaire pour créer votre compte
          </p>
        </CardHeader>
        <CardContent className='px-4 sm:px-6 py-4'>
          <form
            className='space-y-4'
            onSubmit={handleSubmit}
          >
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
                  htmlFor='login'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Nom d'utilisateur
                </label>
                <Input
                  id='login'
                  name='login'
                  type='text'
                  required
                  value={formData.login}
                  onChange={handleChange}
                  className={`w-full transition duration-200 border-gray-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 ${
                    fieldErrors.login ? 'border-red-500' : ''
                  }`}
                />
                {fieldErrors.login && (
                  <p className='mt-1 text-sm text-red-600'>{fieldErrors.login}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Adresse email
                </label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full transition duration-200 border-gray-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 ${
                    fieldErrors.email ? 'border-red-500' : ''
                  }`}
                />
                {fieldErrors.email && (
                  <p className='mt-1 text-sm text-red-600'>{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Mot de passe
                </label>
                <Input
                  id='password'
                  name='password'
                  type='password'
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full transition duration-200 border-gray-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 ${
                    fieldErrors.password ? 'border-red-500' : ''
                  }`}
                />
                {fieldErrors.password && (
                  <p className='mt-1 text-sm text-red-600'>{fieldErrors.password}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor='confirm_password'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Confirmer le mot de passe
                </label>
                <Input
                  id='confirm_password'
                  name='confirm_password'
                  type='password'
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`w-full transition duration-200 border-gray-300 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 ${
                    fieldErrors.confirm_password ? 'border-red-500' : ''
                  }`}
                />
                {fieldErrors.confirm_password && (
                  <p className='mt-1 text-sm text-red-600'>{fieldErrors.confirm_password}</p>
                )}
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
                  Création en cours...
                </>
              ) : (
                'Créer un compte'
              )}
            </Button>
            <div className='text-center text-sm mt-4'>
              <span className='text-gray-600'>Déjà un compte ? </span>
              <Link
                href='/login'
                className='text-primary hover:underline font-medium'
              >
                Se connecter
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
