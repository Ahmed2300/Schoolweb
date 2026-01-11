import { apiClient, endpoints } from '../api';
import type {
    ICourseRepository,
    CourseFilters,
    PaginatedResponse
} from '../../core/repositories';
import type { Course, CourseDetails } from '../../core/entities';

export class CourseRepository implements ICourseRepository {
    async getCourses(filters?: CourseFilters): Promise<PaginatedResponse<Course>> {
        const response = await apiClient.get(endpoints.courses.list, { params: filters });
        const { data, pagination } = response.data;

        return {
            data: data || [],
            total: pagination?.total || 0,
            page: pagination?.current_page || 1,
            limit: pagination?.per_page || 12,
            totalPages: pagination?.total_pages || pagination?.last_page || 1,
        };
    }

    async getCourseById(id: string): Promise<CourseDetails> {
        const response = await apiClient.get(endpoints.courses.detail(id));
        return response.data;
    }

    async getEnrolledCourses(userId: string): Promise<Course[]> {
        const response = await apiClient.get(endpoints.courses.enrolled, {
            params: { userId }
        });
        return response.data.courses;
    }

    async getFeaturedCourses(): Promise<Course[]> {
        const response = await apiClient.get(endpoints.courses.featured);
        return response.data.courses;
    }

    async getRecommendedCourses(userId: string): Promise<Course[]> {
        const response = await apiClient.get(endpoints.courses.recommended, {
            params: { userId }
        });
        return response.data.courses;
    }

    async searchCourses(query: string): Promise<Course[]> {
        const response = await apiClient.get(endpoints.courses.search, {
            params: { q: query }
        });
        return response.data.courses;
    }

    async createCourse(data: Partial<Course>): Promise<Course> {
        const response = await apiClient.post(endpoints.courses.create, data);
        return response.data;
    }

    async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
        const response = await apiClient.put(endpoints.courses.update(id), data);
        return response.data;
    }

    async deleteCourse(id: string): Promise<void> {
        await apiClient.delete(endpoints.courses.delete(id));
    }

    async publishCourse(id: string): Promise<Course> {
        const response = await apiClient.post(endpoints.courses.publish(id));
        return response.data;
    }

    async unpublishCourse(id: string): Promise<Course> {
        const response = await apiClient.post(endpoints.courses.publish(id), {
            published: false
        });
        return response.data;
    }
}
