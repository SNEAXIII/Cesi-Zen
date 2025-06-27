import Image from 'next/image';

export default function MainCesiZenLogo() {
  return (
    <div
      className='flex items-center gap-4 leading-none text-white'
      aria-label='Cesi Zen Logo'
    >
      <Image
        src='/logos/main_logo.png'
        alt='Logo Cesi Zen'
        width={48}
        height={48}
      />
      <p className='text-xl font-semibold md:text-2xl'>Cesi Zen</p>
    </div>
  );
}
