'use client';
import { MdOutlineArticle, MdOutlineAdminPanelSettings, MdPersonOutline, MdOutlineAir } from 'react-icons/md';
import { IoHomeOutline } from 'react-icons/io5';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import clsx from 'clsx';

export enum Role {
  all = 'all',
  user = 'user',
  admin = 'admin',
}
const roleHierarchy: Record<Role, Role[]> = {
  [Role.all]: [Role.all],
  [Role.user]: [Role.all, Role.user],
  [Role.admin]: [Role.all, Role.user, Role.admin],
};
interface NavLinksProps {
  userRole: Role;
}

export default function NavLinks({ userRole }: Readonly<NavLinksProps>) {
  const pathname = usePathname();

  const links = [
    { name: 'Accueil', href: '/', icon: IoHomeOutline, role: Role.all },
    { name: 'Articles', href: '/articles', icon: MdOutlineArticle, role: Role.all },
    { name: 'Respiration', href: '/breathing', icon: MdOutlineAir, role: Role.all },
    { name: 'Mon Profil', href: '/profile', icon: MdPersonOutline, role: Role.user },
    {
      name: 'Administration',
      href: '/dashboard',
      icon: MdOutlineAdminPanelSettings,
      role: Role.admin,
    },
  ];

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        if (!roleHierarchy[userRole]?.includes(link.role)) {
          return null;
        }
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname.startsWith(link.href) && link.href !== '/' || pathname === link.href,
              }
            )}
          >
            <LinkIcon
              className='w-6'
              size={70}
            />
            <p className='hidden md:block'>{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
