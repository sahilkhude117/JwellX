import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') || 'delhi';

    const response = await fetch(
      `https://api.hindustantimes.com/datainsight/goldsilver/gethistoricaldata/silver/${city}/10`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching historical silver data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical silver data' },
      { status: 500 }
    );
  }
}