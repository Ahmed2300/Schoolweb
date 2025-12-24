// Application constants
export const APP_NAME = 'Educational Platform';
export const APP_NAME_AR = 'المنصة التعليمية';

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48];

// Video
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
export const ALLOWED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/ogg'];

// Images
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

// Attachments
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_ATTACHMENT_FORMATS = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
];

// Quiz
export const MIN_QUIZ_DURATION = 5; // minutes
export const MAX_QUIZ_DURATION = 180; // minutes
export const DEFAULT_QUIZ_ATTEMPTS = 3;

// Session
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
export const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Debounce
export const SEARCH_DEBOUNCE = 300;
export const INPUT_DEBOUNCE = 150;

// API
export const API_TIMEOUT = 30000; // 30 seconds
