import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { redirect } from "next/navigation";

const ROLE_HIERARCHY: Record<UserRole, number> = {
    OWNER: 4,
    ACCOUNTANT: 3,
    ARTISAN: 2,
    SALES_STAFF: 1
}

export const PERMISSIONS = {
    // sales permission
    CREATE_SALE: ['OWNER', 'SALES_STAFF'],
    VIEW_SALES: ['OWNER', 'SALES_STAFF', 'ACCOUNTANT'],
    DELETE_SALE: ['OWNER'],
    EDIT_SALE: ['OWNER'],
    PROCESS_RETURNS: ['OWNER', 'SALES_STAFF'],
    MANAGE_POS_SESSIONS: ['OWNER', 'SALES_STAFF'],

    // Inventory permissions
    CREATE_INVENTORY: ['OWNER', 'ARTISAN'],
    VIEW_INVENTORY: ['OWNER', 'SALES_STAFF', 'ARTISAN', 'ACCOUNTANT'],
    EDIT_INVENTORY: ['OWNER', 'ARTISAN'],
    DELETE_INVENTORY: ['OWNER'],

    // Customer permissions
    CREATE_CUSTOMERS: ['OWNER', 'SALES_STAFF'],
    VIEW_CUSTOMERS: ['OWNER', 'SALES_STAFF', 'ACCOUNTANT'],
    EDIT_CUSTOMERS: ['OWNER', 'SALES_STAFF'],
    DELETE_CUSTOMERS: ['OWNER'],

    // User management
    CREATE_USER: ['OWNER'],
    VIEW_USERS: ['OWNER'],
    EDIT_USER: ['OWNER'],
    DELETE_USER: ['OWNER'],

    // Shop settings
    VIEW_SETTINGS: ['OWNER', 'ACCOUNTANT'],
    EDIT_SETTINGS: ['OWNER'],

     // Reports
    VIEW_REPORTS: ['OWNER', 'ACCOUNTANT'],
    VIEW_DETAILED_REPORTS: ['OWNER'],
    
    // Gold rates
    MANAGE_GOLD_RATES: ['OWNER', 'ACCOUNTANT'],
    
    // Audit logs
    VIEW_AUDIT_LOGS: ['OWNER']
} as const

export type Permission = keyof typeof PERMISSIONS

// check if user has specific permission
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
    return PERMISSIONS[permission].includes(userRole as any);
}

// Check if user has higher or equal role
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}
  
// Get current session (server-side)
export async function getCurrentSession() {
    return await getServerSession(authOptions)
}

export async function requireAuth() {
    const session = await getCurrentSession()
    if (!session) {
      redirect('/auth/signin')
    }
    return session
}

export async function requirePermission(permission: Permission) {
    const session = await requireAuth()

    if (!hasPermission(session.user.role as UserRole, permission)) {
        redirect('/unauthorized')
    }

    return session;
}

export async function requireRole(role: UserRole) {
    const session = await requireAuth()

    if (!hasRoleLevel(session.user.role as UserRole, role)) {
        redirect('/unauthorized')
    }

    return session;
}