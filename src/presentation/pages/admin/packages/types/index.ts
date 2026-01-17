import { Node, Edge } from '@xyflow/react';

export interface PackageNodeData {
    id?: number; // Internal React Flow ID
    originalId?: number; // Backend ID
    label: string;
    description?: string;
    totalPrice: number;
    finalPrice?: number; // Price after discount
    coursesCount: number;
    // Cover image
    coverImage?: string | null; // Preview URL or saved URL
    coverImageFile?: File | null; // File for upload
    // Discount fields
    isDiscountActive?: boolean;
    discountPercentage?: number;
    discountPrice?: number; // Fixed discount price
    discountStartDate?: string;
    discountEndDate?: string;
    isDiscountValid?: boolean; // Calculated by backend
    discountAmount?: number; // How much is saved
    // For identifying the root package node
    isRoot?: boolean;
    [key: string]: unknown;
}

export interface CourseNodeData {
    label: string;
    price: number;
    originalId: number; // ID from backend
    hours?: number;
    [key: string]: unknown;
}

export interface TermNodeData {
    label: string;
    originalId: number; // ID from backend
    isFetched?: boolean; // Track if we've calculated totals for this term
    calculatedPrice?: number; // Total price of all courses in this term
    calculatedCount?: number; // Total number of courses in this term
    includedCourses?: { id: number; price: number; name: string; subject?: string }[]; // List of courses
    [key: string]: unknown;
}

export interface GradeNodeData {
    label: string;
    originalId: number; // ID from backend
    isFetched?: boolean; // Track if we've calculated totals for this grade
    calculatedPrice?: number; // Total price of all courses in all terms of this grade
    calculatedCount?: number; // Total number of courses in all terms of this grade
    includedCourses?: { id: number; price: number; name: string; subject?: string }[]; // List of courses
    [key: string]: unknown;
}

export type AppNode =
    | Node<PackageNodeData, 'packageNode'>
    | Node<CourseNodeData, 'courseNode'>
    | Node<TermNodeData, 'termNode'>
    | Node<GradeNodeData, 'gradeNode'>;

export type AppEdge = Edge;

export interface PackageBuilderState {
    nodes: AppNode[];
    edges: AppEdge[];
}
