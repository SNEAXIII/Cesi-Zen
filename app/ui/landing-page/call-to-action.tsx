'use client';

import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';

export default function CallToAction() {
  return (
    <section className='bg-white py-16'>
      <div className='max-w-7xl mx-auto px-6 lg:px-8 text-center'>
        <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6'>
          Prêt à commencer votre voyage vers le bien-être ?
        </h2>
        <p className='text-xl text-gray-500 max-w-3xl mx-auto mb-8'>
          Rejoignez notre communauté dès aujourd'hui et découvrez comment CesiZen peut vous aider à
          atteindre vos objectifs de bien-être.
        </p>
        <div className='flex justify-center'>
          <Button
            asChild
            size='lg'
            className='bg-indigo-600 hover:bg-indigo-700'
          >
            <Link href='/register'>
              Créer un compte gratuitement
              <ArrowRightIcon className='ml-2 h-5 w-5' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
