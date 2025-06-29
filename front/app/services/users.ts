import { possibleRoles, possibleStatus } from '@/app/ui/dashboard/table/table-header';
import { getHeaders } from '@/app/lib/utils';

export interface User {
  login: string;
  email: string;
  role: string;
  id: string;
  created_at: string;
  last_login_date: string | null;
  disabled_at: string | null;
  deleted_at: string | null;
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

export interface DeleteAccountRequest {
  password: string;
}

export interface ResetUserPasswordRequest {
  password: string;
  confirm_password: string;
  old_password: string;
}
interface ApiError {
  detail?: string;
  message?: string;
  statusCode?: number;
}
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
    const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin/users?page=${page}&size=${size}${query_status}${query_role}`;
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

      const errorMessage = errorData.message ?? errorData.message ?? 'Erreur inconnue';
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

export const registerUser = async (formData: RegisterUserRequest): Promise<true> => {
  const body = JSON.stringify({
    login: formData.login,
    email: formData.email,
    password: formData.password,
    confirm_password: formData.confirm_password,
  });
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body,
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      message: "Erreur lors de l'inscription",
      errors: {},
    }));

    const error = new Error(errorData.message ?? "Erreur lors de l'inscription") as Error & {
      validationErrors?: ValidationErrors;
    };
    error.validationErrors = errorData.errors;
    throw error;
  }
  return true;
};
export const deleteAccount = async (password: string, token?: string): Promise<true> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/delete`, {
      method: 'DELETE',
      headers: getHeaders(token),
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({}));
      throw new Error(errorData.message ?? 'Erreur lors de la suppression du compte');
    }

    return true;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

export const disableUser = async (userId: string, token?: string): Promise<true> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin/users/disable/${userId}`,
    {
      method: 'PATCH',
      headers: getHeaders(token),
    }
  );

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? "Erreur lors de la désactivation de l'utilisateur");
  }

  return true;
};

export const enableUser = async (userId: string, token?: string): Promise<true> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin/users/enable/${userId}`,
    {
      method: 'PATCH',
      headers: getHeaders(token),
    }
  );

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? "Erreur lors de la réactivation de l'utilisateur");
  }

  return true;
};

export const deleteUser = async (userId: string, token?: string): Promise<true> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin/users/delete/${userId}`,
    {
      method: 'DELETE',
      headers: getHeaders(token),
    }
  );

  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? "Erreur lors de la suppression de l'utilisateur");
  }

  return true;
};

export const promoteToAdmin = async (userId: string, token?: string): Promise<true> => {
  const body = JSON.stringify({
    user_uuid_to_promote: userId,
  });
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin/users/promote/${userId}`,
    {
      method: 'PATCH',
      headers: getHeaders(token),
      body,
    }
  );

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      message: 'Erreur lors de la promotion en administrateur',
      errors: {},
    }));

    const error = new Error(
      errorData.message ?? 'Erreur lors de la promotion en administrateur'
    ) as Error & { validationErrors?: ValidationErrors };
    error.validationErrors = errorData.errors;
    throw error;
  }
  return true;
};

export const resetUserPassword = async (
  resetUserPasswordRequest: ResetUserPasswordRequest,
  token?: string
): Promise<true> => {
  const body = JSON.stringify({
    password: resetUserPasswordRequest.password,
    confirm_password: resetUserPasswordRequest.confirm_password,
    old_password: resetUserPasswordRequest.old_password,
  });
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/reset-password`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body,
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      message: "Erreur lors de la réinitialisation du mot de passe",
      errors: {},
    }));
    const error = new Error(errorData.message) as Error & {
      validationErrors?: ValidationErrors;
    };
    error.validationErrors = errorData.errors;
    throw error;
  }
  return true;
};
