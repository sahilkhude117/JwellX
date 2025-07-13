import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api/settings/settings";
import { UpdateShopRequest, UpdateShopSettingsRequest } from "@/lib/types/settings/settings";
import { toast } from "sonner";

export const useShop = () => {
    return useQuery({
        queryKey: ['shop'],
        queryFn: settingsApi.getShop,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    })
}

export const useUpdateShop = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: settingsApi.updateShop,
        onSuccess: (data) => {
            queryClient.setQueryData(['shop'], data);
            toast.success('Shop details updated successfully');
        },
        onError: (error) => {
            console.error('Update shop error:', error);
            toast.error('Failed to update shop details');
        },
    })
}

export const useUpdateShopSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: settingsApi.updateShopSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['shop'], data);
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      console.error('Update settings error:', error);
      toast.error('Failed to update settings');
    },
  });
};

export const useUploadLogo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: settingsApi.uploadLogo,
    onSuccess: (data) => {
      // Update the shop query with new logo URL
      queryClient.setQueryData(['shop'], (oldData: any) => {
        if (oldData) {
          return {
            ...oldData,
            logoUrl: data.logoUrl
          };
        }
        return oldData;
      });
      toast.success('Logo uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload logo error:', error);
      toast.error('Failed to upload logo');
    },
  });
};