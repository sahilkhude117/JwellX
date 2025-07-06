import { randomBytes } from "crypto";

export function generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
}

export function generatePasswordResetToken(): string {
    return randomBytes(32).toString('hex')
}