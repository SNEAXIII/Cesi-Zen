import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import SideNavBar from '@/app/ui/left-nav-bar/sidenav';
import { Providers } from './providers';

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang='fr'>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className='flex h-screen flex-col md:flex-row md:overflow-hidden'>
            <div className='w-full flex-none md:w-64'>
              <SideNavBar />
            </div>
            <div className='grow p-6 md:overflow-y-auto md:p-12'>{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
