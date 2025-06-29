'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getAllArticles, Article } from '@/app/services/article';

export default function ArticlesPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getAllArticles();
        setArticles(data.articles);
      } catch (err) {
        setError('Erreur lors du chargement des articles');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='bg-red-50 border-l-4 border-red-400 p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {articles.map((article) => (
            <article
              key={article.id}
              className='flex flex-col h-full overflow-hidden rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-200'
            >
              <div className='p-6 flex-1 flex flex-col'>
                <div className='flex-1'>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-3'>
                    {article.category}
                  </span>
                  <Link href={`/articles/${article.id}`} className='block'>
                    <h3 className='text-xl font-semibold text-gray-900'>{article.title}</h3>
                  </Link>
                </div>
                <div className='mt-6 flex items-center'>
                  <div className='flex-shrink-0'>
                    <span className='sr-only'>{article.creator}</span>
                    <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center'>
                      <span className='text-blue-800 font-medium'>{article.creator.charAt(0)}</span>
                    </div>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-gray-900'>{article.creator}</p>
                    <div className='text-sm text-gray-500'>
                      Catégorie: {article.category}
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
