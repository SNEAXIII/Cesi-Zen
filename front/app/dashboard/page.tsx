'use client';
import React, { useEffect, useState } from 'react';
import { getUsers, promoteToAdmin, User } from '@/app/services/users';
import Loading from '@/app/dashboard/loading';
import RenderUserDashboard from '@/app/ui/dashboard/table/render-user-dashboard';
import PaginationControls from '@/app/ui/dashboard/pagination/pagination-controls';
import { possibleRoles, possibleStatus } from '@/app/ui/dashboard/table/table-header';
import { useSession } from 'next-auth/react';
import { redirect, useRouter, usePathname } from 'next/navigation';

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
  const router = useRouter();
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
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    loadUsers();
  }, [currentPage, usersPerPage, selectedStatus, selectedRole]);

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

  const handleDisable = async (userId: string) => {
    try {
      console.log("Désactivation de l'utilisateur:", userId);
      // TODO: Implémenter l'action de désactivation
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
    } finally {
      loadUsers();
    }
  };

  const handleEnable = async (userId: string) => {
    try {
      console.log("Activation de l'utilisateur:", userId);
      // TODO: Implémenter l'action d'activation
    } catch (error) {
      console.error("Erreur lors de l'activation:", error);
    } finally {
      loadUsers();
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      console.log("Suppression de l'utilisateur:", userId);
      // TODO: Implémenter l'action de suppression
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      loadUsers();
    }
  };
  const handlePromoteToAdmin = async (userId: string) => {
    try {
      const token = session?.accessToken;
      await promoteToAdmin(userId, token);
    } catch (error) {
      console.error('Erreur lors de la promotion en administrateur:', error);
    } finally {
      loadUsers();
    }
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
          onDisable={handleDisable}
          onEnable={handleEnable}
          onDelete={handleDelete}
          onPromoteToAdmin={handlePromoteToAdmin}
        />
      )}
    </>
  );
}
