// Lesson entity with video content
export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    order: number;
    duration: number; // in minutes
    videoUrl?: string;
    videoType: VideoType;
    attachments?: Attachment[];
    isFree: boolean;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type VideoType = 'recorded' | 'live';

export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: 'pdf' | 'document' | 'image' | 'other';
    size: number;
}

export interface LiveSession extends Lesson {
    videoType: 'live';
    scheduledAt: Date;
    streamProvider: 'zoom' | 'bbb';
    meetingId?: string;
    meetingUrl?: string;
    status: 'scheduled' | 'live' | 'ended';
}
