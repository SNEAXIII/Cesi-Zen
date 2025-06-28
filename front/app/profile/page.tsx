'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';

export default function ProfilePage() {
  const pathname = usePathname();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect(`/login?callbackUrl=${pathname}`);
    },
  });

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
          
          {/* Section de suppression de compte */}
          <div className='border-t border-red-200 pt-6'>
            <h2 className='text-lg font-semibold mb-4 text-red-700'>Zone de danger</h2>
            <div className='bg-red-50 p-4 rounded-md border border-red-200'>
              <h3 className='font-medium text-red-800'>Supprimer mon compte</h3>
              <p className='text-sm text-red-600 mt-1 mb-3'>
                Cette action est irréversible. Toutes vos données seront définitivement supprimées.
              </p>
              <button
                onClick={() => {
                  // TODO: Implémenter la logique de suppression de compte
                  console.log('Suppression du compte demandée');
                }}
                className='inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200'
              >
                <svg className='-ml-1 mr-2 h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                </svg>
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
