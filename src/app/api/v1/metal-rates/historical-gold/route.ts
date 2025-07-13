import { HistoricalGoldData } from "@/lib/types/settings/metal-rates";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city') || 'delhi';
        const days = parseInt(searchParams.get('days') || '30');

        const response = await fetch(
            `https://api.hindustantimes.com/datainsight/goldsilver/getdata/gold/${city}/${days}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: HistoricalGoldData[] = await response.json();
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching historical gold data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch historical gold data' },
            { status: 500 }
        );
    }
}