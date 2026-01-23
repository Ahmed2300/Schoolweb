import apiClient from './ApiClient';
import { endpoints } from './endpoints';

interface LectureFilters {
    per_page?: number;
    page?: number;
    search?: string;
    course_id?: number;
    teacher_id?: number;
}

interface LectureData {
    title: { ar: string; en?: string };
    description?: { ar?: string; en?: string };
    course_id: number;
    teacher_id: number;
    start_time?: string;
    end_time?: string;
    is_online?: boolean;
    remove_video?: boolean;
    is_published?: boolean;
    unit_id?: number | null;
    order?: number;
}

interface ChunkUploadResult {
    success: boolean;
    uploadedChunks: number;
    totalChunks: number;
    progress: number;
    complete: boolean;
    error?: string;
}

interface VideoCompleteResult {
    success: boolean;
    message: string;
    videoPath: string;
    videoUrl: string;
}

const CHUNK_SIZE = 5 * 1024 * 1024;

export const lectureService = {
    getLectures: async (filters: LectureFilters = {}) => {
        const response = await apiClient.get(endpoints.admin.lectures.list, { params: filters });
        return response.data;
    },

    getLectureById: async (id: number) => {
        const response = await apiClient.get(endpoints.admin.lectures.show(id));
        return response.data;
    },

    createLecture: async (data: LectureData) => {
        const response = await apiClient.post(endpoints.admin.lectures.create, data);
        return response.data;
    },

    createLectureWithVideo: async (data: LectureData, videoPath: string) => {
        const response = await apiClient.post(endpoints.admin.lectures.chunkedCreate, {
            ...data,
            video_path: videoPath,
        });
        return response.data;
    },

    updateLecture: async (id: number, data: Partial<LectureData>) => {
        const response = await apiClient.put(endpoints.admin.lectures.update(id), data);
        return response.data;
    },

    updateLectureWithVideo: async (id: number, data: Partial<LectureData>, videoPath?: string) => {
        const payload = videoPath ? { ...data, video_path: videoPath } : data;
        const response = await apiClient.post(endpoints.admin.lectures.chunkedUpdate(id), payload);
        return response.data;
    },

    deleteLecture: async (id: number) => {
        const response = await apiClient.delete(endpoints.admin.lectures.delete(id));
        return response.data;
    },

    initiateVideoUpload: async (): Promise<{ uploadId: string }> => {
        const response = await apiClient.post(endpoints.admin.videos.initiate);
        return response.data;
    },

    uploadVideoChunk: async (
        chunk: Blob,
        uploadId: string,
        chunkIndex: number,
        totalChunks: number,
        onProgress?: (loaded: number, total: number) => void
    ): Promise<ChunkUploadResult> => {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());

        const response = await apiClient.post(endpoints.admin.videos.chunk, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    onProgress(progressEvent.loaded, progressEvent.total);
                }
            },
        });
        return response.data;
    },

    completeVideoUpload: async (
        uploadId: string,
        totalChunks: number,
        originalFilename: string
    ): Promise<VideoCompleteResult> => {
        const response = await apiClient.post(endpoints.admin.videos.complete, {
            uploadId,
            totalChunks,
            originalFilename,
        });
        return response.data;
    },

    cancelVideoUpload: async (uploadId: string): Promise<void> => {
        await apiClient.post(endpoints.admin.videos.cancel, { uploadId });
    },

    getVideoUploadProgress: async (uploadId: string, totalChunks: number) => {
        const response = await apiClient.get(endpoints.admin.videos.progress, {
            params: { uploadId, totalChunks },
        });
        return response.data;
    },

    uploadVideo: async (
        file: File,
        onProgress?: (progress: number, status: string) => void
    ): Promise<{ videoPath: string; videoUrl: string }> => {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        onProgress?.(0, 'جاري بدء الرفع...');
        const { uploadId } = await lectureService.initiateVideoUpload();

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const result = await lectureService.uploadVideoChunk(
                chunk,
                uploadId,
                i,
                totalChunks,
                (loaded, total) => {
                    const chunkProgress = (loaded / total) * 100;
                    const overallProgress = ((i / totalChunks) * 100) + (chunkProgress / totalChunks);
                    onProgress?.(Math.round(overallProgress), `جاري رفع الجزء ${i + 1} من ${totalChunks}`);
                }
            );

            if (!result.success) {
                throw new Error(result.error || 'فشل رفع الفيديو');
            }
        }

        onProgress?.(100, 'جاري تجميع الفيديو...');
        const completeResult = await lectureService.completeVideoUpload(
            uploadId,
            totalChunks,
            file.name
        );

        return {
            videoPath: completeResult.videoPath,
            videoUrl: completeResult.videoUrl,
        };
    },
};
