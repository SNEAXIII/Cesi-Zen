import { TableRow } from '@/components/ui/table';
import { User } from '@/app/services/users';
import {
  RowUserCreatedAt,
  RowUserEmail,
  RowUserLastLoginDate,
  RowUserLogin,
  RowUserRole,
  UserStatusBadge,
} from '@/app/ui/dashboard/table/user-cells';
import { UserActions } from '@/app/ui/dashboard/actions/user-actions';

interface UserRowProps {
  user: User;
  onDisable: (userId: string) => void;
  onEnable: (userId: string) => void;
  onDelete: (userId: string) => void;
  onPromoteToAdmin: (userId: string) => void;
}

export function UserRow({ user, onDisable, onEnable, onDelete ,onPromoteToAdmin}: UserRowProps) {
  return (
    <TableRow>
      <RowUserLogin login={user.login} />
      <RowUserEmail email={user.email} />
      <RowUserRole role={user.role} />
      <RowUserCreatedAt created_at={user.created_at} />
      <RowUserLastLoginDate lastLoginDate={user.last_login_date} />
      <UserStatusBadge
        deleted_at={user.deleted_at}
        disabled_at={user.disabled_at}
      />
      <UserActions
        userId={user.id}
        isAdmin={user.role === 'admin'}
        isDisabled={user.disabled_at}
        isDeleted={user.deleted_at}
        onDisable={onDisable}
        onEnable={onEnable}
        onDelete={onDelete}
        onPromoteToAdmin={onPromoteToAdmin}
      />
    </TableRow>
  );
}
