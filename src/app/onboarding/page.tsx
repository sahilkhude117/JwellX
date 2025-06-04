'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Plus, Store, Tags, ArrowRight, CheckCircle } from 'lucide-react';

interface BusinessInfo {
  shopName: string;
  streetAddress: string;
  city: string;
  state: string;
  district: string;
  pinCode: string;
  contactPhone: string;
  gstin: string;
  logo: File | null;
}

interface FormErrors {
  shopName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  district?: string;
  pinCode?: string;
  contactPhone?: string;
  gstin?: string;
}

const GettingStarted = () => {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    shopName: '',
    streetAddress: '',
    city: '',
    state: '',
    district: '',
    pinCode: '',
    contactPhone: '',
    gstin: '',
    logo: null
  });
  
  const [categories, setCategories] = useState<string[]>(['Rings', 'Earrings', 'Bangles']);
  const [newCategory, setNewCategory] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progress tracking - break into smaller steps
  const getProgressSteps = () => {
    const steps = [
      { key: 'shopName', label: 'Shop Name', completed: !!businessInfo.shopName.trim() },
      { key: 'streetAddress', label: 'Street Address', completed: !!businessInfo.streetAddress.trim() },
      { key: 'city', label: 'City', completed: !!businessInfo.city.trim() },
      { key: 'state', label: 'State', completed: !!businessInfo.state.trim() },
      { key: 'district', label: 'District', completed: !!businessInfo.district.trim() },
      { key: 'pinCode', label: 'PIN Code', completed: !!businessInfo.pinCode.trim() && isValidPinCode(businessInfo.pinCode) },
      { key: 'contactPhone', label: 'Phone', completed: !!businessInfo.contactPhone.trim() && isValidPhone(businessInfo.contactPhone) },
      { key: 'gstin', label: 'GSTIN', completed: !!businessInfo.gstin.trim() && isValidGSTIN(businessInfo.gstin) },
      { key: 'logo', label: 'Logo', completed: !!businessInfo.logo },
      { key: 'categories', label: 'Categories', completed: categories.length > 0 }
    ];
    
    return steps;
  };

  const calculateProgress = () => {
    const steps = getProgressSteps();
    const completedSteps = steps.filter(step => step.completed).length;
    return (completedSteps / steps.length) * 100;
  };

  // Validation functions
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const isValidPinCode = (pinCode: string) => {
    const pinRegex = /^\d{6}$/;
    return pinRegex.test(pinCode);
  };

  const isValidGSTIN = (gstin: string) => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  const validateField = (field: keyof BusinessInfo, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'shopName':
        if (!value.trim()) {
          newErrors.shopName = 'Shop name is required';
        } else if (value.length < 2) {
          newErrors.shopName = 'Shop name must be at least 2 characters';
        } else {
          delete newErrors.shopName;
        }
        break;
      
      case 'streetAddress':
        if (!value.trim()) {
          newErrors.streetAddress = 'Street address is required';
        } else if (value.length < 5) {
          newErrors.streetAddress = 'Please enter a complete address';
        } else {
          delete newErrors.streetAddress;
        }
        break;
      
      case 'city':
        if (!value.trim()) {
          newErrors.city = 'City is required';
        } else if (value.length < 2) {
          newErrors.city = 'Please enter a valid city name';
        } else {
          delete newErrors.city;
        }
        break;
      
      case 'state':
        if (!value.trim()) {
          newErrors.state = 'State is required';
        } else if (value.length < 2) {
          newErrors.state = 'Please enter a valid state name';
        } else {
          delete newErrors.state;
        }
        break;
      
      case 'district':
        if (!value.trim()) {
          newErrors.district = 'District is required';
        } else if (value.length < 2) {
          newErrors.district = 'Please enter a valid district name';
        } else {
          delete newErrors.district;
        }
        break;
      
      case 'pinCode':
        if (!value.trim()) {
          newErrors.pinCode = 'PIN code is required';
        } else if (!isValidPinCode(value)) {
          newErrors.pinCode = 'Please enter a valid 6-digit PIN code';
        } else {
          delete newErrors.pinCode;
        }
        break;
      
      case 'contactPhone':
        if (!value.trim()) {
          newErrors.contactPhone = 'Contact phone is required';
        } else if (!isValidPhone(value)) {
          newErrors.contactPhone = 'Please enter a valid phone number';
        } else {
          delete newErrors.contactPhone;
        }
        break;
      
      case 'gstin':
        if (!value.trim()) {
          newErrors.gstin = 'GSTIN is required';
        } else if (!isValidGSTIN(value)) {
          newErrors.gstin = 'Please enter a valid GSTIN (e.g., 22AAAAA0000A1Z5)';
        } else {
          delete newErrors.gstin;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleBusinessInfoChange = (field: keyof BusinessInfo, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      
      setBusinessInfo(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories(prev => prev.filter(cat => cat !== categoryToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory();
    }
  };

  const isSetupComplete = () => {
    const steps = getProgressSteps();
    return steps.every(step => step.completed) && Object.keys(errors).length === 0;
  };

  const handleSaveAndAddProduct = () => {
    if (!isSetupComplete()) {
      alert('Please complete all required fields correctly');
      return;
    }
    console.log('Saving setup data:', { businessInfo, categories });
    alert('Setup saved! Redirecting to Add Product page...');
  };

  const handleFinishToDashboard = () => {
    if (!isSetupComplete()) {
      alert('Please complete all required fields correctly');
      return;
    }
    console.log('Saving setup data:', { businessInfo, categories });
    alert('Setup saved! Redirecting to Dashboard...');
  };

  const progressSteps = getProgressSteps();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header with Progress */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Store className="h-8 w-8 text-gray-900" />
              <h1 className="text-xl font-semibold text-gray-900">Jewelry POS</h1>
            </div>
            <div className="text-sm text-gray-600">
              Setup Progress: {progressSteps.filter(s => s.completed).length} of {progressSteps.length} steps
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your New Point-of-Sale System!
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Let's get your shop set up for business. Complete these essential steps, 
            and you'll be ready to manage your inventory and sales in no time.
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1: Business Details */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center space-x-2">
                <Store className="h-5 w-5 text-gray-700" />
                <span>Tell us about your business</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                This information will be displayed on all your invoices and customer communications.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="shopName" className="text-sm font-medium text-gray-700">
                    Shop Name *
                  </Label>
                  <Input
                    id="shopName"
                    placeholder="e.g., Radiant Jewels"
                    value={businessInfo.shopName}
                    onChange={(e) => handleBusinessInfoChange('shopName', e.target.value)}
                    className={`mt-1 ${errors.shopName ? 'border-red-500' : ''}`}
                  />
                  {errors.shopName && (
                    <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="streetAddress" className="text-sm font-medium text-gray-700">
                    Street Address *
                  </Label>
                  <Textarea
                    id="streetAddress"
                    placeholder="Building number, street name, area"
                    value={businessInfo.streetAddress}
                    onChange={(e) => handleBusinessInfoChange('streetAddress', e.target.value)}
                    className={`mt-1 ${errors.streetAddress ? 'border-red-500' : ''}`}
                    rows={2}
                  />
                  {errors.streetAddress && (
                    <p className="text-red-500 text-xs mt-1">{errors.streetAddress}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    City *
                  </Label>
                  <Input
                    id="city"
                    placeholder="e.g., Mumbai"
                    value={businessInfo.city}
                    onChange={(e) => handleBusinessInfoChange('city', e.target.value)}
                    className={`mt-1 ${errors.city ? 'border-red-500' : ''}`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="district" className="text-sm font-medium text-gray-700">
                    District *
                  </Label>
                  <Input
                    id="district"
                    placeholder="e.g., Mumbai Suburban"
                    value={businessInfo.district}
                    onChange={(e) => handleBusinessInfoChange('district', e.target.value)}
                    className={`mt-1 ${errors.district ? 'border-red-500' : ''}`}
                  />
                  {errors.district && (
                    <p className="text-red-500 text-xs mt-1">{errors.district}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                    State *
                  </Label>
                  <Input
                    id="state"
                    placeholder="e.g., Maharashtra"
                    value={businessInfo.state}
                    onChange={(e) => handleBusinessInfoChange('state', e.target.value)}
                    className={`mt-1 ${errors.state ? 'border-red-500' : ''}`}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="pinCode" className="text-sm font-medium text-gray-700">
                    PIN Code *
                  </Label>
                  <Input
                    id="pinCode"
                    placeholder="400001"
                    value={businessInfo.pinCode}
                    onChange={(e) => handleBusinessInfoChange('pinCode', e.target.value)}
                    className={`mt-1 ${errors.pinCode ? 'border-red-500' : ''}`}
                    maxLength={6}
                  />
                  {errors.pinCode && (
                    <p className="text-red-500 text-xs mt-1">{errors.pinCode}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="contactPhone" className="text-sm font-medium text-gray-700">
                    Contact Phone *
                  </Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={businessInfo.contactPhone}
                    onChange={(e) => handleBusinessInfoChange('contactPhone', e.target.value)}
                    className={`mt-1 ${errors.contactPhone ? 'border-red-500' : ''}`}
                  />
                  {errors.contactPhone && (
                    <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="gstin" className="text-sm font-medium text-gray-700">
                    GSTIN / Tax ID *
                  </Label>
                  <Input
                    id="gstin"
                    placeholder="22AAAAA0000A1Z5"
                    value={businessInfo.gstin}
                    onChange={(e) => handleBusinessInfoChange('gstin', e.target.value.toUpperCase())}
                    className={`mt-1 ${errors.gstin ? 'border-red-500' : ''}`}
                    maxLength={15}
                  />
                  {errors.gstin && (
                    <p className="text-red-500 text-xs mt-1">{errors.gstin}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    15-character alphanumeric code for tax identification
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700">Shop Logo *</Label>
                  <div className="mt-2">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {logoPreview ? (
                        <div className="space-y-3">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="h-16 w-16 object-contain mx-auto rounded"
                          />
                          <p className="text-sm text-gray-600">Click to change logo</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-sm text-gray-600">Click to upload your shop logo</p>
                            <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Product Categories */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center space-x-2">
                <Tags className="h-5 w-5 text-gray-700" />
                <span>How do you categorize your jewelry?</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Create some basic categories to organize your products. You can add more later. Examples: Rings, Necklaces, Earrings.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter category name (e.g., Necklaces)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addCategory}
                    disabled={!newCategory.trim()}
                    size="sm"
                    className="px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-200"
                    >
                      <span>{category}</span>
                      <button
                        onClick={() => removeCategory(category)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    No categories added yet. Add some categories to organize your products.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Final Actions */}
          <div className="text-center space-y-4 py-8">
            {isSetupComplete() && (
              <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Setup Complete! Ready to proceed.</span>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button
                onClick={handleSaveAndAddProduct}
                disabled={!isSetupComplete()}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 text-base font-medium flex items-center space-x-2 disabled:opacity-50"
              >
                <span>Save & Add Your First Product</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                onClick={handleFinishToDashboard}
                disabled={!isSetupComplete()}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 text-base disabled:opacity-50"
              >
                Finish & Go to Dashboard
              </Button>
            </div>
            
            {!isSetupComplete() && (
              <p className="text-sm text-gray-500">
                Complete all required fields above to continue.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GettingStarted;