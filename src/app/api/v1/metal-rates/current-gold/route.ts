import { GrowwApiResponse } from "@/lib/types/settings/metal-rates";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const response = await fetch('https://groww.in/v1/api/physicalGold/v1/rates/aggregated_api?days=10');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GrowwApiResponse = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching current gold rates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch current gold rates' },
            { status: 500 }
        );
    }
}