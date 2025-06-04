"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Bell,
  User,
  ChevronDown,
  FileText,
  Users,
  Package,
  ClipboardList,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SearchResult {
  id: string;
  title: string;
  category: "invoices" | "customers" | "products" | "orders";
  subtitle?: string;
  href: string;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "alert" | "info" | "success";
  timestamp: string;
  read: boolean;
}

interface MetalRate {
  type: string;
  rate: number;
  unit: string;
  change: number;
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMetalRates, setShowMetalRates] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mock data - replace with actual API calls
  const metalRates: MetalRate[] = [
    { type: "Gold (24K)", rate: 7200, unit: "₹/g", change: 2.5 },
    { type: "Gold (22K)", rate: 6600, unit: "₹/g", change: 2.3 },
    { type: "Silver", rate: 85, unit: "₹/g", change: -1.2 },
    { type: "Platinum", rate: 3200, unit: "₹/g", change: 0.8 },
  ];

  const notifications: NotificationItem[] = [
    {
      id: "1",
      title: "Low Stock Alert",
      description: "Product 'Gold Ring - GR001' is low on stock (2 remaining)",
      type: "alert",
      timestamp: "2 minutes ago",
      read: false,
    },
    {
      id: "2",
      title: "Order Update",
      description: "Custom Order #ORD-052 has been marked as 'Completed'",
      type: "success",
      timestamp: "1 hour ago",
      read: false,
    },
    {
      id: "3",
      title: "Pending Task",
      description: "Repair #REP-015 is due for delivery today",
      type: "info",
      timestamp: "3 hours ago",
      read: true,
    },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Mock search function - replace with actual API call
  const performSearch = (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Mock search results
    // @ts-ignore
    const mockResults: SearchResult[] = [
      {
        id: "inv-001",
        title: "INV-2024-001",
        category: "invoices",
        subtitle: "₹15,000 - Amit Kumar",
        href: "/sales/invoices/inv-001",
      },
      {
        id: "cust-001",
        title: "Priya Sharma",
        category: "customers",
        subtitle: "+91 9876543210",
        href: "/customers/cust-001",
      },
      {
        id: "prod-001",
        title: "Gold Ring - GR001",
        category: "products",
        subtitle: "24K Gold, 5g",
        href: "/products/prod-001",
      },
      {
        id: "ord-001",
        title: "Custom Order #ORD-052",
        category: "orders",
        subtitle: "Diamond Necklace - In Progress",
        href: "/orders-repairs/custom-orders/ord-001",
      },
    ].filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.subtitle?.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(mockResults);
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "invoices":
        return <FileText className="h-4 w-4" />;
      case "customers":
        return <Users className="h-4 w-4" />;
      case "products":
        return <Package className="h-4 w-4" />;
      case "orders":
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "invoices":
        return "text-blue-600";
      case "customers":
        return "text-green-600";
      case "products":
        return "text-purple-600";
      case "orders":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const handleSearchResultClick = (href: string) => {
    setShowSearchResults(false);
    setSearchQuery("");
    router.push(href);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "invoice":
        router.push("/sales/pos");
        break;
      case "customer":
        // Open modal for new customer (you can implement modal logic here)
        router.push("/customers/new");
        break;
      case "order":
        // Open modal for new order (you can implement modal logic here)
        router.push("/orders-repairs/custom-orders/new");
        break;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex h-[70px] items-center justify-between px-4 md:px-6">
        {/* Center Section: Global Search */}
        <div className="flex-1 max-w-2xl mx-4 md:mx-8">
          <div className="relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by Invoice #, Customer Phone, Product SKU..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="pl-10 pr-4 w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800"
              />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSearchResultClick(result.href)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-100 dark:border-gray-800 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("flex-shrink-0", getCategoryColor(result.category))}>
                        {getCategoryIcon(result.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {result.category}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: User Actions and System Status */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Daily Metal Rates Quick View */}
          <Popover open={showMetalRates} onOpenChange={setShowMetalRates}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-2 text-sm font-medium"
              >
                <span className="text-amber-600">Gold (24K): ₹7,200/g</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4">
                <h4 className="font-semibold mb-3">Daily Metal Rates</h4>
                <div className="space-y-2">
                  {metalRates.map((rate) => (
                    <div key={rate.type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{rate.type}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {rate.rate.toLocaleString()} {rate.unit}
                        </div>
                        <div className={cn(
                          "text-xs",
                          rate.change > 0 ? "text-green-600" : rate.change < 0 ? "text-red-600" : "text-gray-500"
                        )}>
                          {rate.change > 0 ? "+" : ""}{rate.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/settings/daily-metal-rates">
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View All Rates
                  </Button>
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          {/* Quick Actions Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Quick Add</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleQuickAction("invoice")}>
                <FileText className="mr-2 h-4 w-4" />
                New Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickAction("customer")}>
                <Users className="mr-2 h-4 w-4" />
                New Customer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickAction("order")}>
                <ClipboardList className="mr-2 h-4 w-4" />
                New Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-600">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b">
                <h4 className="font-semibold">Notifications</h4>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors",
                      !notification.read && "bg-blue-50 dark:bg-blue-950/20"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        notification.type === "alert" ? "bg-red-500" :
                        notification.type === "success" ? "bg-green-500" : "bg-blue-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <UserCircle className="h-5 w-5" />
                <span className="hidden md:inline">Amit Kumar</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}