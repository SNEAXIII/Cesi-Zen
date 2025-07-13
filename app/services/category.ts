export interface Category {
  id: number;
  label: string;
}

export async function getAllCategories(): Promise<Category[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? 'Erreur lors de la récupération des catégories');
  }

  return await response.json();
}
