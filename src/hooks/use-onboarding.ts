import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { onboardingApi } from "@/lib/api/onboarding";
import { toast } from "sonner";


export const useOnboardingStatus = () => {
    return useQuery({
        queryKey: ['onboarding-status'],
        queryFn: onboardingApi.getOnboardingStatus,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    })
};

export const useInvoiceTemplates = () => {
    return useQuery({
        queryKey: ['invoice-templates'],
        queryFn: onboardingApi.getInvoiceTemplates,
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

export const useCompleteOnboarding = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: onboardingApi.completeOnboarding,
        onSuccess: () => {
            //invalidate and refetch onboarding status
            queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
            toast.success('Shop setup completed successfully!');
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Failed to complete onboarding';
            toast.error(errorMessage)
        }
    })
}