'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Edit3,
  UserX,
  UserCheck,
  Mail,
  Trash2,
  Shield,
  User,
  Clock,
} from 'lucide-react';
import { UserWithShop } from '@/lib/types/settings/user-management';
import {
  useDeleteUser,
  useToggleUserStatus,
  useResendInvitation,
} from '@/hooks/settings/use-user-management';
import { UserEditRoleDialog } from './user-edit-role-dialog';

interface UserTableProps {
  users: UserWithShop[];
  currentUserId: string;
}

export function UserTable({ users, currentUserId }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<UserWithShop | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: UserWithShop | null;
  }>({ open: false, user: null });

  const deleteUser = useDeleteUser();
  const toggleUserStatus = useToggleUserStatus();
  const resendInvitation = useResendInvitation();

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const formatLastLogin = (lastLogin: Date | null) => {
    if (!lastLogin) return 'Never';
    return format(lastLogin, 'PPp');
  };

  const getRoleIcon = (role: string) => {
    return role === 'OWNER' ? (
      <Shield className="h-3 w-3 mr-1" />
    ) : (
      <User className="h-3 w-3 mr-1" />
    );
  };

  const getStatusVariant = (user: UserWithShop) => {
    if (!user.active) return 'secondary';
    if (!user.emailVerified) return 'outline';
    return 'default';
  };

  const getStatusLabel = (user: UserWithShop) => {
    if (!user.active) return 'Inactive';
    if (!user.emailVerified) return 'Pending';
    return 'Active';
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.user) {
      await deleteUser.mutateAsync(deleteDialog.user.id);
      setDeleteDialog({ open: false, user: null });
    }
  };

  const handleEditRole = (user: UserWithShop) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const isCurrentUser = (userId: string) => userId === currentUserId;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {user.name}
                        {isCurrentUser(user.id) && (
                          <span className="text-sm text-muted-foreground ml-2">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(user)}>
                    {getStatusLabel(user)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-medium">
                    {getRoleIcon(user.role)}
                    {user.role.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatLastLogin(user.lastLoginAt)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {!isCurrentUser(user.id) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditRole(user)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleUserStatus.mutate(user.id)}
                        >
                          {user.active ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        {!user.emailVerified && (
                          <DropdownMenuItem
                            onClick={() => resendInvitation.mutate(user.id)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Resend Invitation
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteDialog({ open: true, user })}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Role Dialog */}
      {selectedUser && (
        <UserEditRoleDialog
          user={selectedUser}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account for <strong>{deleteDialog.user?.name}</strong> and remove
              all their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

