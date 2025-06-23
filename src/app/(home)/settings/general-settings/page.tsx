'use client'
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2, Building, Calculator, Globe } from 'lucide-react';
import { toast } from 'sonner';

// Types
type AppSettings = {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  shopLogoUrl?: string;
  taxId: string;
  defaultTaxes: {
    cgstRate: number;
    sgstRate: number;
  };
  invoicePrefix: string;
  invoiceFooterText?: string;
  currency: 'INR' | 'USD' | 'EUR';
  timezone: string;
  language: 'en-US';
};

// Mock data
const mockAppSettings: AppSettings = {
  shopName: 'Radiant Jewels',
  shopAddress: '456, Main Market, Sitabuldi, Nagpur, Maharashtra, 440012',
  shopPhone: '+91 999 888 7777',
  shopEmail: 'contact@radiantjewels.com',
  shopLogoUrl: '/logo.png',
  taxId: '27ABCDE1234F1Z5',
  defaultTaxes: {
    cgstRate: 1.5,
    sgstRate: 1.5,
  },
  invoicePrefix: 'INV-2025-',
  invoiceFooterText: 'All items are certified. Returns accepted within 7 days with original invoice.',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  language: 'en-US',
};

// Currency options
const currencyOptions = [
  { value: 'INR', label: 'Indian Rupee (₹)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
];

// Timezone options
const timezoneOptions = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
];

export default function GeneralSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(mockAppSettings.shopLogoUrl || null);

  const form = useForm<AppSettings>({
    defaultValues: mockAppSettings,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setLogoPreview(url);
        setValue('shopLogoUrl', url);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: AppSettings) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, make PATCH request to /api/settings
      console.log('Saving settings:', data);
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 max-w-7xl">
      <div className="mb-6 border rounded-lg bg-background p-4">
          <h1 className="text-3xl font-bold mb-2">General Settings</h1>
          <p className="text-muted-foreground">Configure your business details, tax settings, and localization preferences.</p>
      </div>
      <div>

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
                      <Label htmlFor="shopName">Shop Name *</Label>
                      <Input
                        id="shopName"
                        {...register('shopName', { required: 'Shop name is required' })}
                        placeholder="Enter your shop name"
                      />
                      {errors.shopName && (
                        <p className="text-sm text-red-600">{errors.shopName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shopEmail">Contact Email *</Label>
                      <Input
                        id="shopEmail"
                        type="email"
                        {...register('shopEmail', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        placeholder="contact@yourshop.com"
                      />
                      {errors.shopEmail && (
                        <p className="text-sm text-red-600">{errors.shopEmail.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shopAddress">Shop Address *</Label>
                    <Textarea
                      id="shopAddress"
                      {...register('shopAddress', { required: 'Address is required' })}
                      placeholder="Enter your complete shop address"
                      rows={3}
                    />
                    {errors.shopAddress && (
                      <p className="text-sm text-red-600">{errors.shopAddress.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shopPhone">Contact Phone *</Label>
                    <Input
                      id="shopPhone"
                      {...register('shopPhone', { required: 'Phone number is required' })}
                      placeholder="+91 999 888 7777"
                    />
                    {errors.shopPhone && (
                      <p className="text-sm text-red-600">{errors.shopPhone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Shop Logo</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={logoPreview || undefined} alt="Shop Logo" />
                        <AvatarFallback className="text-2xl">
                          {watch('shopName')?.charAt(0) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Change Logo
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
                          Recommended: 200x200px, PNG or JPG
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
                    Configure your tax rates and invoice preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Business Tax ID (GSTIN) *</Label>
                    <Input
                      id="taxId"
                      {...register('taxId', { required: 'Tax ID is required' })}
                      placeholder="27ABCDE1234F1Z5"
                    />
                    {errors.taxId && (
                      <p className="text-sm text-red-600">{errors.taxId.message}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label>Default Tax Rates</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                        <Input
                          id="cgstRate"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...register('defaultTaxes.cgstRate', { 
                            required: 'CGST rate is required',
                            min: { value: 0, message: 'Rate cannot be negative' },
                            max: { value: 100, message: 'Rate cannot exceed 100%' }
                          })}
                          placeholder="1.5"
                        />
                        {errors.defaultTaxes?.cgstRate && (
                          <p className="text-sm text-red-600">{errors.defaultTaxes.cgstRate.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                        <Input
                          id="sgstRate"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          {...register('defaultTaxes.sgstRate', { 
                            required: 'SGST rate is required',
                            min: { value: 0, message: 'Rate cannot be negative' },
                            max: { value: 100, message: 'Rate cannot exceed 100%' }
                          })}
                          placeholder="1.5"
                        />
                        {errors.defaultTaxes?.sgstRate && (
                          <p className="text-sm text-red-600">{errors.defaultTaxes.sgstRate.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                    <Input
                      id="invoicePrefix"
                      {...register('invoicePrefix')}
                      placeholder="INV-2025-"
                    />
                    <p className="text-sm text-gray-500">
                      e.g., 'INV-' will result in 'INV-001'
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoiceFooterText">Default Invoice Footer</Label>
                    <Textarea
                      id="invoiceFooterText"
                      {...register('invoiceFooterText')}
                      placeholder="Terms & Conditions, return policy, etc."
                      rows={4}
                    />
                    <p className="text-sm text-gray-500">
                      This text will appear at the bottom of every invoice.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="localization">
              <Card>
                <CardHeader>
                  <CardTitle>Localization Settings</CardTitle>
                  <CardDescription>
                    Configure currency, timezone, and language preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select 
                        value={watch('currency')} 
                        onValueChange={(value) => setValue('currency', value as 'INR' | 'USD' | 'EUR')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select 
                        value={watch('timezone')} 
                        onValueChange={(value) => setValue('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezoneOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={watch('language')} 
                      onValueChange={(value) => setValue('language', value as 'en-US')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Sticky Save Button */}
          <div className="fixed bottom-6 right-6 md:static md:flex md:justify-end">
            <Button 
              type="button"
              onClick={handleSubmit(onSubmit)}
              size="lg" 
              disabled={isLoading}
              className="shadow-lg md:shadow-none"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save All Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}