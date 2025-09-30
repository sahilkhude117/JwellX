"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  CreditCard,
  Package,
  History,
  Settings as SettingsIcon,
  Package2,
  List,
  Tags,
  Gem,
  Users,
  ClipboardList,
  Wrench,
  BarChart3,
  PieChart,
  UserCheck,
  UserCog,
  DollarSign,
  Cog,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  UserPlus,
} from "lucide-react";
import { Logo, LogoIcon } from "./Logo";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItemProps {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  isActive?: boolean;
  collapsed?: boolean;
}

interface SidebarGroupProps {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsed?: boolean;
}

interface SidebarContainerProps {
  children: React.ReactNode;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  label, 
  href, 
  icon, 
  badge, 
  isActive = false, 
  collapsed = false 
}) => {
  const ItemContent = () => (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
          isActive
            ? "bg-gray-200 text-gray-900 rounded-lg dark:bg-gray-700 dark:text-gray-100"
            : "text-gray-700 dark:text-gray-300",
          collapsed && "justify-center rounded-md"
        )}
      >
        <div className="flex-shrink-0">{icon}</div>
        {!collapsed && (
          <span className="flex-1">{label}</span>
        )}
        {!collapsed && badge && badge > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {badge}
          </Badge>
        )}
      </div>
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <ItemContent />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return <ItemContent />;
};

const SidebarGroup: React.FC<SidebarGroupProps> = ({ 
  label, 
  children, 
  defaultOpen = false, 
  collapsed = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (collapsed) {
    return <div className="space-y-1">{children}</div>;
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="text-left">{label}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {isOpen && <div className="ml-6 space-y-1">{children}</div>}
    </div>
  );
};

export default function SidebarContainer({ children }: SidebarContainerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const mainNavItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
  ];

  const salesItems = [
    {
      label: "Point of Sale (POS)",
      href: "/sales/pos",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      label: "Invoices",
      href: "/sales/invoices",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      label: "Transactions",
      href: "/sales/transactions",
      icon: <CreditCard className="h-5 w-5" />,
    },
  ];

  const inventoryItems = [
    {
      label: "Inventory Overview",
      href: "/inventory/",
      icon: <Package className="h-5 w-5" />,
    },
    // {
    //   label: "Purchase History",
    //   href: "/inventory/purchase-history",
    //   icon: <History className="h-5 w-5" />,
    // },
    {
      label: "Stock Adjustment",
      href: "/inventory/stock-adjustment",
      icon: <SettingsIcon className="h-5 w-5" />,
    },
  ];

  const catalogItems = [
    {
      label: "Categories",
      href: "/catalog/categories",
      icon: <Tags className="h-5 w-5" />,
    },
    {
      label: "Materials & Gemstones",
      href: "/catalog/materials-gemstones",
      icon: <Gem className="h-5 w-5" />,
    },
    {
      label: "Suppliers",
      href: "/catalog/suppliers",
      icon: <Tags className="h-5 w-5" />,
    },
  ];

  const customerItems = [
    {
      label: "Customers",
      href: "/customers",
      icon: <UserPlus className="h-5 w-5" />,
    },
  ]

  // const orderItems = [
  //   {
  //     label: "Custom Orders",
  //     href: "/orders/custom",
  //     icon: <ClipboardList className="h-5 w-5" />,
  //   },
  //   {
  //     label: "Repair Orders",
  //     href: "/orders/repair",
  //     icon: <Wrench className="h-5 w-5" />,
  //   },
  // ];

  // const reportItems = [
  //   {
  //     label: "Sales Reports",
  //     href: "/reports/sales",
  //     icon: <BarChart3 className="h-5 w-5" />,
  //   },
  //   {
  //     label: "Inventory Reports",
  //     href: "/reports/inventory",
  //     icon: <PieChart className="h-5 w-5" />,
  //   },
  //   {
  //     label: "Customer Reports",
  //     href: "/reports/customer",
  //     icon: <UserCheck className="h-5 w-5" />,
  //   },
  // ];

  const settingsItems = [
    {
      label: "User Management",
      href: "/settings/user-management",
      icon: <UserCog className="h-5 w-5" />,
    },
    {
      label: "Daily Metal Rates",
      href: "/settings/daily-metal-rates",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      label: "General Settings",
      href: "/settings/general-settings",
      icon: <Cog className="h-5 w-5" />,
    },
  ];

  const bottomItems = [
    {
      label: "Help",
      href: "/help",
      icon: <HelpCircle className="h-5 w-5" />,   
    },
    {
      label: "Logout",
      href: "/logout",
      icon: <LogOut className="h-5 w-5" />,
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div
          className={cn(
            "flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out relative",
            collapsed ? "w-16" : "w-64"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <LogoIcon />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <p>JwellX</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Logo />
              )}
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Main Navigation */}
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  {...item}
                  isActive={isActive(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </div>

            <Separator />

            {/* Groups */}
            <div className="space-y-4">
              <SidebarGroup label="Sales" defaultOpen={true} collapsed={collapsed}>
                {salesItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    {...item}
                    isActive={isActive(item.href)}
                    collapsed={collapsed}
                  />
                ))}
              </SidebarGroup>

              <SidebarGroup label="Inventory" defaultOpen={true} collapsed={collapsed}>
                {inventoryItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    {...item}
                    isActive={isActive(item.href)}
                    collapsed={collapsed}
                  />
                ))}
              </SidebarGroup>

              <Separator />

              <div className="space-y-4">
                {customerItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    {...item}
                    isActive={isActive(item.href)}
                    collapsed={collapsed}
                  />
                ))}
              </div>

              <Separator />

              <SidebarGroup label="Catalog" collapsed={collapsed}>
                {catalogItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    {...item}
                    isActive={isActive(item.href)}
                    collapsed={collapsed}
                  />
                ))}
              </SidebarGroup>

              {/* <SidebarGroup label="Orders & Repairs" collapsed={collapsed}>
                {orderItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    {...item}
                    isActive={isActive(item.href)}
                    collapsed={collapsed}
                  />
                ))}
              </SidebarGroup>

              <SidebarGroup label="Reports" collapsed={collapsed}>
                {reportItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    {...item}
                    isActive={isActive(item.href)}
                    collapsed={collapsed}
                  />
                ))}
              </SidebarGroup> */}
            </div>
          </div>

          <Separator />

          {/* Bottom Navigation */}
          <div className="p-4 space-y-1">
            {collapsed ? (
              <div className="space-y-1">
                {/* Settings items when collapsed */}
                {settingsItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    {...item}
                    isActive={isActive(item.href)}
                    collapsed={collapsed}
                  />
                ))}
                {/* Bottom items when collapsed */}
                {bottomItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    {...item}
                    isActive={isActive(item.href)}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            ) : (
              <>
                <SidebarGroup label="Settings" defaultOpen={false} collapsed={collapsed}>
                  {settingsItems.map((item) => (
                    <SidebarItem
                      key={item.href}
                      {...item}
                      isActive={isActive(item.href)}
                      collapsed={collapsed}
                    />
                  ))}
                </SidebarGroup>
                <div className="space-y-1 mt-2">
                  {bottomItems.map((item) => (
                    <SidebarItem
                      key={item.href}
                      {...item}
                      isActive={isActive(item.href)}
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Collapse/Expand Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                  "absolute top-4 -right-1 h-8 w-6 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-900",
                  "flex items-center justify-center p-0 rounded-md"
                )}
              >
                {collapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronLeft className="h-3 w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>{collapsed ? "Expand Sidebar" : "Collapse Sidebar"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {children}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}