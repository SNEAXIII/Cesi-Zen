import { getHeaders } from '@/app/lib/utils';

interface ArticleData {
  title: string;
  content: string;
  category: string | number;
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/articles/${articleId}`, {
    method: 'DELETE',
    headers,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Erreur lors de la suppression de l'article");
  }
  return true;
}

export async function getArticle(articleId: string | number) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/articles/${articleId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error ?? "Erreur lors de la récupération de l'article");
  }

  return await response.json();
}

export async function getAllArticles() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/articles`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? 'Erreur lors de la récupération des articles');
  }

  return await response.json();
}
