import { getHeaders } from '@/app/lib/utils';

interface ArticleData {
  title: string;
  content: string;
  category: string | number;
}
export interface Article {
  id: number;
  title: string;
  id_category: number;
  creator: string;
  category: string;
  content: string;
  created_at: string;
}

export interface ArticlesResponse {
  articles: Article[];
  count: number;
}
export async function createArticle(articleData: ArticleData, token?: string) {
  const body = JSON.stringify({
    title: articleData.title,
    content: articleData.content,
    category: Number(articleData.category),
  });
  const headers = getHeaders(token);
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin/articles`, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Erreur lors de la création de l'article");
  }

  return await response.json();
}

export async function deleteArticle(articleId: string | number, token?: string) {
  const headers = getHeaders(token);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin/articles/${articleId}`,
    {
      method: 'DELETE',
      headers,
    }
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Erreur lors de la suppression de l'article");
  }
  return true;
}

export async function getArticle(articleId: string | number): Promise<Article> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/articles/${articleId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error ?? "Erreur lors de la récupération de l'article");
  }

  return await response.json();
}

export async function getAllArticles(categoryId?: number): Promise<ArticlesResponse> {
  const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/articles`);

  if (categoryId) {
    url.searchParams.append('category_id', categoryId.toString());
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? 'Erreur lors de la récupération des articles');
  }
  
  return await response.json();
}
