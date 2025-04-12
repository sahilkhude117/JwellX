// src/app/test/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface ShopSettings {
  id: string;
  defaultMakingChargeType: string;
  defaultMakingChargeValue: number;
  gstGoldRate: number;
  gstMakingRate: number;
  primaryLanguage: string;
  billingPrefix: string;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  gstin: string;
  contactNumber: string;
  email: string | null;
  settings: ShopSettings | null;
  createdAt: string;
}

export default function TestPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/v1/test');
        const result = await response.json();
        
        if (result.success) {
          setShops(result.data);
        } else {
          setError(result.error || 'Unknown error occurred');
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600 p-4 border border-red-300 rounded-md bg-red-50">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Prisma Test: Jewelry Shops</h1>
      
      {shops.length === 0 ? (
        <p className="text-gray-600">No shops found in the database.</p>
      ) : (
        <div className="grid gap-6">
          {shops.map((shop) => (
            <div 
              key={shop.id} 
              className="border rounded-lg p-6 bg-white shadow-md"
            >
              <h2 className="text-xl font-semibold mb-2">{shop.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Shop Details</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li><span className="font-medium">GSTIN:</span> {shop.gstin}</li>
                    <li><span className="font-medium">Address:</span> {shop.address}</li>
                    <li><span className="font-medium">Contact:</span> {shop.contactNumber}</li>
                    <li><span className="font-medium">Email:</span> {shop.email || 'N/A'}</li>
                    <li><span className="font-medium">Created:</span> {new Date(shop.createdAt).toLocaleString()}</li>
                  </ul>
                </div>
                
                {shop.settings && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Shop Settings</h3>
                    <ul className="space-y-1 text-gray-600">
                      <li><span className="font-medium">Making Charge Type:</span> {shop.settings.defaultMakingChargeType}</li>
                      <li><span className="font-medium">Making Charge Value:</span> {shop.settings.defaultMakingChargeValue}%</li>
                      <li><span className="font-medium">GST on Gold:</span> {shop.settings.gstGoldRate}%</li>
                      <li><span className="font-medium">GST on Making:</span> {shop.settings.gstMakingRate}%</li>
                      <li><span className="font-medium">Billing Prefix:</span> {shop.settings.billingPrefix}</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-green-700">
          ✅ If you can see shop data above, Prisma is working correctly with your database!
        </p>
      </div>
    </div>
  );
}