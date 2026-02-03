/**
 * Date & Timezone Utilities
 * 
 * Provides timezone-aware date formatting and manipulation for live sessions.
 * Uses date-fns for formatting with Arabic locale support.
 * 
 * Times are stored in UTC in the backend and converted to user's local timezone
 * for display. The X-Timezone header is sent with API requests to allow backend
 * to optionally pre-convert times.
 */

import { format, parseISO, formatDistanceToNow, isAfter, isBefore, addMinutes } from 'date-fns';
import { ar } from 'date-fns/locale';

// ═══════════════════════════════════════════════════════════════
// User Timezone Detection
// ═══════════════════════════════════════════════════════════════

/**
 * Get the user's timezone string (e.g., "Africa/Cairo", "Asia/Riyadh")
 * Uses browser's Intl API for reliable detection.
 */
export function getUserTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
        return 'UTC';
    }
}

/**
 * Get timezone offset in hours (e.g., +2, -5)
 */
export function getTimezoneOffset(): number {
    return -(new Date().getTimezoneOffset() / 60);
}

/**
 * Get timezone offset as string (e.g., "+02:00", "-05:00")
 */
export function getTimezoneOffsetString(): string {
    const offset = getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset).toString().padStart(2, '0');
    const minutes = ((absOffset % 1) * 60).toString().padStart(2, '0');
    return `${sign}${hours}:${minutes}`;
}

// ═══════════════════════════════════════════════════════════════
// Date Parsing (Handles UTC to Local)
// ═══════════════════════════════════════════════════════════════

/**
 * Parse an ISO date string and convert to local Date object.
 * If the string doesn't have timezone info, assumes UTC.
 * 
 * @param dateString - ISO 8601 date string (e.g., "2026-02-03T10:00:00Z" or "2026-02-03T10:00:00")
 * @returns Local Date object
 */
export function parseLocalDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;

    try {
        // parseISO handles ISO 8601 strings and converts to local time
        return parseISO(dateString);
    } catch {
        // Fallback to native Date parsing
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    }
}

// ═══════════════════════════════════════════════════════════════
// Date Formatting (Arabic Locale)
// ═══════════════════════════════════════════════════════════════

type LocaleType = 'ar' | 'en';

/**
 * Format a session time for display.
 * Example output: "الأحد، 3 فبراير 2026 • 10:00 ص"
 */
export function formatSessionTime(
    dateString: string | Date | null | undefined,
    locale: LocaleType = 'ar'
): string {
    const date = typeof dateString === 'string' ? parseLocalDate(dateString) : dateString;
    if (!date) return '';

    try {
        return format(date, 'EEEE، d MMMM yyyy • h:mm a', {
            locale: locale === 'ar' ? ar : undefined,
        });
    } catch {
        return date.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US');
    }
}

/**
 * Format just the time portion.
 * Example output: "10:00 ص" or "10:00 AM"
 */
export function formatTime(
    dateString: string | Date | null | undefined,
    locale: LocaleType = 'ar'
): string {
    const date = typeof dateString === 'string' ? parseLocalDate(dateString) : dateString;
    if (!date) return '';

    try {
        return format(date, 'h:mm a', {
            locale: locale === 'ar' ? ar : undefined,
        });
    } catch {
        return date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    }
}

/**
 * Format just the date portion.
 * Example output: "3 فبراير 2026" or "February 3, 2026"
 */
export function formatDate(
    dateString: string | Date | null | undefined,
    locale: LocaleType = 'ar'
): string {
    const date = typeof dateString === 'string' ? parseLocalDate(dateString) : dateString;
    if (!date) return '';

    try {
        return format(date, 'd MMMM yyyy', {
            locale: locale === 'ar' ? ar : undefined,
        });
    } catch {
        return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }
}

/**
 * Format a short date (for compact displays).
 * Example output: "3 فبراير" or "Feb 3"
 */
export function formatShortDate(
    dateString: string | Date | null | undefined,
    locale: LocaleType = 'ar'
): string {
    const date = typeof dateString === 'string' ? parseLocalDate(dateString) : dateString;
    if (!date) return '';

    try {
        return format(date, 'd MMM', {
            locale: locale === 'ar' ? ar : undefined,
        });
    } catch {
        return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
            day: 'numeric',
            month: 'short',
        });
    }
}

/**
 * Format relative time ("in 5 minutes", "منذ 3 ساعات").
 */
