import { getSession } from 'next-auth/react';

interface ArticleData {
  title: string;
  content: string;
  category: string | number;
}

export async function createArticle(articleData: ArticleData) {
  const session = await getSession();
  const formData = new FormData();

  Object.entries(articleData).forEach(([key, value]) => {
    formData.append(key, value.toString());
  });

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/articles`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? "Erreur lors de la création de l'article");
  }

  return await response.json();
}

export async function deleteArticle(articleId: string | number) {
  const session = await getSession();
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/articles/${articleId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      'Content-Type': 'application/json',
    },
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
    throw new Error(error.message ?? "Erreur lors de la récupération de l'article");
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
