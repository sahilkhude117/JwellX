'use client'

import { UserInviteDialog } from "@/app/components/settings/user-management/user-invite-dialog";
import { UserTable } from "@/app/components/settings/user-management/user-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers, useUserStats } from "@/hooks/settings/use-user-management";
import { UserFilters, UserRole } from "@/lib/types/settings/user-management";
import { Clock, Filter, Plus, Search, UserCheck, Users, UserX, X } from "lucide-react";
import { useSession } from "next-auth/react"
import { useState } from "react";

export default function UserManagementPage() {
  const { data: session } = useSession();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
  })

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError
  } = useUsers(filters);

  const {
    data: stats,
    isLoading: statsLoading
  } = useUserStats();

  const handleSearch  = (search: string) => {
    setSearchTerm(search);
    setFilters(prev => ({ ...prev, search: search || undefined, page: 1}));
  };

  const handleRoleFilter = (role: string) => {
    setFilters(prev => ({
      ...prev,
      role: role === 'all' ? undefined : role as UserRole,
      page: 1
    }));
  }

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      active: status === 'all' ? undefined : status === 'active',
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      page: 1,
      limit: 10,
    });
  };

  const hasActiveFilters = filters.search || filters.role || filters.active !== undefined;

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You need to be logged in to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions for your jewelry business
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                stats?.total || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                stats?.active || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                stats?.inactive || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Deactivated users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                stats?.pendingInvites || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting acceptance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      !
                    </Badge>
                  )}
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="flex flex-col md:flex-row gap-4 pt-4 border-t">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Filter by Role</label>
                  <Select
                    value={filters.role || 'all'}
                    onValueChange={handleRoleFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="OWNER">Owner</SelectItem>
                      <SelectItem value="SALES_STAFF">Sales Staff</SelectItem>
                      <SelectItem value="ARTISAN">Artisan</SelectItem>
                      <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Filter by Status</label>
                  <Select
                    value={
                      filters.active === undefined 
                        ? 'all' 
                        : filters.active 
                        ? 'active' 
                        : 'inactive'
                    }
                    onValueChange={handleStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table  */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Users
            {usersData && (
              <Badge variant="outline">
                {usersData.users.length} of {usersData.total}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ): usersError ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">Failed to load users</p>
              <p className="text-sm text-muted-foreground">
                {usersError.message || 'An error occurred while fetching users'}
              </p>
            </div>
          ) : usersData?.users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No users found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by inviting your first user'
                }
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => setShowInviteDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              )}
            </div>
          ) : (
            <UserTable
              users={usersData?.users ?? []}
              currentUserId={session.user.id}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {usersData && usersData.total > usersData.users.length && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange((filters.page ?? 1) - 1)}
            disabled={(filters.page ?? 1) === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page} of {Math.ceil(usersData.total / (filters.limit ?? 10))}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange((filters.page ?? 1) + 1)}
            disabled={(filters.page ?? 1) >= Math.ceil(usersData.total / (filters.limit ?? 10))}
          >
            Next
          </Button>
        </div>
      )}

      <UserInviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </div>
  )

}