import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import { hasPermission, hasRoleLevel, Permission } from '@/lib/utils/auth-utils'

export function useAuth() {
    const { data: session, status } = useSession();

    return {
        session,
        user: session?.user,
        isLoading: status === 'loading',
        isAuthenticated: status === 'authenticated',
        hasPermission: (permission: Permission) =>
            session?.user.role ? hasPermission(session.user.role as UserRole, permission) : false,
        hasRole: (role: UserRole) =>
            session?.user.role ? hasRoleLevel(session.user.role as UserRole, role) : false,
        isOwner: session?.user?.role === 'OWNER',
        isSalesStaff: session?.user?.role === 'SALES_STAFF',
        isAccountant: session?.user?.role === 'ACCOUNTANT',
        isArtisan: session?.user?.role === 'ARTISAN',
    }
}

export function useRequireAuth() {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (!isLoading && !isAuthenticated) {
        throw new Error('Authentication required')
    }

    return { user, isLoading }
}