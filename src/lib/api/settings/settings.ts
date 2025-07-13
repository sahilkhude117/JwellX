import { api } from "@/lib/api";
import { 
    ShopWithSettings,
    UpdateShopRequest,
    UpdateShopSettingsRequest,
 } from "@/lib/types/settings/settings";

export const settingsApi = {
    getShop: () => 
        api.get<ShopWithSettings>('/v1/shop'),

    updateShop: (data: UpdateShopRequest) =>
        api.patch<ShopWithSettings>('/v1/shop', data),

    updateShopSettings: (data: UpdateShopSettingsRequest) =>
        api.patch<ShopWithSettings>('/v1/shop/settings', data),

    uploadLogo: (file: File) => {
        const formData = new FormData();
        formData.append('logo', file);
        return api.post<{ logoUrl: string }>('/v1/shop/logo', formData, undefined, {
            'Content-Type': 'multipart/form-data'
        })
    }
}