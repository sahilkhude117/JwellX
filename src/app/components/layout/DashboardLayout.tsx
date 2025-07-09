// components/layout/DashboardLayout.tsx
'use client';

import { OnboardingProvider, useOnboardingContext } from '@/contexts/OnboardingContext';
import { OnboardingWizard } from '../onboarding/OnboardingWizard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayoutContent: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { showOnboarding } = useOnboardingContext();

  return (
    <>
      <div>
        {children}
      </div>
       
      {/* Onboarding Modal */}
      {showOnboarding && <OnboardingWizard />}
    </>
  );
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <OnboardingProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </OnboardingProvider>
  );
};
