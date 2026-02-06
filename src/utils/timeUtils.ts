/**
 * Time Utilities - Centralized timezone handling
 * 
 * All times are stored in Cairo timezone on the backend.
 * These utilities ensure consistent display across all client locations
 * by always displaying times in Cairo timezone (Africa/Cairo, UTC+2/+3).
 */

// Oman timezone identifier
const OMAN_TIMEZONE = 'Asia/Muscat';

/**
 * Format a date string to time display in user's local timezone
 * Example: "٤:٠٠ م" or "16:00"
 */
export const formatTime = (dateString: string | null | undefined, use24Hour = false): string => {
    if (!dateString) return '—';

    try {
        let date = new Date(dateString);

        // If parsing failed (Invalid Date), try appending dummy date for time-only strings
        if (isNaN(date.getTime())) {
            // Handle "18:30:00Z" or "20:30"
            // If it already has T, it might be just invalid. If not, assume it's time.
            if (!dateString.includes('T')) {
                const dummyDate = `2000-01-01T${dateString}`;
                date = new Date(dummyDate);
            }
        }

        if (isNaN(date.getTime())) return '—';

        // Use browser's local timezone (no timeZone param = local)
        return date.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !use24Hour,
        });
    } catch {
        return '—';
    }
};

/**
 * Format a date string to full date display in user's local timezone
 * Example: "الخميس، ٢٩ يناير ٢٠٢٦"
 */
export const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '—';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '—';

        // Use browser's local timezone
        return date.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return '—';
    }
};

/**
 * Format a date string to short date display in user's local timezone
 * Example: "الخميس، ٢٩ يناير ٢٦"
 */
export const formatShortDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '—';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '—';

        // Use browser's local timezone
        return date.toLocaleDateString('ar-EG', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return '—';
    }
};

/**
 * Format a time range for display
 * Example: "٤:٠٠ م - ٥:٠٠ م"
 */
export const formatTimeRange = (
    startTime: string | null | undefined,
    endTime: string | null | undefined
): string => {
    const start = formatTime(startTime);
    const end = formatTime(endTime);

    if (start === '—' && end === '—') return '—';
    return `${start} - ${end}`;
};

/**
 * Get the date part of a datetime string in user's local timezone
 * Returns YYYY-MM-DD format for date inputs
 */
export const getDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        // Use browser's local timezone
        const formatter = new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

        return formatter.format(date); // Returns YYYY-MM-DD
    } catch {
        return '';
    }
};

/**
 * Get the time part of a datetime string in user's local timezone
 * Returns HH:MM format for time inputs
 */
export const getTimeForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        // Use browser's local timezone
        const formatter = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        return formatter.format(date); // Returns HH:MM
    } catch {
        return '';
    }
};

/**
 * Create a Date object in Cairo timezone from date and time strings
 * This is used when creating new time slots from admin inputs
 */
export const createCairoDateTime = (dateStr: string, timeStr: string): Date => {
    // Combine date and time, interpret as Cairo timezone
    // Note: We append the Cairo offset to ensure correct interpretation
    const cairoOffset = '+02:00'; // Standard Cairo offset (use +03:00 during DST if needed)
    const isoString = `${dateStr}T${timeStr}:00${cairoOffset}`;
    return new Date(isoString);
};

/**
 * Check if a time slot is currently live (happening now)
 */
export const isSlotLiveNow = (
    startTime: string | null | undefined,
    endTime: string | null | undefined
): boolean => {
    if (!startTime || !endTime) return false;

    try {
        const now = Date.now();
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();

        return now >= start && now <= end;
    } catch {
        return false;
    }
};

/**
 * Check if a time slot is in the past
 */
export const isSlotPast = (endTime: string | null | undefined): boolean => {
    if (!endTime) return false;

    try {
        return new Date(endTime).getTime() < Date.now();
    } catch {
        return false;
    }
};

/**
 * Check if a time slot is in the future
 */
export const isSlotFuture = (startTime: string | null | undefined): boolean => {
    if (!startTime) return false;

    try {
        return new Date(startTime).getTime() > Date.now();
    } catch {
        return false;
    }
};

/**
 * Calculate remaining time until slot starts
 * Returns formatted string like "2 ساعات و 30 دقيقة"
 */
export const getTimeUntilStart = (startTime: string | null | undefined): string | null => {
    if (!startTime) return null;

    try {
        const start = new Date(startTime).getTime();
        const now = Date.now();
        const diff = start - now;

        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days} يوم`;
        }

        if (hours > 0) {
            return `${hours} ساعة${minutes > 0 ? ` و ${minutes} دقيقة` : ''}`;
        }

        return `${minutes} دقيقة`;
    } catch {
        return null;
    }
};

/**
 * Format relative time (for notifications, etc.)
 * Example: "منذ 5 دقائق", "منذ ساعة"
 */
export const formatRelativeTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '—';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '—';

        const now = Date.now();
        const diff = now - date.getTime();

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;

        return formatShortDate(dateString);
    } catch {
        return '—';
    }
};
