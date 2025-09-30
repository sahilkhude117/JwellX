"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContextualSelector } from "../../products/selectors/contextual-selector";
import { useUsers } from "@/hooks/users/use-user-lookup";
import { UserOption } from "@/lib/types/users/user";

interface UserSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  width?: number;
  className?: string;
  disabled?: boolean;
  showBadge?: boolean;
}

export default function UserSelector({
  value,
  onChange,
  required = false,
  className = "",
  width = 320,
  disabled = false,
  showBadge = true
}: UserSelectorProps) {
  const router = useRouter();

  const {
    data: usersData,
    isLoading: isLoading,
    error: error,
    refetch: refetch
  } = useUsers();
  
  const users = usersData?.users || [];
  
  const handleAddNewUser = () => {
    router.push("/settings/user-management");
  };
  
  return (
    <ContextualSelector<UserOption>
      items={users}
      isLoading={isLoading}
      error={error ? new Error(error.message) : null}
      refetch={refetch}
      selectedValue={value}
      onSelect={onChange}
      getItemId={(user) => user.id}
      getItemName={(user) => user.name}
      getItemDescription={(user) => user.email ? `${user.email}${user.role ? ` • ${user.role}` : ''}` : user.role || null}
      placeholder={required ? "Select user" : "Select user"}
      searchPlaceholder="Search users..."
      emptyMessage="No users found."
      addItemLabel="Manage Users"
      disabled={disabled}
      width={`[w-${width}px]`}
      badgeVariant="secondary"
      showBadge={showBadge}
      className={className}
      showAddNew={true}
      onAddNew={handleAddNewUser}
    />
  );
}