import { NextRequest, NextResponse } from "next/server";

// Predefined lookup data for inventory form dropdowns
const LOOKUP_DATA = {
  hsnCodes: [
    { value: '7113', label: '7113 - Articles of jewellery' },
    { value: '7114', label: '7114 - Articles of goldsmiths' },
    { value: '7115', label: '7115 - Other articles of precious metal' },
    { value: '7116', label: '7116 - Articles of precious or semi-precious stones' },
    { value: '7117', label: '7117 - Imitation jewellery' },
    { value: '7118', label: '7118 - Coin' },
  ],
  occasions: [
    { value: 'wedding', label: 'Wedding' },
    { value: 'festival', label: 'Festival' },
    { value: 'casual', label: 'Casual' },
    { value: 'party', label: 'Party' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'modern', label: 'Modern' },
  ],
  genders: [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'unisex', label: 'Unisex' },
    { value: 'boys', label: 'Boys' },
    { value: 'girls', label: 'Girls' },
  ],
  styles: [
    { value: 'traditional', label: 'Traditional' },
    { value: 'modern', label: 'Modern' },
    { value: 'contemporary', label: 'Contemporary' },
    { value: 'classic', label: 'Classic' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'minimalist', label: 'Minimalist' },
  ],
  locations: [
    { value: 'showroom-1', label: 'Main Showroom' },
    { value: 'showroom-2', label: 'Branch Showroom' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'online', label: 'Online Store' },
    { value: 'repair-shop', label: 'Repair Shop' },
    { value: 'safe', label: 'Safe Storage' },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type) {
      // Return specific lookup type
      if (LOOKUP_DATA.hasOwnProperty(type)) {
        return NextResponse.json({
          [type]: LOOKUP_DATA[type as keyof typeof LOOKUP_DATA]
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid lookup type' },
          { status: 400 }
        );
      }
    }

    // Return all lookup data
    return NextResponse.json(LOOKUP_DATA);
  } catch (error) {
    console.error('Error fetching inventory lookups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lookup data' },
      { status: 500 }
    );
  }
}
