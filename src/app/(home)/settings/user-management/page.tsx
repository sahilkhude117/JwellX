'use client'
import React, { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  User, 
  Shield, 
  ShieldCheck, 
  Clock,
  Mail,
  AlertTriangle,
  Trash2,
  UserX,
  UserCheck,
  Edit3
} from 'lucide-react';
// Table components implemented inline since table is not available
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertDialogContent } from '@radix-ui/react-alert-dialog';

// Types
type UserRole = 'ADMIN' | 'STAFF';
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_INVITE';

type UserData = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  avatarUrl?: string;
};

// Mock Data
const mockUsers: UserData[] = [
  {
    id: 'user_1',
    name: 'Amit Kumar (You)',
    email: 'amit.owner@radiantjewels.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastLogin: '2025-06-18T19:00:00.000Z',
  },
  {
    id: 'user_2',
    name: 'Priya Mehta',
    email: 'priya.sales@radiantjewels.com',
    role: 'STAFF',
    status: 'ACTIVE',
    lastLogin: '2025-06-18T17:30:00.000Z',
  },
  {
    id: 'user_3',
    name: 'Rohan Sharma',
    email: 'rohan.sales@radiantjewels.com',
    role: 'STAFF',
    status: 'INACTIVE',
    lastLogin: '2025-05-20T11:00:00.000Z',
  },
  {
    id: 'user_4',
    name: 'Sunita Patil',
    email: 'sunita.new@radiantjewels.com',
    role: 'STAFF',
    status: 'PENDING_INVITE',
    lastLogin: 'Never',
  },
];

// Utility functions
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatLastLogin = (loginDate: string) => {
  if (loginDate === 'Never') return 'N/A';
  
  const date = new Date(loginDate);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;

  // Use a fixed, locale-independent format: YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const StatusBadge = ({ status }: { status: UserStatus }) => {
  const variants = {
    ACTIVE: { variant: 'default' as const, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    INACTIVE: { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' },
    PENDING_INVITE: { variant: 'outline' as const, className: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
  };

  const labels = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    PENDING_INVITE: 'Pending'
  };

  return (
    <Badge {...variants[status]}>
      {labels[status]}
    </Badge>
  );
};

const RoleBadge = ({ role }: { role: UserRole }) => {
  return (
    <Badge variant="outline" className={role === 'ADMIN' ? 'border-blue-200 text-blue-700' : 'border-gray-200 text-gray-700'}>
      {role === 'ADMIN' ? <ShieldCheck className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
      {role}
    </Badge>
  );
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: '', description: '', action: () => {} });
  const [isMobile, setIsMobile] = useState(false);

  // Form states
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'STAFF' as UserRole
  });

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleInviteUser = () => {
    const newUser: UserData = {
      id: `user_${Date.now()}`,
      name: inviteForm.name,
      email: inviteForm.email,
      role: inviteForm.role,
      status: 'PENDING_INVITE',
      lastLogin: 'Never'
    };
    
    setUsers([...users, newUser]);
    setInviteForm({ name: '', email: '', role: 'STAFF' });
    setIsInviteDialogOpen(false);
  };

  const handleToggleStatus = (user: UserData) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'INACTIVE' ? 'deactivate' : 'activate';
    
    setAlertDialog({
      open: true,
      title: `${action === 'deactivate' ? 'Deactivate' : 'Activate'} User`,
      description: `Are you sure you want to ${action} ${user.name}? ${action === 'deactivate' ? 'They will lose all access to the system immediately.' : 'They will regain access to the system.'}`,
      action: () => {
        setUsers(users.map(u => 
          u.id === user.id ? { ...u, status: newStatus } : u
        ));
      }
    });
  };

  const handleDeleteUser = (user: UserData) => {
    setAlertDialog({
      open: true,
      title: 'Delete User',
      description: `Are you sure you want to delete ${user.name}? This action is permanent and cannot be undone.`,
      action: () => {
        setUsers(users.filter(u => u.id !== user.id));
      }
    });
  };

  const handleResendInvite = (user: UserData) => {
    // In real implementation, this would trigger an API call
    console.log(`Resending invitation to ${user.email}`);
  };

  const handleEditRole = (user: UserData) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRole = () => {
    if (!selectedUser) return;
    
    setUsers(users.map(u => 
      u.id === selectedUser.id ? { ...u, role: selectedUser.role } : u
    ));
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const isCurrentUser = (user: UserData) => user.name.includes('(You)');

  const UserCard = ({ user }: { user: UserData }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
            </div>
          </div>
          {!isCurrentUser(user) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditRole(user)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Role
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                  {user.status === 'ACTIVE' ? (
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
                {user.status === 'PENDING_INVITE' && (
                  <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Invitation
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDeleteUser(user)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-3">{user.email}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusBadge status={user.status} />
            <RoleBadge role={user.role} />
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {formatLastLogin(user.lastLogin)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container max-w-7xl mx-auto p-4 max-w-7xl">
          {/* Page Header */}
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between rounded-lg bg-background mb-6 border">
        <div className="mb-2">
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions for your jewelry business</p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a New User</DialogTitle>
              <DialogDescription>
                The user will receive an email with a link to set their password and log in.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteForm.role} onValueChange={(value: UserRole) => setInviteForm({ ...inviteForm, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff (Sales, Inventory)</SelectItem>
                    <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteUser} disabled={!inviteForm.name || !inviteForm.email}>
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* Users Content */}
      {isMobile ? (
        <div>
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {/* Custom Table Implementation */}
          <div className="bg-gray-50 border-b">
            <div className="grid grid-cols-5 gap-4 p-4 font-medium text-sm text-gray-700">
              <div>User</div>
              <div>Status</div>
              <div>Role</div>
              <div>Last Login</div>
              <div className="text-right">Actions</div>
            </div>
          </div>
          <div className="divide-y">
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <StatusBadge status={user.status} />
                </div>
                <div className="flex items-center">
                  <RoleBadge role={user.role} />
                </div>
                <div className="flex items-center text-gray-600">
                  {formatLastLogin(user.lastLogin)}
                </div>
                <div className="flex items-center justify-end">
                  {!isCurrentUser(user) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditRole(user)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                          {user.status === 'ACTIVE' ? (
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
                        {user.status === 'PENDING_INVITE' && (
                          <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Resend Invitation
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div>
              <Label htmlFor="editRole">Role</Label>
              <Select 
                value={selectedUser.role} 
                onValueChange={(value: UserRole) => setSelectedUser({ ...selectedUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF">Staff (Sales, Inventory)</SelectItem>
                  <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog open={alertDialog.open} onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              {alertDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={alertDialog.action}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}