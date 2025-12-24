import type { IAuthRepository, LoginCredentials, RegisterData, AuthResponse } from '../repositories';
import type { User } from '../entities';

// Use case for user login
export class LoginUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(credentials: LoginCredentials): Promise<AuthResponse> {
        if (!credentials.emailOrPhone || !credentials.password) {
            throw new Error('Email/phone and password are required');
        }
        return this.authRepository.login(credentials);
    }
}

// Use case for user registration
export class RegisterUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(data: RegisterData): Promise<AuthResponse> {
        if (!data.email || !data.password || !data.name || !data.phone) {
            throw new Error('All fields are required');
        }
        return this.authRepository.register(data);
    }
}

// Use case for user logout
export class LogoutUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(): Promise<void> {
        return this.authRepository.logout();
    }
}

// Use case for getting current user
export class GetCurrentUserUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(): Promise<User | null> {
        return this.authRepository.getCurrentUser();
    }
}

// Use case for updating user profile
export class UpdateProfileUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async execute(data: Partial<User>): Promise<User> {
        return this.authRepository.updateProfile(data);
    }
}

// Use case for password reset flow
export class ResetPasswordUseCase {
    constructor(private authRepository: IAuthRepository) { }

    async sendOtp(email: string): Promise<void> {
        if (!email) throw new Error('Email is required');
        return this.authRepository.sendOtp(email);
    }

    async verifyOtp(email: string, otp: string): Promise<boolean> {
        return this.authRepository.verifyOtp(email, otp);
    }

    async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
        if (!newPassword || newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
        return this.authRepository.resetPassword(email, otp, newPassword);
    }
}
