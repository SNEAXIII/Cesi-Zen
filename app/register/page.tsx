'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader } from 'lucide-react';
import styles from '@/app/ui/form.module.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { registerUser } from '../services/users';
import { MdErrorOutline } from 'react-icons/md';
import { BiUserPlus } from 'react-icons/bi';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const inputErrorClass = 'border-red-500';
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
    setFieldErrors({});

    try {
      await registerUser(formData);
      router.push('/login?registered=true');
    } catch (err) {
      if (err instanceof Error) {
        const error = err as Error & { validationErrors?: Record<string, { message: string }> };

        if (error.validationErrors) {
          // Convertir les erreurs de validation en un format plus simple pour l'affichage
          const errors: Record<string, string> = {};
          Object.entries(error.validationErrors).forEach(([field, error]) => {
            console.log(field, error);
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
            <BiUserPlus className="w-12 h-12"/>
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
                  <MdErrorOutline className='mr-1' />
                  Erreur
                </AlertTitle>
                <AlertDescription className='mt-1'>{error}</AlertDescription>
              </Alert>
            )}
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='login'
                  className={styles.labelBase}
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
                  className={`${styles.inputBase} ${fieldErrors.login ? inputErrorClass : ''}`}
                />
                {fieldErrors.login && (
                  <p className='mt-1 text-sm text-red-600'>{fieldErrors.login}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor='email'
                  className={styles.labelBase}
                >
                  Adresse email
                </label>
                <Input
                  id='email'
                  name='email'
                  type='text'
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.inputBase} ${fieldErrors.email ? inputErrorClass : ''}`}
                />
                {fieldErrors.email && (
                  <p className='mt-1 text-sm text-red-600'>{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor='password'
                  className={styles.labelBase}
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
                  className={`${styles.inputBase} ${fieldErrors.password ? inputErrorClass : ''}`}
                />
                {fieldErrors.password && (
                  <p className='mt-1 text-sm text-red-600'>{fieldErrors.password}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor='confirm_password'
                  className={styles.labelBase}
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
                  className={`${styles.inputBase} ${fieldErrors.confirm_password ? inputErrorClass : ''}`}
                />
                {fieldErrors.confirm_password && (
                  <p className='mt-1 text-sm text-red-600'>{fieldErrors.confirm_password}</p>
                )}
              </div>
            </div>
            <Button
              type='submit'
              className={styles.buttonBase}
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
