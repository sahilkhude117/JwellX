'use client'

import { useOnboardingStatus } from "@/hooks/use-onboarding";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

interface OnboardingContextType {
  needsOnboarding: boolean;
  isLoading: boolean;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  refetchStatus: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboardingContext = () => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboardingContext must be used within onboarding provider");
    }
    return context;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { data: session, status: sessionStatus } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const { 
    data: onboardingStatus, 
    isLoading, 
    refetch: refetchStatus 
  } = useOnboardingStatus();

  const needsOnboarding = !onboardingStatus?.hasCompletedOnboarding;

  useEffect(() => {
    // Only show onboarding if user is authenticated and needs onboarding
    if (sessionStatus === 'authenticated' && needsOnboarding && !isLoading) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [sessionStatus, needsOnboarding, isLoading]);

  const value: OnboardingContextType = {
    needsOnboarding,
    isLoading,
    showOnboarding,
    setShowOnboarding,
    refetchStatus,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};