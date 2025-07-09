import { api } from "../api";
import { InvoiceTemplate, OnboardingData, OnboardingResponse, OnboardingStatus } from "../types/onboarding";

export const onboardingApi = {
    // complte onboarding
    completeOnboarding: (data: OnboardingData) =>
        api.post<OnboardingResponse>('/v1/onboarding/shop', data),

    // get invoice templates
    getInvoiceTemplates: () =>
        api.get<{ templates: InvoiceTemplate[]}>('/v1/onboarding/invoice-templates'),

    // check onboarding status
    getOnboardingStatus: () =>
        api.get<OnboardingStatus>('/v1/onboarding/status'),
}