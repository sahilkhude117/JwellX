
import { 
    CreateProductFormData,
    CreateProductInput, 
    MaterialFormData, 
    GemstoneFormData, 
    VariantFormData,
    ProductAttributeFormData 
} from "@/lib/types/products/create-products";

export const generateId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const generateSKU = (baseName: string, variantIndex?: number) => {
    if (!baseName) return '';
    
    const cleanedName = baseName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 15); // Leave room for variant suffix
    
    // If variant index is provided, add variant suffix
    if (typeof variantIndex === 'number') {
        return `${cleanedName}-V${String(variantIndex + 1).padStart(2, '0')}`;
    }
    
    return cleanedName;
};

export const generateVariantSKU = (baseSku: string, variantIndex: number) => {
    if (!baseSku) return '';
    return `${baseSku}-V${String(variantIndex + 1).padStart(2, '0')}`;
};

export const createEmptyAttribute = (): ProductAttributeFormData => ({
    id: generateId(),
    name: '',
    value: '',
});

export const createEmptyMaterial = (): MaterialFormData => ({
    id: generateId(),
    materialId: '',
    materialType: '',
    purity: '',
    weight: 0,
    rate: 0,
});

export const createEmptyGemstone = (): GemstoneFormData => ({
    id: generateId(),
    gemstoneId: '',
    gemstoneType: '',
    caratWeight: 0,
    cut: '',
    color: '',
    clarity: '',
    certificationId: '',
    rate: 0,
});

export const createEmptyVariant = (baseSku: string = '', index: number = 0): VariantFormData => ({
    id: generateId(),
    sku: baseSku ? generateSKU(baseSku, index) : '',
    totalWeight: 0,
    makingCharge: 0,
    wastage: 0,
    quantity: 0,
    materials: [],
    gemstones: [],
});

export const transformFormDataToApiInput = (formData: CreateProductFormData): CreateProductInput => {
    return {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        description: formData.description.trim() || undefined,
        hsnCode: formData.hsnCode.trim() || undefined,
        categoryId: formData.category,
        brandId: formData.brand || undefined,
        imageUrls: formData.imageUrls.filter(url => url.trim() !== ''),
        attributes: formData.attributes
            .filter(attr => attr.name.trim() && attr.value.trim())
            .map(attr => ({
                name: attr.name.trim(),
                value: attr.value.trim(),
            })),
        variants: formData.variants.map(variant => ({
            sku: variant.sku.trim(),
            totalWeight: variant.totalWeight,
            makingCharge: variant.makingCharge,
            wastage: variant.wastage || undefined,
            quantity: variant.quantity,
            materials: variant.materials.map(material => ({
                materialId: material.materialId,
                purity: material.purity.trim(),
                weight: material.weight,
                rate: material.rate,
            })),
            gemstones: variant.gemstones.map(gemstone => ({
                gemstoneId: gemstone.gemstoneId,
                caratWeight: gemstone.caratWeight,
                cut: gemstone.cut?.trim() || undefined,
                color: gemstone.color?.trim() || undefined,
                clarity: gemstone.clarity?.trim() || undefined,
                certificationId: gemstone.certificationId?.trim() || undefined,
                rate: gemstone.rate,
            })),
        })),
    };
};

export const validateFormData = (formData: CreateProductFormData): string[] => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
        errors.push('Product name is required');
    }

    if (!formData.sku.trim()) {
        errors.push('Product SKU is required');
    }

    if (!formData.category) {
        errors.push('Category is required');
    }

    if (formData.variants.length === 0) {
        errors.push('At least one variant is required');
    }

    formData.variants.forEach((variant, variantIndex) => {
        const variantPrefix = `Variant ${variantIndex + 1}`;

        if (!variant.sku.trim()) {
            errors.push(`${variantPrefix}: SKU is required`);
        }

        if (variant.totalWeight <= 0) {
            errors.push(`${variantPrefix}: Total weight must be greater than 0`);
        }

        if (variant.makingCharge < 0) {
            errors.push(`${variantPrefix}: Making charge cannot be negative`);
        }

        if (variant.quantity < 0) {
            errors.push(`${variantPrefix}: Quantity cannot be negative`);
        }

        if (variant.materials.length === 0) {
            errors.push(`${variantPrefix}: At least one material is required`);
        }

        variant.materials.forEach((material, materialIndex) => {
            const materialPrefix = `${variantPrefix} Material ${materialIndex + 1}`;

            if (!material.materialId) {
                errors.push(`${materialPrefix}: Material selection is required`);
            }

            if (!material.purity.trim()) {
                errors.push(`${materialPrefix}: Purity is required`);
            }

            if (material.weight <= 0) {
                errors.push(`${materialPrefix}: Weight must be greater than 0`);
            }

            if (material.rate < 0) {
                errors.push(`${materialPrefix}: Rate cannot be negative`);
            }
        });

        variant.gemstones.forEach((gemstone, gemstoneIndex) => {
            const gemstonePrefix = `${variantPrefix} Gemstone ${gemstoneIndex + 1}`;

            if (!gemstone.gemstoneId) {
                errors.push(`${gemstonePrefix}: Gemstone selection is required`);
            }

            if (gemstone.caratWeight <= 0) {
                errors.push(`${gemstonePrefix}: Carat weight must be greater than 0`);
            }

            if (gemstone.rate < 0) {
                errors.push(`${gemstonePrefix}: Rate cannot be negative`);
            }
        });
    });

    return errors;
};