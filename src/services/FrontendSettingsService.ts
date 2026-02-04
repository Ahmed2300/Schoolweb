/**
 * FrontendSettingsService
 * 
 * Manages strict frontend-only persistence for scheduling configurations.
 * Uses localStorage to store:
 * 1. Academic Term Dates (Start/End)
 * 2. Booking Mode (Individual vs Multiple)
 * 3. Master Schedule Rules (Day/Time boundaries per grade)
 * 
 * ⚠️ NON-NEGOTIABLE:
 * - This service MUST NOT interact with the backend.
 * - All data is local to the admin's browser (for now).
 */

export interface AcademicTerm {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    semesterId?: number; // Linked backend semester ID
    isActive: boolean;
}

export type BookingMode = 'individual' | 'multiple';

export interface BreakInterval {
    id: string; // Unique ID for keying
    start: string; // HH:mm
    end: string;   // HH:mm
}

export interface DayScheduleConfig {
    isActive: boolean;
    startTime: string;       // HH:mm
    endTime: string;         // HH:mm
    slotDurationMinutes: number;
    gapMinutes: number;
    bookingMode: BookingMode; // Per-day override
    breaks: BreakInterval[];
}

export interface GradeSlotConfig {
    gradeId: number;
    // Map day index (0-6) to its specific config
    days: Record<number, DayScheduleConfig>;
    term?: AcademicTerm; // Per-grade term override
}

export interface ScheduleConfig {
    term: AcademicTerm; // Global Default
    bookingMode: BookingMode;
    gradeConfigs: GradeSlotConfig[];
    lastUpdated: string;
}

const STORAGE_KEY = 'schoolweb_schedule_config_v2';

const DEFAULT_DAY_CONFIG: DayScheduleConfig = {
    isActive: false,
    startTime: '08:00',
    endTime: '14:00',
    slotDurationMinutes: 60,
    gapMinutes: 0,
    bookingMode: 'individual',
    breaks: []
};

const DEFAULT_CONFIG: ScheduleConfig = {
    term: {
        startDate: '',
        endDate: '',
        isActive: false
    },
    bookingMode: 'individual',
    gradeConfigs: [],
    lastUpdated: new Date().toISOString()
};

class FrontendSettingsService {
    private cache: ScheduleConfig | null = null;

    /**
     * Get the full schedule configuration
     */
    getConfig(): ScheduleConfig {
        if (this.cache) return this.cache;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                this.cache = DEFAULT_CONFIG;
                return DEFAULT_CONFIG;
            }
            this.cache = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
            return this.cache!;
        } catch (error) {
            console.error('Failed to load schedule config:', error);
            return DEFAULT_CONFIG;
        }
    }

    /**
     * Save the schedule configuration
     */
    saveConfig(config: Partial<ScheduleConfig>): void {
        const current = this.getConfig();
        const updated = {
            ...current,
            ...config,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        this.cache = updated;

        // Dispatch event for reactive updates across components
        window.dispatchEvent(new Event('schedule-config-updated'));
    }

    /**
     * Check if a date is within the active academic term
     * Now accepts optional gradeId to check per-grade term
     */
    isDateInTerm(date: Date | string, gradeId?: number): boolean {
        const config = this.getConfig();
        let term = config.term;

        // If gradeId provided, check for grade-specific term
        if (gradeId) {
            const gradeConfig = config.gradeConfigs.find(c => c.gradeId === gradeId);
            if (gradeConfig && gradeConfig.term && gradeConfig.term.isActive) {
                term = gradeConfig.term;
            }
        }

        if (!term.isActive || !term.startDate || !term.endDate) {
            return true; // If no term is defined, assume open
        }

        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        const start = new Date(term.startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(term.endDate);
        end.setHours(23, 59, 59, 999);

        return checkDate >= start && checkDate <= end;
    }

    /**
     * Get global booking mode (fallback)
     */
    getBookingMode(): BookingMode {
        return this.getConfig().bookingMode;
    }

    /**
     * Update configuration for a specific grade
     */
    updateGradeConfig(gradeId: number, config: Partial<GradeSlotConfig>): void {
        const current = this.getConfig();
        const existingIndex = current.gradeConfigs.findIndex(c => c.gradeId === gradeId);

        // Deep merge logic if needed, but for now replace is safer for complex objects
        let newConfigs = [...current.gradeConfigs];

        if (existingIndex >= 0) {
            newConfigs[existingIndex] = { ...newConfigs[existingIndex], ...config };
        } else {
            // Initialize with defaults if creating new
            newConfigs.push({
                gradeId,
                days: {
                    0: { ...DEFAULT_DAY_CONFIG, isActive: true }, // Default Sunday active
                    1: { ...DEFAULT_DAY_CONFIG, isActive: true },
                    2: { ...DEFAULT_DAY_CONFIG, isActive: true },
                    3: { ...DEFAULT_DAY_CONFIG, isActive: true },
                    4: { ...DEFAULT_DAY_CONFIG, isActive: true },
                    5: { ...DEFAULT_DAY_CONFIG },
                    6: { ...DEFAULT_DAY_CONFIG }
                },
                ...config
            });
        }

        this.saveConfig({ gradeConfigs: newConfigs });
    }

    /**
     * Get configuration for a specific grade
     */
    getGradeConfig(gradeId: number): GradeSlotConfig | undefined {
        return this.getConfig().gradeConfigs.find(c => c.gradeId === gradeId);
    }

    /**
     * Helper to get Day Config safely
     */
    getDayConfig(gradeId: number, dayIndex: number): DayScheduleConfig {
        const gradeConfig = this.getGradeConfig(gradeId);
        if (!gradeConfig) return DEFAULT_DAY_CONFIG;
        return gradeConfig.days[dayIndex] || DEFAULT_DAY_CONFIG;
    }
}

export const frontendSettings = new FrontendSettingsService();
