// User entity base interface
export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface Student extends User {
  role: 'student';
  gradeId?: string;
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
