'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, Building, Calculator, Globe, Check } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useShop, 
  useUpdateShop, 
  useUpdateShopSettings, 
  useUploadLogo 
} from '@/hooks/use-settings';
import { useInvoiceTemplates } from '@/hooks/use-onboarding';
import { SettingsSkeleton } from '@/app/components/skeletons/settings-skeleton';

// Validation schema
const settingsSchema = z.object({
  // Shop details
  name: z.string().min(1, 'Shop name is required'),
  address: z.string().optional(),
  gstin: z.string().optional(),
  contactNumber: z
    .string()
    .min(10, { message: "Contact number must be at least 10 digits" })
    .max(15, { message: "Contact number must be at most 15 digits" })
    .regex(/^\d+$/, { message: "Contact number must contain only digits" }),
  email: z.string().email('Invalid email address'),
  logoUrl: z.string().optional(),
  
  // Shop settings
  billingPrefix: z.string().min(1, 'Billing prefix is required'),
  primaryLanguage: z.string().min(1, 'Language is required'),
  invoiceTemplateId: z.string().min(1, 'Please select an invoice template'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

// Language options
const languageOptions = [
  { value: 'en', label: 'English' },
];

export default function GeneralSettingsPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { data: shopData, isLoading: isLoadingShop, error: shopError } = useShop();
  const { data: templatesData, isLoading: isLoadingTemplates } = useInvoiceTemplates();
  const updateShopMutation = useUpdateShop();
  const updateSettingsMutation = useUpdateShopSettings();
  const uploadLogoMutation = useUploadLogo();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      address: '',
      gstin: '',
      contactNumber: '',
      email: '',
      logoUrl: '',
      billingPrefix: 'INV',
      primaryLanguage: 'en',
      invoiceTemplateId: '',
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = form;

  // Update form when data loads
  React.useEffect(() => {
    if (shopData) {
      const defaultValues = {
        name: shopData.name || '',
        address: shopData.address || '',
        gstin: shopData.gstin || '',
        contactNumber: shopData.contactNumber || '',
        email: shopData.email || '',
        logoUrl: shopData.logoUrl || '',
        billingPrefix: shopData.settings?.billingPrefix || 'INV',
        primaryLanguage: shopData.settings?.primaryLanguage || 'en',
        invoiceTemplateId: shopData.settings?.invoiceTemplateId || '',
      };
      reset(defaultValues);
      setLogoPreview(shopData.logoUrl);
    }
  }, [shopData, reset]);

  const watchedValues = watch();

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setIsUploading(true);
      try {
        const result = await uploadLogoMutation.mutateAsync(file);
        setLogoPreview(result.logoUrl);
        setValue('logoUrl', result.logoUrl);
      } catch (error) {
        console.error('Logo upload error:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    try {
      // Split data into shop and settings
      const shopData = {
        name: data.name,
        address: data.address,
        gstin: data.gstin,
        contactNumber: data.contactNumber,
        email: data.email,
        logoUrl: data.logoUrl,
      };

      const settingsData = {
        billingPrefix: data.billingPrefix,
        primaryLanguage: data.primaryLanguage,
        invoiceTemplateId: data.invoiceTemplateId,
      };

      // Update both shop and settings
      await Promise.all([
        updateShopMutation.mutateAsync(shopData),
        updateSettingsMutation.mutateAsync(settingsData),
      ]);

      toast.success('All settings saved successfully!');
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings');
    }
  };

  if (isLoadingShop) {
    return <SettingsSkeleton />;
  }

  if (shopError) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading shop data. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = updateShopMutation.isPending || updateSettingsMutation.isPending;

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="mb-6 border rounded-lg bg-background p-4">
        <h1 className="text-3xl font-bold mb-2">General Settings</h1>
        <p className="text-muted-foreground">Configure your business details, tax settings, and localization preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Tabs defaultValue="shop_details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="shop_details" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Shop Details
              </TabsTrigger>
              <TabsTrigger value="tax_invoice" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Tax & Invoice
              </TabsTrigger>
              <TabsTrigger value="localization" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Localization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shop_details">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Update your shop details and contact information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Shop Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Enter your shop name"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Contact Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="contact@yourshop.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Shop Address *</Label>
                    <Input
                      id="address"
                      {...register('address')}
                      placeholder="Enter your complete shop address"
                    />
                    {errors.address && (
                      <p className="text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Phone *</Label>
                    <Input
                      id="contactNumber"
                      {...register('contactNumber')}
                      placeholder="+91 999 888 7777"
                    />
                    {errors.contactNumber && (
                      <p className="text-sm text-red-600">{errors.contactNumber.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Shop Logo</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={logoPreview || undefined} alt="Shop Logo" />
                        <AvatarFallback className="text-2xl">
                          {watchedValues.name?.charAt(0) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" className="flex items-center gap-2" disabled={isUploading}>
                            {isUploading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            {isUploading ? 'Uploading...' : 'Change Logo'}
                          </Button>
                        </Label>
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Recommended: 200x200px, PNG or JPG, Max 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tax_invoice">
              <Card>
                <CardHeader>
                  <CardTitle>Tax & Invoice Settings</CardTitle>
                  <CardDescription>
                    Configure your tax identification and invoice preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN (GST Identification Number)</Label>
                    <Input
                      id="gstin"
                      {...register('gstin')}
                      placeholder="27ABCDE1234F1Z5"
                    />
                    {errors.gstin && (
                      <p className="text-sm text-red-600">{errors.gstin.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billingPrefix">Invoice Number Prefix *</Label>
                    <Input
                      id="billingPrefix"
                      {...register('billingPrefix')}
                      placeholder="INV"
                    />
                    <p className="text-sm text-gray-500">
                      e.g., 'INV' will result in 'INV-001'
                    </p>
                    {errors.billingPrefix && (
                      <p className="text-sm text-red-600">{errors.billingPrefix.message}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Choose Invoice Template *</Label>
                    {isLoadingTemplates ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <RadioGroup
                        value={watchedValues.invoiceTemplateId}
                        onValueChange={(value) => setValue('invoiceTemplateId', value)}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                <div className="mb-2">
                                  <img
                                    src={template.previewUrl}
                                    alt={template.name}
                                    className="w-60 h-60 object-cover rounded border"
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
                      <p className="text-sm text-red-600">{errors.invoiceTemplateId.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="localization">
              <Card>
                <CardHeader>
                  <CardTitle>Localization Settings</CardTitle>
                  <CardDescription>
                    Configure language and regional preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="primaryLanguage">Primary Language *</Label>
                    <Select 
                      value={watchedValues.primaryLanguage} 
                      onValueChange={(value) => setValue('primaryLanguage', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.primaryLanguage && (
                      <p className="text-sm text-red-600">{errors.primaryLanguage.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="fixed bottom-6 right-6 md:static md:flex md:justify-end">
            <Button 
              type="submit"
              size="lg" 
              disabled={isLoading}
              className="shadow-lg md:shadow-none"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}