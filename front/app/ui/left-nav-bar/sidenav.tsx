'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import MainCesiZenLogo from '@/app/ui/CesiZenLogo';
import { Button } from '@/components/ui/button';
import { VscSignIn, VscSignOut } from 'react-icons/vsc';
import NavLinks, { Role } from './nav-links';

export default function SideNavBar() {
  const { data: session } = useSession();
  const userRole: Role = session?.user.role as Role || Role.user;
  const router = useRouter();
  const buttonBaseClasses =
    'flex h-[48px] items-center justify-center gap-2 rounded-md p-3 text-sm font-medium transition md:justify-start md:p-2 md:px-3';
  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className='flex h-full flex-col px-3 py-4 md:px-2'>
      {/* Logo Section */}
      <Link
        href='/'
        className='mb-2 flex h-20 items-center rounded-md bg-blue-400 p-4 transition hover:bg-blue-500 w-full'
        aria-label='Accueil'
      >
        <div className='w-full'>
          <MainCesiZenLogo />
        </div>
      </Link>

      {/* Navigation Links Section */}
      <div className='flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2'>
        <NavLinks userRole={userRole} />
        <div
          className='hidden h-auto w-full grow rounded-md bg-gray-50 md:block'
          aria-hidden='true'
        ></div>

        {/* Session-specific Section */}
        {session ? (
          <Button
            type='button'
            onClick={handleSignOut}
            className={`${buttonBaseClasses} bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-600`}
            aria-label='Se déconnecter'
          >
            {/* TODO trouver un moyen de fix la taille versin mobile*/}
            <VscSignOut className='w-6 h-6' />
            <span className='hidden md:block'>Se déconnecter</span>
          </Button>
        ) : (
          <Link
            href='/login'
            className={`${buttonBaseClasses} bg-blue-400 text-white hover:bg-blue-500`}
            aria-label='Se connecter'
          >
            <VscSignIn className='w-6 h-6' />
            <span className='hidden md:block'>Se connecter</span>
          </Link>
        )}
      </div>
    </div>
  );
}
