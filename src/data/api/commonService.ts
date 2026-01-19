import apiClient from './ApiClient';
import { endpoints } from './endpoints';

export interface Country {
    id: number;
    name: string;
    code: string;
    phone_code: string;
}

export interface City {
    id: number;
    name: string;
    country_id: number;
}

export const commonService = {
    getCountries: async (): Promise<Country[]> => {
        const response = await apiClient.get(endpoints.locations.countries);
        // Handle wrapped responses (Laravel Resources often return { data: [...] })
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return [];
    },

    getCities: async (countryId: number): Promise<City[]> => {
        const response = await apiClient.get(endpoints.locations.cities(countryId));
        // Handle wrapped responses
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return [];
    },
};
