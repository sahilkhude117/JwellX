import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/lib/api/inventory/inventory";
import { InventoryLookups, LookupOption } from "@/lib/types/inventory/inventory";

// Hook to fetch all inventory lookups
export const useInventoryLookups = () => {
  return useQuery({
    queryKey: ['inventory-lookups'],
    queryFn: () => inventoryApi.getInventoryLookup(),
    staleTime: Infinity, // This data rarely changes
    refetchOnWindowFocus: false,
  });
};

// Hook to fetch specific lookup type
export const useInventoryLookup = (type: keyof InventoryLookups) => {
  return useQuery({
    queryKey: ['inventory-lookup', type],
    queryFn: () => inventoryApi.getInventoryLookup(type),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    select: (data) => {
      // If fetching specific type, the response will be { [type]: LookupOption[] }
      // If fetching all, return the specific array
      if (Array.isArray(data)) {
        return data;
      }
      return (data as any)[type] || [];
    },
  });
};

// Individual hooks for each lookup type
export const useHsnCodes = () => useInventoryLookup('hsnCodes');
export const useOccasions = () => useInventoryLookup('occasions');
export const useGenders = () => useInventoryLookup('genders');
export const useStyles = () => useInventoryLookup('styles');
export const useLocations = () => useInventoryLookup('locations');
