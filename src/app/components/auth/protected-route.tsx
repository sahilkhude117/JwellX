'use client';

import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@prisma/client";
import { Permission } from "@/lib/utils/auth-utils";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";  
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredPermision?: Permission
    requiredRole?: UserRole
    fallback?: React.ReactNode
}

export function ProtectedRoute({
    children,
    requiredPermision,
    requiredRole,
    fallback
}: ProtectedRouteProps) {
    const { isLoading, isAuthenticated, hasPermission, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/signin')
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin"/>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null;
    }

    if (requiredPermision && !hasPermission(requiredPermision)) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
            </div>
        )
    }

    // Check role if needed
    if (requiredRole && !hasRole(requiredRole)) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                <p className="text-gray-600">You don't have the required role to access this page.</p>
              </div>
            </div>
        )
    }

    return <>{children}</>
}

interface PermissionGuardProps {
    children: React.ReactNode
    permission?: Permission
    role?: UserRole
    fallback?: React.ReactNode
}
  
export function PermissionGuard({ 
    children, 
    permission, 
    role, 
    fallback = null 
}: PermissionGuardProps) {
    const { hasPermission, hasRole } = useAuth()
  
    if (permission && !hasPermission(permission)) {
      return <>{fallback}</>
    }
  
    if (role && !hasRole(role)) {
      return <>{fallback}</>
    }
  
    return <>{children}</>
}