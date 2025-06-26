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

export interface RegisterUserRequest {
  login: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface ApiError {
  detail?: string;
  message?: string;
  statusCode?: number;
}
function getHeaders(token?: string): HeadersInit {
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
  return headers;
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
    const url = `http://localhost:8000/admin/users?page=${page}&size=${size}${query_status}${query_role}`;

    const headers = getHeaders(token);

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
interface ValidationError {
  type: string;
  message: string;
}

export interface ValidationErrors {
  [key: string]: ValidationError;
}

export interface ApiErrorResponse {
  message: string;
  errors: ValidationErrors;
}

export const registerUser = async (formData: RegisterUserRequest): Promise<true> => {
  const body = JSON.stringify({
    login: formData.login,
    email: formData.email,
    password: formData.password,
    confirm_password: formData.confirm_password,
  });
  const response = await fetch('http://localhost:8000/auth/register', {
    method: 'POST',
    headers: getHeaders(),
    body,
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      message: "Erreur lors de l'inscription",
      errors: {},
    }));
    
    const error = new Error(errorData.message || "Erreur lors de l'inscription") as Error & { validationErrors?: ValidationErrors };
    error.validationErrors = errorData.errors;
    throw error;
  }
  return true;
};