export function formatRelativeTime(
    dateString: string | Date | null | undefined,
    locale: LocaleType = 'ar'
): string {
    const date = typeof dateString === 'string' ? parseLocalDate(dateString) : dateString;
    if (!date) return '';

    try {
        return formatDistanceToNow(date, {
            addSuffix: true,
            locale: locale === 'ar' ? ar : undefined,
        });
    } catch {
        return '';
    }
}

// ═══════════════════════════════════════════════════════════════
// Session Time Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Get a human-readable countdown string.
 * 
 * @returns String like "5 دقائق" or "2 ساعة و 30 دقيقة" or "الآن"
 */
export function getCountdownText(
    targetDate: Date | string | null | undefined,
    locale: LocaleType = 'ar'
): string {
    const target = typeof targetDate === 'string' ? parseLocalDate(targetDate) : targetDate;
    if (!target) return '';

    const now = new Date();
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) {
        return locale === 'ar' ? 'الآن' : 'Now';
    }

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        const remainingHours = hours % 24;
        if (locale === 'ar') {
            return remainingHours > 0
                ? `${days} يوم و ${remainingHours} ساعة`
                : `${days} يوم`;
        }
        return remainingHours > 0
            ? `${days}d ${remainingHours}h`
            : `${days} days`;
    }

    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        if (locale === 'ar') {
            return remainingMinutes > 0
                ? `${hours} ساعة و ${remainingMinutes} دقيقة`
                : `${hours} ساعة`;
        }
        return remainingMinutes > 0
            ? `${hours}h ${remainingMinutes}m`
            : `${hours} hours`;
    }

    if (locale === 'ar') {
        return `${minutes} دقيقة`;
    }
    return `${minutes} minutes`;
}

/**
 * Check if a session is within the "join window" (e.g., 15 minutes before start).
 */
export function isWithinJoinWindow(
    startTime: Date | string | null | undefined,
    windowMinutes: number = 15
): boolean {
    const start = typeof startTime === 'string' ? parseLocalDate(startTime) : startTime;
    if (!start) return false;

    const now = new Date();
    const windowStart = addMinutes(start, -windowMinutes);

    return isAfter(now, windowStart) && isBefore(now, start);
}

/**
 * Check if current time is past the session start time.
 */
export function isPastStartTime(startTime: Date | string | null | undefined): boolean {
    const start = typeof startTime === 'string' ? parseLocalDate(startTime) : startTime;
    if (!start) return false;

    return isAfter(new Date(), start);
}

/**
 * Check if current time is past the session end time.
 */
export function isPastEndTime(endTime: Date | string | null | undefined): boolean {
    const end = typeof endTime === 'string' ? parseLocalDate(endTime) : endTime;
    if (!end) return false;

    return isAfter(new Date(), end);
}

// ═══════════════════════════════════════════════════════════════
// Time Range Formatting
// ═══════════════════════════════════════════════════════════════

/**
 * Format a time range for session display.
 * Example: "10:00 ص - 11:30 ص" or "10:00 AM - 11:30 AM"
 */
export function formatTimeRange(
    startTime: Date | string | null | undefined,
    endTime: Date | string | null | undefined,
    locale: LocaleType = 'ar'
): string {
    const start = formatTime(startTime, locale);
    const end = formatTime(endTime, locale);

    if (!start && !end) return '';
    if (!end) return start;
    if (!start) return end;

    return `${start} - ${end}`;
}

/**
 * Calculate session duration in minutes.
 */
export function getSessionDuration(
    startTime: Date | string | null | undefined,
    endTime: Date | string | null | undefined
): number {
    const start = typeof startTime === 'string' ? parseLocalDate(startTime) : startTime;
    const end = typeof endTime === 'string' ? parseLocalDate(endTime) : endTime;

    if (!start || !end) return 0;

    const diffMs = end.getTime() - start.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
}

/**
 * Format session duration as text.
 * Example: "90 دقيقة" or "1.5 hours"
 */
export function formatDuration(minutes: number, locale: LocaleType = 'ar'): string {
    if (minutes <= 0) return '';

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0 && remainingMinutes > 0) {
        return locale === 'ar'
            ? `${hours} ساعة و ${remainingMinutes} دقيقة`
            : `${hours}h ${remainingMinutes}m`;
    }

    if (hours > 0) {
        return locale === 'ar'
            ? `${hours} ساعة`
            : `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    return locale === 'ar'
        ? `${minutes} دقيقة`
        : `${minutes} minute${minutes > 1 ? 's' : ''}`;
}
