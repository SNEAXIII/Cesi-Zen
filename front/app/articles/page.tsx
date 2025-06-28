'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

type Article = {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    image?: string;
  };
  createdAt: string;
  categories: string[];
  coverImage?: string;
};

export default function ArticlesPage() {
  const { data: session } = useSession();
  // Dans une application réelle, vous récupéreriez les articles depuis votre API
  const articles: Article[] = [];

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Articles</h1>
        {session && (
          <Link
            href='/articles/create'
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Nouvel article
          </Link>
        )}
      </div>

      {articles.length === 0 ? (
        <div className='text-center py-12'>
          <svg
            className='mx-auto h-12 w-12 text-gray-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
          <h3 className='mt-2 text-sm font-medium text-gray-900'>Aucun article</h3>
          <p className='mt-1 text-sm text-gray-500'>Commencez par créer un nouvel article.</p>
          {session && (
            <div className='mt-6'>
              <Link
                href='/articles/create'
                className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Nouvel article
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {articles.map((article) => (
            <article
              key={article.id}
              className='flex flex-col overflow-hidden rounded-lg shadow-lg'
            >
              {article.coverImage && (
                <div className='flex-shrink-0'>
                  <img
                    className='h-48 w-full object-cover'
                    src={article.coverImage}
                    alt=''
                  />
                </div>
              )}
              <div className='flex flex-1 flex-col justify-between bg-white p-6'>
                <div className='flex-1'>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {article.categories.map((category) => (
                      <span
                        key={category}
                        className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/articles/${article.id}`}
                    className='mt-2 block'
                  >
                    <h3 className='text-xl font-semibold text-gray-900'>{article.title}</h3>
                    <p className='mt-3 text-base text-gray-500'>{article.excerpt}</p>
                  </Link>
                </div>
                <div className='mt-6 flex items-center'>
                  <div className='flex-shrink-0'>
                    {article.author.image ? (
                      <img
                        className='h-10 w-10 rounded-full'
                        src={article.author.image}
                        alt={article.author.name}
                      />
                    ) : (
                      <span className='h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center'>
                        <span className='text-gray-500 text-lg'>
                          {article.author.name.charAt(0).toUpperCase()}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-gray-900'>{article.author.name}</p>
                    <div className='flex space-x-1 text-sm text-gray-500'>
                      <time dateTime={article.createdAt}>
                        {new Date(article.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
