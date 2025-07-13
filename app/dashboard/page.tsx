'use client';
import React, { useEffect, useState } from 'react';
import { getUsers, promoteToAdmin, User } from '@/app/services/users';
import Loading from '@/app/dashboard/loading';
import RenderUserDashboard from '@/app/ui/dashboard/table/render-user-dashboard';
import PaginationControls from '@/app/ui/dashboard/pagination/pagination-controls';
import { possibleRoles, possibleStatus } from '@/app/ui/dashboard/table/table-header';
import { useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';

const BASE_CURRENT_PAGE = 1;
const BASE_TOTAL_PAGE = 1;
const BASE_USERS_PER_PAGE = 10;
const BASE_SELECTED_STATUS = possibleStatus[0].value;
const BASE_SELECTED_ROLE = possibleRoles[0].value;
export default function UsersPage() {
  const pathname = usePathname();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect(`/login?callbackUrl=${pathname}`);
    },
  });
  const [sessionReady, setSessionReady] = useState(false);

useEffect(() => {
  if (status === "authenticated") {
    setSessionReady(true);
  }
}, [status]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(BASE_CURRENT_PAGE);
  const [totalPage, setTotalPage] = useState(BASE_TOTAL_PAGE);
  const [usersPerPage, setUsersPerPage] = useState(BASE_USERS_PER_PAGE);
  const [selectedStatus, setSelectedStatus] = useState(BASE_SELECTED_STATUS);
  const [selectedRole, setSelectedRole] = useState(BASE_SELECTED_ROLE);
  const [canReset, setCanReset] = useState(false);
  const [fetchUsersError, setFetchUsersError] = useState('');

  const loadUsers = async () => {
    setCanReset(false);
    setFetchUsersError('');
    const token = session?.accessToken;
    if (!users) {
      setIsLoading(true);
    }
    try {
      const data = await getUsers(
        Math.max(currentPage, 1),
        usersPerPage,
        selectedStatus,
        selectedRole,
        token
      );
      setUsers(data.users);
      setCurrentPage(Math.min(currentPage, data.total_pages));
      setTotalPage(data.total_pages);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      let errorMessage: string;
      if ((error as Error & { status?: number }).status === 401) {
        errorMessage = 'Non autorisé';
      } else {
        errorMessage = 'Une erreur est survenue lors du chargement des utilisateurs';
      }
      setFetchUsersError(errorMessage);
    } finally {
      setIsLoading(false);
      setCanReset(
        !(
          usersPerPage === BASE_USERS_PER_PAGE &&
          selectedStatus === BASE_SELECTED_STATUS &&
          selectedRole === BASE_SELECTED_ROLE
        )
      );
    }
  };

  useEffect(() => {
    if (sessionReady) {
      loadUsers();
    }
  }, [sessionReady, currentPage, usersPerPage, selectedStatus, selectedRole]);

  function resetPagination() {
    setUsersPerPage(BASE_USERS_PER_PAGE);
    setSelectedStatus(BASE_SELECTED_STATUS);
    setSelectedRole(BASE_SELECTED_ROLE);
    setCurrentPage(BASE_CURRENT_PAGE);
  }

  function goToPage1() {
    setCurrentPage(1);
  }

  function handleRadioSetUsersPerPage(value: string) {
    setUsersPerPage(Number(value));
    goToPage1();
  }

  function handleRadioSetSelectedStatus(value: string) {
    setSelectedStatus(value);
    goToPage1();
  }

  function handleRadioSetSelectedRole(value: string) {
    setSelectedRole(value);
    goToPage1();
  }

  const handleNextPage = () => {
    setCurrentPage((page) => page + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((page) => Math.max(1, page - 1));
  };
  const handleFirstPage = () => {
    setCurrentPage((page) => 1);
  };
  const handleLastPage = () => {
    setCurrentPage((page) => totalPage);
  };

  return (
    <>
      <PaginationControls
        currentPage={currentPage}
        totalPage={totalPage}
        usersPerPage={usersPerPage}
        canReset={canReset}
        onUserPerPageChange={handleRadioSetUsersPerPage}
        onFirstPage={handleFirstPage}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onLastPage={handleLastPage}
        onResetPagination={resetPagination}
      />
      {isLoading ? (
        <Loading usersPerPage={usersPerPage} />
      ) : (
        <RenderUserDashboard
          users={users}
          role={selectedRole}
          status={selectedStatus}
          fetchUsersError={fetchUsersError}
          onRoleChange={handleRadioSetSelectedRole}
          onStatusChange={handleRadioSetSelectedStatus}
          loadUsers={loadUsers}
        />
      )}
    </>
  );
}
