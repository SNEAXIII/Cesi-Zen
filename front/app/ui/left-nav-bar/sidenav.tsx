'use client';

import Link from 'next/link';
import MainCesiZenLogo from '@/app/ui/CesiZenLogo';
import { IoIosPower } from 'react-icons/io';
import NavLinks from '@/app/ui/left-nav-bar/nav-links';

export default function SideNavBar() {
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
        <NavLinks />
        {/* Placeholder or additional content */}
        <div
          className='hidden h-auto w-full grow rounded-md bg-gray-50 md:block'
          aria-hidden='true'
        ></div>

        {/* Logout Section */}
        <form>
          <button
            type='button'
            className='flex h-[48px] w-full items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium text-gray-700 transition hover:bg-sky-100 hover:text-blue-600 md:justify-start md:p-2 md:px-3'
            onClick={() => {
              // TODO FAIRE LA DECO
              console.log('Déconnexion...');
            }}
            aria-label='Se déconnecter'
          >
            <IoIosPower className='w-6 h-6' />
            <span className='hidden md:block'>Se déconnecter</span>
          </button>
        </form>
      </div>
    </div>
  );
}
