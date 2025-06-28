'use client';

import { TableCell } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Power, Trash, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { disableUser, enableUser, deleteUser, promoteToAdmin } from '@/app/services/users';
import { useSession } from 'next-auth/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmationDialog } from '@/app/ui/dashboard/dialogs/confirmation-dialog';

const UserAction = {
  DISABLE: 'disable',
  ENABLE: 'enable',
  DELETE: 'delete',
  PROMOTE: 'promote',
} as const;

type UserAction = typeof UserAction[keyof typeof UserAction];

interface UserActionsProps {
  userId: string;
  isAdmin: boolean;
  isDisabled?: boolean;
  isDeleted?: boolean;
  loadUsers: () => void;
}

export const UserActions: React.FC<UserActionsProps> = ({
  userId,
  isAdmin,
  isDisabled = false,
  isDeleted = false,
  loadUsers,
}) => {
  const { data: session } = useSession();
  const initialLoadingState = {
    [UserAction.DISABLE]: false,
    [UserAction.ENABLE]: false,
    [UserAction.DELETE]: false,
    [UserAction.PROMOTE]: false,
  } as const;

  const [isLoading, setIsLoading] = useState<Record<UserAction, boolean>>(initialLoadingState);

  const handleAction = async (action: UserAction, userId: string) => {
    try {
      setIsLoading(prev => ({ ...prev, [action]: true }));

      switch (action) {
        case UserAction.DISABLE:
          await disableUser(userId, session?.accessToken);
          setIsDisableDialogOpen(false);
          loadUsers();
          break;
        case UserAction.ENABLE:
          await enableUser(userId, session?.accessToken);
          setIsDisableDialogOpen(false);
          loadUsers();
          break;
        case UserAction.DELETE:
          await deleteUser(userId, session?.accessToken);
          setIsDeleteDialogOpen(false);
          loadUsers();
          break;
        case UserAction.PROMOTE:
          await promoteToAdmin(userId, session?.accessToken);
          setIsPromoteToAdminDialogOpen(false);
          loadUsers();
          break;
      }
    } catch (error) {
      console.error(`Error during ${action} user:`, error);
      throw error;
    } finally {
      setIsLoading(prev => ({ ...prev, [action]: false }));
    }
  };
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPromoteToAdminDialogOpen, setIsPromoteToAdminDialogOpen] = useState(false);
  const isDisabledOrAdmin = isDeleted || isAdmin;
  if (isDisabledOrAdmin) {
    return (
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant='ghost'
                  className='h-8 w-8 p-0'
                  disabled={isDisabledOrAdmin}
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isAdmin && <p>Cet utilisateur est un administrateur</p>}
              {isDeleted && <p>Cet utilisateur est supprimé</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    );
  }

  return (
    <TableCell>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='h-8 w-8 p-0'
                disabled={isDeleted}
              >
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            {!isDeleted && (
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onClick={() => setIsPromoteToAdminDialogOpen(true)}
                  className='text-blue-600 flex items-center'
                  disabled={isLoading.promote}
                >
                  <UserPlus className='mr-2 h-4 w-4' />
                  Promouvoir administrateur
                </DropdownMenuItem>
                {isDisabled ? (
                  <DropdownMenuItem
                    className='text-green-600 flex items-center'
                    onClick={() => setIsDisableDialogOpen(true)}
                    disabled={isLoading.enable}
                  >
                    <Power className='mr-2 h-4 w-4' />
                    Activer
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className='text-orange-600 flex items-center'
                    onClick={() => setIsDisableDialogOpen(true)}
                    disabled={isLoading.disable}
                  >
                    <Power className='mr-2 h-4 w-4' />
                    Désactiver
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className='text-red-600 flex items-center'
                  disabled={isLoading.delete}
                >
                  <Trash className='mr-2 h-4 w-4' />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>

        {/* Dialogs */}
        {isDisabled ? (
          <ConfirmationDialog
            open={isDisableDialogOpen}
            onOpenChange={setIsDisableDialogOpen}
            title="Activer l'utilisateur"
            description='Êtes-vous sûr de vouloir réactiver cet utilisateur ?'
            onConfirm={() => handleAction(UserAction.ENABLE, userId)}
            confirmText="Activer"
          />
        ) : (
          <ConfirmationDialog
            open={isDisableDialogOpen}
            onOpenChange={setIsDisableDialogOpen}
            title="Désactiver l'utilisateur"
            description='Êtes-vous sûr de vouloir désactiver cet utilisateur ?'
            onConfirm={() => handleAction(UserAction.DISABLE, userId)}
            confirmText="Désactiver"
          />
        )}

        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Supprimer l'utilisateur"
          description='Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.'
          onConfirm={() => handleAction(UserAction.DELETE, userId)}
          variant='destructive'
          confirmText='Supprimer'
        />


        <ConfirmationDialog
          open={isPromoteToAdminDialogOpen}
          onOpenChange={setIsPromoteToAdminDialogOpen}
          title='Promouvoir en administrateur'
          description='Êtes-vous sûr de vouloir promouvoir cet utilisateur en administrateur ?'
          onConfirm={() => handleAction(UserAction.PROMOTE, userId)}
          confirmText='Promouvoir'
        />

      </div>
    </TableCell>
  );
};
