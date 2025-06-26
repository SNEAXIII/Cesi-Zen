import React from 'react';
import { User } from '@/app/services/users';
import { Table, TableBody } from '@/components/ui/table';
import { UserRow } from '@/app/ui/dashboard/table/user-row';
import TableHeaderUsers, { AllSelectorProps } from '@/app/ui/dashboard/table/table-header';

interface RenderUserDashboardProps {
  users: User[];
  onDisable: (userId: string) => void;
  onEnable: (userId: string) => void;
  onDelete: (userId: string) => void;
}

export default function RenderUserDashboard({
  users,
  status,
  onStatusChange,
  role,
  onRoleChange,
  onDisable,
  onEnable,
  onDelete,
}: RenderUserDashboardProps & AllSelectorProps) {
  return (
    <div className='container mx-auto py-6'>
      <Table className={'table-auto w-full'}>
        <TableHeaderUsers
          role={role}
          onRoleChange={onRoleChange}
          status={status}
          onStatusChange={onStatusChange}
        />
        <TableBody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onDisable={onDisable}
              onEnable={onEnable}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
      {users.length === 0 && (
        <div className={'mt-5 flex justify-center items-center w-full h-full'}>
          <p>Aucun utilisateurs trouvés</p>
        </div>
      )}
    </div>
  );
}
