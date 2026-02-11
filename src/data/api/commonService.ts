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

export interface Grade {
    id: number;
    name: string | { ar?: string; en?: string };
    description?: string | { ar?: string; en?: string };
    is_active?: boolean;
}

export interface Semester {
    id: number;
    name: string | { ar?: string; en?: string };
    start_date?: string;
    end_date?: string;
    is_active?: boolean;
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

    getGrades: async (): Promise<Grade[]> => {
        const response = await apiClient.get(endpoints.grades.list);
        // Handle wrapped responses
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return [];
    },

    getSemestersByGrade: async (gradeId: number): Promise<Semester[]> => {
        const response = await apiClient.get(endpoints.grades.semestersByGrade(gradeId));
        // Handle wrapped responses
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        return [];
    },
};
