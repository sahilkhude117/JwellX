// components/onboarding/OnboardingWizard.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Store, FileText, Check } from 'lucide-react';
import { useCompleteOnboarding, useInvoiceTemplates } from '@/hooks/use-onboarding';
import { useOnboardingContext } from '@/contexts/OnboardingContext';

const onboardingSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  address: z.string().min(1, 'Address is required'),
  email: z.string().email('Please enter a valid email address'),
  contactNumber: z.string().min(10, 'Please enter a valid contact number'),
  gstin: z.string().optional(),
  logoUrl: z.string().optional(),
  billingPrefix: z.string().min(1, 'Billing prefix is required'),
  invoiceTemplateId: z.string().min(1, 'Please select an invoice template'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const STEPS = [
  { id: 'shop', title: 'Shop Details', icon: Store },
  { id: 'invoice', title: 'Invoice Setup', icon: FileText },
];

export const OnboardingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { setShowOnboarding } = useOnboardingContext();
  const { mutate: completeOnboarding, isPending: isSubmitting } = useCompleteOnboarding();
  const { data: templatesData, isLoading: isLoadingTemplates } = useInvoiceTemplates();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      shopName: '',
      address: '',
      email: '',
      contactNumber: '',
      gstin: '',
      logoUrl: '',
      billingPrefix: 'INV',
      invoiceTemplateId: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const watchedValues = watch();

  const onSubmit = (data: OnboardingFormData) => {
    completeOnboarding(data, {
      onSuccess: () => {
        setShowOnboarding(false);
      },
    });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return watchedValues.shopName && watchedValues.address && watchedValues.email && watchedValues.contactNumber;
      case 1:
        return watchedValues.invoiceTemplateId && watchedValues.billingPrefix;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name *</Label>
              <Input
                id="shopName"
                {...register('shopName')}
                placeholder="Enter your shop name"
                className={errors.shopName ? 'border-red-500' : ''}
              />
              {errors.shopName && (
                <p className="text-sm text-red-500">{errors.shopName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Shop Address *</Label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="Enter your shop address"
                className={errors.address ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="shop@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  {...register('contactNumber')}
                  placeholder="Enter contact number"
                  className={errors.contactNumber ? 'border-red-500' : ''}
                />
                {errors.contactNumber && (
                  <p className="text-sm text-red-500">{errors.contactNumber.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN (Optional)</Label>
              <Input
                id="gstin"
                {...register('gstin')}
                placeholder="Enter GSTIN number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Shop Logo URL (Optional)</Label>
              <Input
                id="logoUrl"
                {...register('logoUrl')}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="billingPrefix">Invoice Prefix *</Label>
              <Input
                id="billingPrefix"
                {...register('billingPrefix')}
                placeholder="INV"
                className={errors.billingPrefix ? 'border-red-500' : ''}
              />
              {errors.billingPrefix && (
                <p className="text-sm text-red-500">{errors.billingPrefix.message}</p>
              )}
              <p className="text-sm text-gray-500">
                This will be used for invoice numbering (e.g., INV-001, INV-002)
              </p>
            </div>

            <div className="space-y-4">
              <Label>Choose Invoice Template *</Label>
              {isLoadingTemplates ? (
                <div className="flex justify-center py-8 bg-black">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <RadioGroup
                  value={watchedValues.invoiceTemplateId}
                  onValueChange={(value) => setValue('invoiceTemplateId', value)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templatesData?.templates.map((template) => (
                      <div key={template.id} className="relative">
                        <RadioGroupItem
                          value={template.id}
                          id={template.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={template.id}
                          className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50"
                        >
                          <div className="w-full mb-2">
                            <img
                              src={template.previewUrl}
                              alt={template.name}
                              className="w-full h-60 object-cover rounded border"
                            />
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-500">{template.description}</div>
                            <Badge variant="outline" className="mt-1">
                              {template.templateType}
                            </Badge>
                          </div>
                          {watchedValues.invoiceTemplateId === template.id && (
                            <Check className="w-5 h-5 text-blue-500 absolute top-2 right-2" />
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
              {errors.invoiceTemplateId && (
                <p className="text-sm text-red-500">{errors.invoiceTemplateId.message}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome! Let's Set Up Your Shop</CardTitle>
          <CardDescription>
            Complete these steps to get started with your POS system
          </CardDescription>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent()}
            
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentStep < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isStepValid(currentStep)}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      'Complete Setup'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};