export const generateSKU = (baseName: string, weight?: number) => {
    if (!baseName) return '';
    
    const cleanedName = baseName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 15);

    if (weight && weight > 0) {
      return `${cleanedName}-${weight}G`;
    }
    
    return cleanedName;
};

export const gramsToMg = (grams: number): number => Math.round(grams * 1000);
export const mgToGrams = (mg: number): number => mg / 1000;
export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);
export const paiseToRupees = (paise: number): number => paise / 100;

export const calculateBuyingCost = (
  materials: Array<{
    weight: number;
    buyingPrice: number;
  }>,
  gemstones?: Array<{
    weight: number;
    buyingPrice: number;
  }>,
): number => {
  const materialsCostPaise = materials.reduce((sum, m) => sum + (m.weight * m.buyingPrice), 0); // weight in mg, price in paise
  const gemstonesCostPaise = gemstones?.reduce((sum, m) => sum + (m.weight * m.buyingPrice), 0) || 0;

  return materialsCostPaise + gemstonesCostPaise;
};

export const calculateBuyingCostBreakdown = (
  materials: Array<{
    materialId: string;
    weight: number;
    buyingPrice: number;
  }>,
  gemstones?: Array<{
    gemstoneId: string;
    weight: number;
    buyingPrice: number;
  }>,
) => {
  const materialsBreakdown = materials.map(m => ({
    id: m.materialId,
    weight: m.weight,
    price: m.buyingPrice,
    total: m.weight * m.buyingPrice
  }));

  const gemstonesBreakdown = gemstones?.map(g => ({
    id: g.gemstoneId,
    weight: g.weight,
    price: g.buyingPrice,
    total: g.weight * g.buyingPrice
  })) || [];

  const materialsTotal = materialsBreakdown.reduce((sum, m) => sum + m.total, 0);
  const gemstonesTotal = gemstonesBreakdown.reduce((sum, g) => sum + g.total, 0);
  const total = materialsTotal + gemstonesTotal;

  return {
    materials: materialsBreakdown,
    gemstones: gemstonesBreakdown,
    materialsTotal,
    gemstonesTotal,
    total
  };
};

export const calculateGrossWeight = (
  materials: Array<{ weight: number }>,
  gemstones: Array<{ weight: number }> = [],
  wastage: number = 0
): number => {
  // Calculate in mg, no wastage for gross weight as per requirement
  const totalWeight = materials.reduce((sum, m) => sum + m.weight, 0) + 
                     gemstones.reduce((sum, g) => sum + g.weight, 0);
  return Math.round(totalWeight); // Returns mg
};

export const calculateNetWeight = (
  materials: Array<{ weight: number }>,
  gemstones: Array<{ weight: number }> = [],
  wastage: number = 0
): number => {
  // Net weight includes wastage
  const grossWeight = calculateGrossWeight(materials, gemstones, 0);
  return Math.round(grossWeight * (1 + wastage / 100)); // Returns mg
};

export const calculateSellingPrice = (
  buyingCostPaise: number,
  makingChargePaise: number,
  wastage: number,
  materials: Array<{ weight: number, buyingPrice: number }>,
  gemstones: Array<{ weight: number, buyingPrice: number }> = [],
): number => {
  // All calculations in paise for precision

  // 3% GST on materials (materials buying cost * weight)
  const materialsGSTPaise = Math.round(materials.reduce((sum, m) => sum + (m.weight * m.buyingPrice), 0) * 0.03);

  // 3% GST on gemstones (gemstones buying cost * weight)
  const gemstonesGSTPaise = Math.round(gemstones.reduce((sum, g) => sum + (g.weight * g.buyingPrice), 0) * 0.03);

  // Wastage amount (calculated on buying cost)
  const wastageAmountPaise = Math.round(buyingCostPaise * (wastage / 100));

  // 5% GST on making charges
  const makingChargeGSTPaise = Math.round(makingChargePaise * 0.05);

  return buyingCostPaise + makingChargePaise + wastageAmountPaise + materialsGSTPaise + gemstonesGSTPaise + makingChargeGSTPaise;
};

export const calculateSellingPriceBreakdown = (
  buyingCostPaise: number,
  makingChargePaise: number,
  wastage: number,
  materials: Array<{ weight: number, buyingPrice: number }>,
  gemstones: Array<{ weight: number, buyingPrice: number }> = [],
) => {
  const materialsCost = materials.reduce((sum, m) => sum + (m.weight * m.buyingPrice), 0);
  const gemstonesCost = gemstones.reduce((sum, g) => sum + (g.weight * g.buyingPrice), 0);
  const wastageAmount = Math.round(buyingCostPaise * (wastage / 100));
  const materialsGST = Math.round(materialsCost * 0.03);
  const gemstonesGST = Math.round(gemstonesCost * 0.03);
  const makingChargeGST = Math.round(makingChargePaise * 0.05);

  const total = buyingCostPaise + makingChargePaise + wastageAmount + materialsGST + gemstonesGST + makingChargeGST;

  return {
    buyingCost: buyingCostPaise,
    makingCharge: makingChargePaise,
    wastage: wastageAmount,
    materialsGST,
    gemstonesGST,
    makingChargeGST,
    total
  };
};

export const formatWeight = (weightInMg: number): string => {
  return (weightInMg / 1000).toFixed(3);
}

export const formatPrice = (priceInPaise: number): string => {
  return (priceInPaise / 100).toFixed(2);
}

// Additional utility functions for real-time updates
export const roundToTwoDecimals = (value: number): number => {
  return Math.round(value * 100) / 100;
}

export const formatPriceRupees = (priceInPaise: number): string => {
  return `₹${(priceInPaise / 100).toFixed(2)}`;
}

export const formatWeightGrams = (weightInGrams: number): string => {
  return `${weightInGrams.toFixed(2)}g`;
}
