import { api } from "./api";

export const shopsApi = {
    getShops() {
        return api.get(`/v1/test`)
    }
}
