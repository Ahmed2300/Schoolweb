import type { User, Student, Teacher, Parent, Admin } from '../entities';

export interface LoginCredentials {
    emailOrPhone: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: 'student' | 'parent';
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
}

export interface IAuthRepository {
    login(credentials: LoginCredentials): Promise<AuthResponse>;
    register(data: RegisterData): Promise<AuthResponse>;
    logout(): Promise<void>;
    refreshToken(token: string): Promise<AuthResponse>;
    sendOtp(email: string): Promise<void>;
    verifyOtp(email: string, otp: string): Promise<boolean>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<void>;
    getCurrentUser(): Promise<User | null>;
    updateProfile(data: Partial<User>): Promise<User>;
}

export interface IStudentRepository {
    getStudent(id: string): Promise<Student>;
    updateStudent(id: string, data: Partial<Student>): Promise<Student>;
    getByParentId(parentId: string): Promise<Student[]>;
}

export interface ITeacherRepository {
    getTeacher(id: string): Promise<Teacher>;
    updateTeacher(id: string, data: Partial<Teacher>): Promise<Teacher>;
    getTeachers(): Promise<Teacher[]>;
}

export interface IParentRepository {
    getParent(id: string): Promise<Parent>;
    linkChild(parentId: string, studentCode: string): Promise<void>;
    unlinkChild(parentId: string, childId: string): Promise<void>;
    getChildren(parentId: string): Promise<Student[]>;
}
