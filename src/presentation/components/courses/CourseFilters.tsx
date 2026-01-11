// src/presentation/components/courses/CourseFilters.tsx
import { useState, useCallback, useEffect, useMemo } from 'react';
import type { CourseFilters as CourseFiltersType } from '../../../core/repositories';
import type { CourseType } from '../../../core/entities';
import { useLanguage } from '../../hooks';

interface CourseFiltersProps {
    filters: CourseFiltersType;
    onFilterChange: (filters: Partial<CourseFiltersType>) => void;
    onReset: () => void;
    grades?: Array<{ id: string; name: string }>;
    semesters?: Array<{ id: string; name: string }>;
    isLoading?: boolean;
}

const COURSE_TYPES: Array<{ value: CourseType | ''; labelEn: string; labelAr: string }> = [
    { value: '', labelEn: 'All Types', labelAr: 'كل الأنواع' },
    { value: 'academic', labelEn: 'Academic', labelAr: 'أكاديمي' },
    { value: 'non-academic', labelEn: 'Non-Academic', labelAr: 'غير أكاديمي' },
];

export function CourseFilters({
    filters,
    onFilterChange,
    onReset,
    grades = [],
    semesters = [],
    isLoading = false,
}: CourseFiltersProps) {
    const { isRTL } = useLanguage();
    const [searchValue, setSearchValue] = useState(filters.search || '');

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchValue !== filters.search) {
                onFilterChange({ search: searchValue || undefined });
            }
        }, 400);

        return () => clearTimeout(debounceTimer);
    }, [searchValue, filters.search, onFilterChange]);

    const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as CourseType | '';
        onFilterChange({ type: value || undefined });
    }, [onFilterChange]);

    const handleGradeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onFilterChange({ gradeId: value || undefined });
    }, [onFilterChange]);

    const handleSemesterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        onFilterChange({ termId: value || undefined });
    }, [onFilterChange]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    }, []);

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        onFilterChange({ search: undefined });
    }, [onFilterChange]);

    const showGradeFilter = useMemo(() => {
        return !filters.type || filters.type === 'academic';
    }, [filters.type]);

    const hasActiveFilters = useMemo(() => {
        return Boolean(filters.type || filters.gradeId || filters.termId || filters.search);
    }, [filters]);

    return (
        <div className="course-filters">
            <div className="course-filters__search">
                <div className="course-filters__search-wrapper">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="course-filters__search-icon">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={handleSearchChange}
                        placeholder={isRTL ? 'ابحث عن دورة...' : 'Search courses...'}
                        className="course-filters__search-input"
                        disabled={isLoading}
                    />
                    {searchValue && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="course-filters__search-clear"
                            aria-label={isRTL ? 'مسح البحث' : 'Clear search'}
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="course-filters__selects">
                <select
                    value={filters.type || ''}
                    onChange={handleTypeChange}
                    className="course-filters__select"
                    disabled={isLoading}
                >
                    {COURSE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                            {isRTL ? type.labelAr : type.labelEn}
                        </option>
                    ))}
                </select>

                {showGradeFilter && grades.length > 0 && (
                    <select
                        value={filters.gradeId || ''}
                        onChange={handleGradeChange}
                        className="course-filters__select"
                        disabled={isLoading}
                    >
                        <option value="">{isRTL ? 'كل الصفوف' : 'All Grades'}</option>
                        {grades.map(grade => (
                            <option key={grade.id} value={grade.id}>
                                {grade.name}
                            </option>
                        ))}
                    </select>
                )}

                {showGradeFilter && semesters.length > 0 && (
                    <select
                        value={filters.termId || ''}
                        onChange={handleSemesterChange}
                        className="course-filters__select"
                        disabled={isLoading}
                    >
                        <option value="">{isRTL ? 'كل الفصول' : 'All Semesters'}</option>
                        {semesters.map(semester => (
                            <option key={semester.id} value={semester.id}>
                                {semester.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={onReset}
                    className="course-filters__reset"
                    disabled={isLoading}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                    {isRTL ? 'إعادة ضبط' : 'Reset'}
                </button>
            )}
        </div>
    );
}
