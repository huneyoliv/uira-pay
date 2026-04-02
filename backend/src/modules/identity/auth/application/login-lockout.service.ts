import { Injectable, Logger } from '@nestjs/common';

interface LockoutEntry {
    attempts: number;
    lockedUntil: number | null;
    lastAttempt: number;
}

@Injectable()
export class LoginLockoutService {
    private readonly logger = new Logger(LoginLockoutService.name);
    private readonly lockouts = new Map<string, LockoutEntry>();

    private readonly MAX_ATTEMPTS = 5;
    private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
    private readonly ATTEMPT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

    isLocked(email: string): { locked: boolean; remainingMs?: number } {
        const entry = this.lockouts.get(email.toLowerCase());
        if (!entry || !entry.lockedUntil) return { locked: false };

        const now = Date.now();
        if (now >= entry.lockedUntil) {
            this.lockouts.delete(email.toLowerCase());
            return { locked: false };
        }

        return { locked: true, remainingMs: entry.lockedUntil - now };
    }

    recordFailedAttempt(email: string): { locked: boolean; attemptsRemaining: number } {
        const key = email.toLowerCase();
        const now = Date.now();
        let entry = this.lockouts.get(key);

        if (!entry || (now - entry.lastAttempt) > this.ATTEMPT_WINDOW_MS) {
            entry = { attempts: 0, lockedUntil: null, lastAttempt: now };
        }

        entry.attempts++;
        entry.lastAttempt = now;

        if (entry.attempts >= this.MAX_ATTEMPTS) {
            entry.lockedUntil = now + this.LOCKOUT_DURATION_MS;
            this.logger.warn(`Account locked due to failed attempts: ${email}`);
        }

        this.lockouts.set(key, entry);

        return {
            locked: entry.lockedUntil !== null,
            attemptsRemaining: Math.max(0, this.MAX_ATTEMPTS - entry.attempts),
        };
    }

    recordSuccessfulLogin(email: string): void {
        this.lockouts.delete(email.toLowerCase());
    }

    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.lockouts.entries()) {
            if (entry.lockedUntil && now >= entry.lockedUntil) {
                this.lockouts.delete(key);
            } else if ((now - entry.lastAttempt) > this.ATTEMPT_WINDOW_MS) {
                this.lockouts.delete(key);
            }
        }
    }
}
