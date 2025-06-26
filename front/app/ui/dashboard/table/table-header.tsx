import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DropdownRadioMenu from '@/app/ui/dashboard/pagination/dropdown-radio-menu';
import React from 'react';

export const possibleStatus = [
  { value: 'all', label: 'Tous' },
  { value: 'enabled', label: 'Activé' },
  { value: 'disabled', label: 'Désactivé' },
  { value: 'deleted', label: 'Supprimé' },
];
export const possibleRoles = [
  { value: 'all', label: 'Tous' },
  { value: 'user', label: 'user' },
  { value: 'admin', label: 'admin' },
];

interface StatusSelectorProps {
  status: string;
  onStatusChange: (value: string) => void;
}

interface RoleSelectorProps {
  role: string;
  onRoleChange: (value: string) => void;
}

export type AllSelectorProps = StatusSelectorProps & RoleSelectorProps;

export default function TableHeaderUsers({
  status,
  onStatusChange,
  role,
  onRoleChange,
}: AllSelectorProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Login</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>
          <DropdownRadioMenu
            labelButton={'Rôle'}
            labelDescription={'Sélectionnez un rôle'}
            possibleValues={possibleRoles}
            selectedValue={role}
            setValue={onRoleChange}
          />
        </TableHead>
        <TableHead>Création</TableHead>
        <TableHead>Dernière connexion</TableHead>
        <TableHead>
          <DropdownRadioMenu
            labelButton={'Status'}
            labelDescription={"Nombre d'utilisateurs par page"}
            possibleValues={possibleStatus}
            selectedValue={status}
            setValue={onStatusChange}
          />
        </TableHead>
        <TableHead className='w-[50px]'></TableHead>
      </TableRow>
    </TableHeader>
  );
}
