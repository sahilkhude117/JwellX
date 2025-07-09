// components/ui/settings-skeleton.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Calculator, Globe } from 'lucide-react';

export function SettingsSkeleton() {
  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="mb-6 border rounded-lg bg-background p-4">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

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
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <div>
                      <Skeleton className="h-10 w-32" />
                      <Skeleton className="h-3 w-48 mt-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax_invoice">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-48" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="relative">
                        <Skeleton className="h-64 w-full rounded-lg" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="localization">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="fixed bottom-6 right-6 md:static md:flex md:justify-end">
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    </div>
  );
}