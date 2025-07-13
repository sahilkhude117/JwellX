'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserWithShop, UserRole } from '@/lib/types/settings/user-management';
import { useUpdateUserRole } from '@/hooks/settings/use-user-management';

interface UserEditRoleDialogProps {
  user: UserWithShop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserEditRoleDialog({
  user,
  open,
  onOpenChange,
}: UserEditRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const updateUserRole = useUpdateUserRole();

  const handleSubmit = async () => {
    if (selectedRole !== user.role) {
      await updateUserRole.mutateAsync({
        userId: user.id,
        role: selectedRole,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the role for {user.name}. This will affect their permissions
            in the system.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SALES_STAFF">Sales Staff</SelectItem>
                <SelectItem value="ARTISAN">Artisan</SelectItem>
                <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateUserRole.isPending || selectedRole === user.role}
          >
            {updateUserRole.isPending ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}