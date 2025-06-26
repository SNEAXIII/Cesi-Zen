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

export const getUsers = async (
  page: number = 1,
  size: number = 10,
  status: string | null = null,
  role: string | null = null
): Promise<FetchUsersResponse> => {
  const query_status = status&&status != possibleStatus[0].value ? `&status=${status}` : '';
  const query_role = role &&role != possibleRoles[0].value ? `&role=${role}` : '';
  const url = `http://127.0.0.1:8000/admin/users?page=${page}&size=${size}${query_status}${query_role}`;
  const headers = {
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVc2VyIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzQ5OTA2Mjg4fQ.sIlESn-ge-7Z5D0lNu9BINDT6GCZVV0Au7x4xcsC0RU',
  };
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}error: ${response.body}`);
  }
  return response.json();
};
