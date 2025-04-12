// src/app/api-docs/page.tsx
'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import SuppressWarnings from '@/components/SupressWarning';

export default function ApiDocs() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSpec() {
      try {
        const res = await fetch('/api/docs');
        const data = await res.json();
        setSpec(data);
      } catch (err) {
        console.error('Failed to fetch API spec:', err);
        setError('Failed to load API documentation');
      } finally {
        setLoading(false);
      }
    }

    fetchSpec();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading API Documentation...</div>
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
    <div className="api-docs-container">
      <style jsx global>{`
        .swagger-ui .topbar { display: none }
        .swagger-ui .info { margin: 30px 0 }
        .swagger-ui .scheme-container { padding: 15px 0 }
        body { margin: 0; padding: 0; }
      `}</style>
      <SuppressWarnings>
        {spec && (
          <SwaggerUI
            spec={spec}
            docExpansion="list"
            defaultModelsExpandDepth={-1}
            persistAuthorization={true}
          />
        )}
      </SuppressWarnings>
    </div>
  );
}