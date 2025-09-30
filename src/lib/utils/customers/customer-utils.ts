import { CustomerWithStats } from '@/lib/types/customers/customers';

// Format customer phone number for display
export function formatPhoneNumber(phoneNumber: string | null): string {
  if (!phoneNumber) return 'N/A';
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Format based on length (assuming Indian format)
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  
  return phoneNumber;
}

// Calculate customer activity status
export function getCustomerActivityStatus(customer: CustomerWithStats): {
  status: 'Active' | 'Inactive';
  color: 'green' | 'gray';
} {
  if (customer.isActive) {
    return { status: 'Active', color: 'green' };
  }
  return { status: 'Inactive', color: 'gray' };
}

// Calculate customer value tier
export function getCustomerValueTier(totalSpent: number): {
  tier: 'VIP' | 'Regular' | 'New';
  color: 'purple' | 'blue' | 'gray';
  threshold: string;
} {
  if (totalSpent >= 100000) { // ₹1 lakh
    return { tier: 'VIP', color: 'purple', threshold: '₹1L+' };
  } else if (totalSpent >= 25000) { // ₹25k
    return { tier: 'Regular', color: 'blue', threshold: '₹25K+' };
  }
  return { tier: 'New', color: 'gray', threshold: '<₹25K' };
}

// Format customer purchase summary for display
export function formatCustomerSummary(customer: CustomerWithStats): string {
  const purchases = customer.totalPurchases;
  const spent = customer.totalSpent;
  
  if (purchases === 0) {
    return 'No purchases yet';
  }
  
  if (purchases === 1) {
    return `1 purchase • ₹${spent.toLocaleString()}`;
  }
  
  return `${purchases} purchases • ₹${spent.toLocaleString()}`;
}

// Generate customer initials for avatar
export function getCustomerInitials(name: string): string {
  if (!name) return 'CU';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
}

// Validate customer data completeness
export function getCustomerDataCompleteness(customer: CustomerWithStats): {
  score: number;
  missing: string[];
} {
  let score = 0;
  const missing: string[] = [];
  const fields = [
    { key: 'name', weight: 30 },
    { key: 'phoneNumber', weight: 25 },
    { key: 'email', weight: 25 },
    { key: 'address', weight: 20 }
  ];
  
  fields.forEach(field => {
    const value = customer[field.key as keyof CustomerWithStats];
    if (value && String(value).trim()) {
      score += field.weight;
    } else {
      missing.push(field.key.charAt(0).toUpperCase() + field.key.slice(1));
    }
  });
  
  return { score, missing };
}

// Sort customers by different criteria
export function sortCustomers(
  customers: CustomerWithStats[],
  sortBy: 'name' | 'registrationDate' | 'lastPurchase' | 'totalSpent',
  order: 'asc' | 'desc' = 'desc'
): CustomerWithStats[] {
  return [...customers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'registrationDate':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'lastPurchase':
        const aDate = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : 0;
        const bDate = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : 0;
        comparison = aDate - bDate;
        break;
      case 'totalSpent':
        comparison = a.totalSpent - b.totalSpent;
        break;
      default:
        comparison = 0;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
}

// Filter customers by search term
export function filterCustomers(
  customers: CustomerWithStats[],
  searchTerm: string
): CustomerWithStats[] {
  if (!searchTerm.trim()) return customers;
  
  const term = searchTerm.toLowerCase();
  return customers.filter(customer =>
    customer.name.toLowerCase().includes(term) ||
    customer.phoneNumber?.toLowerCase().includes(term) ||
    customer.email?.toLowerCase().includes(term) ||
    customer.address?.toLowerCase().includes(term)
  );
}

// Calculate days since last purchase
export function getDaysSinceLastPurchase(lastPurchaseDate: Date | null): number | null {
  if (!lastPurchaseDate) return null;
  
  const now = new Date();
  const lastPurchase = new Date(lastPurchaseDate);
  const diffTime = now.getTime() - lastPurchase.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Generate customer insights
export function generateCustomerInsights(customer: CustomerWithStats): string[] {
  const insights: string[] = [];
  
  const daysSinceLastPurchase = getDaysSinceLastPurchase(customer.lastPurchaseDate);
  const { tier } = getCustomerValueTier(customer.totalSpent);
  
  // Purchase frequency insights
  if (customer.totalPurchases > 5) {
    insights.push('Loyal customer with multiple purchases');
  }
  
  // Value tier insights
  if (tier === 'VIP') {
    insights.push('High-value customer');
  }
  
  // Activity insights
  if (daysSinceLastPurchase !== null) {
    if (daysSinceLastPurchase > 180) {
      insights.push('Hasn\'t purchased in 6+ months');
    } else if (daysSinceLastPurchase < 30) {
      insights.push('Recent active customer');
    }
  } else {
    insights.push('No purchase history');
  }
  
  // Data completeness
  const { score } = getCustomerDataCompleteness(customer);
  if (score < 75) {
    insights.push('Incomplete contact information');
  }
  
  return insights;
}