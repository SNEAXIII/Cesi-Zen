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
        </div>
      </div>
    </div>
  );
}
