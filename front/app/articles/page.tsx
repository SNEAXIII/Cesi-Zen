'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { getAllArticles, Article, deleteArticle } from '@/app/services/article';
import { getAllCategories } from '@/app/services/category';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { formatDateInFrenchLong } from '@/app/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { DeleteArticleDialog } from '@/components/articles/delete-article-dialog';
import ArticleCreatorBadge from '../ui/users/bubble';

type Category = {
  id: number;
  label: string;
};

export default function ArticlesPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const data = await getAllArticles(
        selectedCategory && selectedCategory !== 'all' ? Number(selectedCategory) : undefined
      );
      setArticles(data.articles);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      toast.error(`Erreur lors du chargement des articles: ${errorMessage}`);
      console.error('Erreur chargement articles:', err);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        toast.error(`Erreur lors du chargement des catégories: ${errorMessage}`);
        console.error('Erreur chargement catégories:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const resetFilter = () => {
    setSelectedCategory('all');
  };

  const handleDeleteArticle = async (id: number) => {
    try {
      setIsDeleting(id);
      await deleteArticle(id, session?.accessToken);
      fetchArticles();
      toast.success('Article supprimé avec succès');
    } catch (err) {
      console.error("Erreur lors de la suppression de l'article:", err);
      toast.error(`Erreur lors de la suppression de l'article: ${(err as Error).message}`);
      throw err; // Important pour que le dialogue puisse gérer l'erreur
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>Articles</h1>
            <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto'>
              <div className='flex-1 sm:w-64'>
                <Select
                  onValueChange={handleCategoryChange}
                  value={selectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Filtrer par catégorie' />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <div className='flex justify-center p-2'>
                        <span className='text-sm text-gray-500'>Chargement...</span>
                      </div>
                    ) : (
                      <>
                        <SelectItem value='all'>Toutes les catégories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.label}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedCategory && (
                <Button
                  variant='outline'
                  onClick={resetFilter}
                >
                  Réinitialiser
                </Button>
              )}
              {session?.user.role === 'admin' && (
                <Link
                  href='/articles/create'
                  className='inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  Nouvel article
                </Link>
              )}
            </div>
          </div>
          {error && (
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
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
                    <p className='text-sm text-red-700'>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {articles.length === 0 && !error ? (
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
              {session?.user.role === 'admin' && (
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
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className='h-full flex flex-col hover:shadow-lg transition-shadow'
                >
                  <CardHeader className='pb-3 relative'>
                    <div className='flex justify-between items-start'>
                      <div className='flex items-center gap-2'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          {article.category}
                        </span>
                        {session?.user.role === 'admin' && (
                          <DeleteArticleDialog
                            isDeleting={isDeleting === article.id}
                            onConfirm={() => handleDeleteArticle(article.id)}
                          />
                        )}
                      </div>
                      <span className='text-xs text-muted-foreground'>
                        {formatDateInFrenchLong(article.created_at)}
                      </span>
                    </div>
                    <CardTitle className='mt-8'>
                      <Link
                        href={`/articles/${article.id}`}
                        className='hover:underline hover:text-primary'
                      >
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='flex-1 flex flex-col justify-end'>
                    <div className='flex items-center mt-2 pt-2 border-t'>
                      <div className='flex-shrink-0 mr-3'>
                      <ArticleCreatorBadge creator={article.creator} />
                      </div>
                      <div>
                        <p className='text-sm font-medium'>{article.creator}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
