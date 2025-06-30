export interface Exercise {
  id: number;
  name: string;
  duration_inspiration: number;
  duration_expiration: number;
  duration_apnea: number;
  number_cycles: number;
}
export interface ExercisesResponse {
  exercises: Exercise[];
}
export async function getExercises(): Promise<ExercisesResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/exercises/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erreur lors de la récupération des exercices');
    }

    const data = await response.json();
    const exercises = Array.isArray(data) ? data : (data.exercises || []);
    return { exercises };
  } catch (error) {
    console.error('Erreur dans getExercises:', error);
    return { exercises: [] };
  }
}
