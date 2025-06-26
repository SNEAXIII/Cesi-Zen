'use client';
import React, { useEffect, useState } from 'react';
import { getUsers, User } from '@/app/services/users';
import Loading from '@/app/dashboard/loading';
import RenderUserDashboard from '@/app/ui/dashboard/table/render-user-dashboard';
import PaginationControls from '@/app/ui/dashboard/pagination/pagination-controls';
import { possibleRoles, possibleStatus } from '@/app/ui/dashboard/table/table-header';
import { getSession } from 'next-auth/react';

const BASE_CURRENT_PAGE = 1;
const BASE_TOTAL_PAGE = 1;
const BASE_USERS_PER_PAGE = 10;
const BASE_SELECTED_STATUS = possibleStatus[0].value;
const BASE_SELECTED_ROLE = possibleRoles[0].value;
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(BASE_CURRENT_PAGE);
  const [totalPage, setTotalPage] = useState(BASE_TOTAL_PAGE);
  const [usersPerPage, setUsersPerPage] = useState(BASE_USERS_PER_PAGE);
  const [selectedStatus, setSelectedStatus] = useState(BASE_SELECTED_STATUS);
  const [selectedRole, setSelectedRole] = useState(BASE_SELECTED_ROLE);
  const [canReset, setCanReset] = useState(false);

  function resetPagination() {
    setCanReset(false);
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

  useEffect(() => {
    const loadUsers = async () => {
      const session = await getSession();
      const token = session?.accessToken;
      if (!canReset) {
        setCanReset(true);
      }
      if (!users) {
        setIsLoading(true);
        setCanReset(false);
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
        console.log(currentPage, totalPage);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, [currentPage, usersPerPage, selectedStatus, selectedRole]);
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
    }
  };

  const handleEnable = async (userId: string) => {
    try {
      console.log("Activation de l'utilisateur:", userId);
      // TODO: Implémenter l'action d'activation
    } catch (error) {
      console.error("Erreur lors de l'activation:", error);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      console.log("Suppression de l'utilisateur:", userId);
      // TODO: Implémenter l'action de suppression
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
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
          onRoleChange={handleRadioSetSelectedRole}
          status={selectedStatus}
          onStatusChange={handleRadioSetSelectedStatus}
          onDisable={handleDisable}
          onEnable={handleEnable}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
