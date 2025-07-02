'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateInFrenchLong } from '@/app/lib/utils';
import { Article, getArticle } from '@/app/services/articles';
import RichTextContent from '@/app/ui/html-viewer/RichTextContent';
import ArticleCreatorBadge from '@/app/ui/users/bubble';

export default function ArticlePage() {
  const router = useRouter();
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async (articleId: string) => {
      try {
        setIsLoading(true);
        const data = await getArticle(articleId);
        setArticle(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors du chargement de l'article"
        );
        console.error("Erreur lors de la récupération de l'article:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id && typeof id === 'string') {
      fetchArticle(id);
    } else if (Array.isArray(id) && id.length > 0) {
      fetchArticle(id[0]);
    } else {
      setError("ID d'article invalide");
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className='max-w-4xl mx-auto px-4 py-8'>
        <div className='bg-red-50 border-l-4 border-red-400 p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-red-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-red-700'>{error || 'Article non trouvé'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto px-4 py-8'>
      <Button
        variant='outline'
        onClick={() => router.back()}
        className='mb-6'
      >
        &larr; Retour
      </Button>

      <Card className='mb-6'>
        <CardHeader>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
            <div>
              <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2'>
                {article.category}
              </span>
              <CardTitle className='text-3xl font-bold'>{article.title}</CardTitle>
            </div>
            <div className='text-sm text-gray-500 whitespace-nowrap'>
              {formatDateInFrenchLong(article.created_at)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mt-4'>
            <RichTextContent
              content={article.content}
              className='text-gray-700'
            />
          </div>

          <div className='mt-8 pt-6 border-t border-gray-200'>
            <div className='flex items-center gap-2'>
              <ArticleCreatorBadge creator={article.creator} />
              <div>
                <p className='text-sm text-gray-500'>Auteur: {article.creator}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
