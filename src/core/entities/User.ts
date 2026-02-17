// User entity base interface
export interface User {
  id: string | number;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  image_path?: string | null; // From backend teacher profile
  address?: string | null;
  phoneNumber?: string;
  country_id?: number;
  city_id?: number;
  gradeId?: number;
  teacher_id?: number; // When user is a teacher, this is their teacher record ID
  updatedAt: Date;
}

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface Student extends User {
  role: 'student';
  uid?: string; // Unique identifier (STD-YYYY-XXXXXX)
  gradeId?: number;
  termId?: string;
  parentId?: string;
  studentCode: string;
}

export interface Parent extends User {
  role: 'parent';
  childrenIds: string[];
}

export interface Teacher extends User {
  role: 'teacher';
  bio?: string;
  specialization?: string;
  courseIds: string[];
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}
