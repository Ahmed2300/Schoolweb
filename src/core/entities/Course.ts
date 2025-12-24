// Course entity
export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    teacherId: string;
    teacherName: string;
    type: CourseType;
    category?: string;
    gradeId?: string;
    termId?: string;
    price: number;
    discountPrice?: number;
    lessonsCount: number;
    duration: number; // in minutes
    enrolledCount: number;
    rating?: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type CourseType = 'academic' | 'non-academic';

export interface CourseDetails extends Course {
    lessons: LessonSummary[];
    requirements?: string[];
    objectives?: string[];
}

export interface LessonSummary {
    id: string;
    title: string;
    order: number;
    duration: number;
    isFree: boolean;
}
