'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteAccount, resetUserPassword } from '@/app/services/users';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from 'lucide-react';
import { LuKeyRound, LuTrash2 } from 'react-icons/lu';

export default function ProfilePage() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect(`/login?callbackUrl=${pathname}`);
    },
  });

  const handleDeleteAccount = async () => {
    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      await deleteAccount(password, session?.accessToken);
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la suppression du compte'
      );
      setIsDeleting(false);
    }
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleResetPassword = async () => {
    // Réinitialiser les erreurs
    setError('');
    setFieldErrors({});

    // Validation côté client
    if (!oldPassword || !password || !confirmNewPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsResetting(true);
    setSuccess('');

    try {
      await resetUserPassword(
        {
          old_password: oldPassword,
          password: password,
          confirm_password: confirmNewPassword,
        },
        session?.accessToken
      );

      setSuccess('Votre mot de passe a été mis à jour avec succès');
      setPassword('');
      setOldPassword('');
      setConfirmNewPassword('');
      setIsResetDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);

      if (error instanceof Error) {
        const apiError = error as {
          message?: string;
          validationErrors?: Record<string, { message: string }>;
        };

        if (apiError.validationErrors) {
          const errors: Record<string, string> = {};
          Object.entries(apiError.validationErrors).forEach(([field, error]) => {
            errors[field] = error?.message || 'Erreur de validation';
          });

          setFieldErrors(errors);
          setError(apiError.message || 'Des erreurs de validation sont présentes');
          return;
        }
      }

      // Gestion des autres types d'erreurs
      setError(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors de la réinitialisation du mot de passe'
      );
    } finally {
      setIsResetting(false);
    }
  };

  if (status === 'loading') {
    return <div className='flex justify-center items-center h-full'>Chargement...</div>;
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-md p-6'>
        <h1 className='text-2xl font-bold mb-6 text-gray-800'>Mon Profil</h1>

        <div className='space-y-6'>
          <div className='border-b pb-6'>
            <h2 className='text-lg font-semibold mb-4 text-gray-700'>Informations du compte</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <p className='text-sm font-medium text-gray-500'>Nom d'utilisateur</p>
                <p className='mt-1 text-gray-800'>{session?.user?.name || 'Non défini'}</p>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-500'>Email</p>
                <p className='mt-1 text-gray-800'>{session?.user?.email || 'Non défini'}</p>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-500'>Rôle</p>
                <p className='mt-1 text-gray-800 capitalize'>
                  {session?.user?.role ? (
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      {session.user.role.toLowerCase()}
                    </span>
                  ) : (
                    'Non défini'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className='flex justify-end'>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              Se déconnecter
            </button>
          </div>

          {/* Section de sécurité */}
          <div className='border-t border-gray-200 pt-6'>
            <h2 className='text-lg font-semibold mb-4 text-gray-700'>Sécurité</h2>
            <div className='bg-blue-50 p-4 rounded-md border border-blue-200 mb-6'>
              <h3 className='font-medium text-blue-800'>Réinitialiser le mot de passe</h3>
              <p className='text-sm text-blue-600 mt-1 mb-3'>
                Vous pouvez réinitialiser votre mot de passe en suivant les instructions ci-dessous.
              </p>

              <AlertDialog
                open={isResetDialogOpen}
                onOpenChange={(open) => {
                  if (!isResetting) {
                    setIsResetDialogOpen(open);
                    if (!open) {
                      setError('');
                      setSuccess('');
                      setPassword('');
                      setOldPassword('');
                      setConfirmNewPassword('');
                    }
                  }
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant='outline'
                    className='text-blue-700 border-blue-300 hover:bg-blue-50'
                  >
                    <LuKeyRound className='-ml-1 mr-2 h-4 w-4' />
                    Changer mon mot de passe
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className='max-w-md'>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Changer le mot de passe</AlertDialogTitle>
                    <div className='space-y-4 py-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='current-password'>Mot de passe actuel</Label>
                        <Input
                          id='current-password'
                          type='password'
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder='Entrez votre mot de passe actuel'
                          className={fieldErrors.old_password ? 'border-red-500' : ''}
                          disabled={isResetting}
                        />
                        {fieldErrors.old_password && (
                          <p className='text-sm text-red-600 mt-1'>{fieldErrors.old_password}</p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='new-password'>Nouveau mot de passe</Label>
                        <Input
                          id='new-password'
                          type='password'
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder='Entrez votre nouveau mot de passe'
                          className={fieldErrors.password ? 'border-red-500' : ''}
                          disabled={isResetting}
                        />
                        {fieldErrors.password && (
                          <p className='text-sm text-red-600 mt-1'>{fieldErrors.password}</p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='confirm-password'>Confirmez le nouveau mot de passe</Label>
                        <Input
                          id='confirm-password'
                          type='password'
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder='Confirmez votre nouveau mot de passe'
                          className={fieldErrors.confirm_password ? 'border-red-500' : ''}
                          disabled={isResetting}
                        />
                        {fieldErrors.confirm_password && (
                          <p className='text-sm text-red-600 mt-1'>
                            {fieldErrors.confirm_password}
                          </p>
                        )}
                      </div>

                      {error && !Object.keys(fieldErrors).length && (
                        <div className='p-3 text-sm text-red-700 bg-red-100 rounded-md'>
                          {error}
                        </div>
                      )}
                    </div>
                  </AlertDialogHeader>
                  <AlertDialogFooter className='sm:flex sm:flex-row-reverse sm:justify-between'>
                    <AlertDialogAction
                      onClickCapture={handleResetPassword}
                      disabled={isResetting || !oldPassword || !password || !confirmNewPassword}
                      className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    >
                      {isResetting ? (
                        <>
                          <Loader className='w-5 h-5 mr-2 animate-spin' />
                          Enregistrement...
                        </>
                      ) : (
                        'Enregistrer les modifications'
                      )}
                    </AlertDialogAction>
                    <AlertDialogCancel
                      disabled={isResetting}
                      className='w-full sm:w-auto mt-2 sm:mt-0'
                      onClick={() => {
                        setError('');
                        setSuccess('');
                        setPassword('');
                        setOldPassword('');
                        setConfirmNewPassword('');
                      }}
                    >
                      Annuler
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {success && <p className='mt-2 text-sm text-green-600'>{success}</p>}
            </div>
          </div>

          {/* Section de suppression de compte */}
          <div className='border-t border-red-200 pt-6'>
            <h2 className='text-lg font-semibold mb-4 text-red-700'>Zone de danger</h2>
            <div className='bg-red-50 p-4 rounded-md border border-red-200'>
              <h3 className='font-medium text-red-800'>Supprimer mon compte</h3>
              <p className='text-sm text-red-600 mt-1 mb-3'>
                Cette action est irréversible. Toutes vos données seront définitivement supprimées.
              </p>

              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                  if (!isDeleting) {
                    setIsDeleteDialogOpen(open);
                    if (!open) {
                      setPassword('');
                      setError('');
                      setSuccess('');
                    }
                  }
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant='destructive'
                    className='inline-flex items-center'
                  >
                    <LuTrash2 className='-ml-1 mr-2 h-4 w-4' />
                    Supprimer mon compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action ne peut pas être annulée. Cela supprimera définitivement votre
                      compte.
                      <div className='mt-4 space-y-2'>
                        <Label htmlFor='password'>Confirmez votre mot de passe</Label>
                        <Input
                          id='password'
                          type='password'
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder='Votre mot de passe'
                          className={error ? 'border-red-500' : ''}
                        />
                        {error && <p className='text-sm text-red-600'>{error}</p>}
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      disabled={isDeleting}
                      onClick={(e) => {
                        if (!isDeleting) {
                          setPassword('');
                          setError('');
                        } else {
                          e.preventDefault();
                        }
                      }}
                    >
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClickCapture={handleDeleteAccount}
                      disabled={isDeleting || !password}
                      className='bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    >
                      {isDeleting ? (
                        <>
                          <Loader className='w-5 h-5 mr-2 animate-spin' />
                          Suppression...
                        </>
                      ) : (
                        'Supprimer définitivement'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
