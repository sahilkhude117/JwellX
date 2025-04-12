// src/app/api/docs/route.ts
import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/openapi';

// Disable Next.js caching for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getApiDocs());
}