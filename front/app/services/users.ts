import { possibleRoles, possibleStatus } from '@/app/ui/dashboard/table/table-header';

export interface User {
  login: string;
  email: string;
  role: string;
  id: string;
  created_at: string;
  last_login_date: string | null;
  disabled_at: boolean;
  deleted_at: boolean;
}

export interface FetchUsersResponse {
  users: User[];
  total_users: number;
  total_pages: number;
  current_page: number;
}

interface ApiError {
  detail?: string;
  message?: string;
  statusCode?: number;
}

export const getUsers = async (
  page: number = 1,
  size: number = 10,
  status: string | null = null,
  role: string | null = null,
  token?: string
): Promise<FetchUsersResponse> => {
  try {
    const query_status = status && status !== possibleStatus[0].value ? `&status=${status}` : '';
    const query_role = role && role !== possibleRoles[0].value ? `&role=${role}` : '';
    const url = `http://127.0.0.1:8000/admin/users?page=${page}&size=${size}${query_status}${query_role}`;

    const headers: HeadersInit = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Using token for authorization');
    } else {
      console.warn('No token provided for authentication');
    }

    const response = await fetch(url, {
      headers,
      mode: 'cors',
    });

    if (!response.ok) {
      let errorData: ApiError = {};
      try {
        errorData = await response.json();
        console.error('API Error:', errorData);
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }

      const errorMessage = errorData.detail || errorData.message || 'Erreur inconnue';
      const error = new Error(`Erreur ${response.status}: ${errorMessage}`);
      (error as any).status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur dans getUsers:', error);
    throw error instanceof Error
      ? error
      : new Error('Une erreur inattendue est survenue lors de la récupération des utilisateurs');
  }
};
