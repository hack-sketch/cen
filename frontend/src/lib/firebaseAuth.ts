/**
 * Firebase Authentication Client Helper
 * Provides client-side auth methods (e.g. sendPasswordResetEmail) with seamless fallback
 * to the CEN FastAPI backend /auth/forgot-password endpoint.
 */

import { authService } from "@/services";

export interface PasswordResetResult {
  success: boolean;
  message: string;
  email: string;
}

/**
 * Client-side sendPasswordResetEmail handler
 * Interacts with Firebase Auth SDK when present or delegates to CEN backend endpoint.
 *
 * @param auth Firebase Auth instance (optional/nullable)
 * @param email User email address to dispatch password reset instructions to
 */
export async function sendPasswordResetEmail(
  auth: any | null | undefined,
  email: string
): Promise<PasswordResetResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Please provide a valid email address.");
  }

  // If Firebase Auth instance with SDK method is passed, use it directly
  if (auth && typeof auth.sendPasswordResetEmail === "function") {
    try {
      await auth.sendPasswordResetEmail(cleanEmail);
      return {
        success: true,
        message: "Password reset link has been dispatched to your email address.",
        email: cleanEmail,
      };
    } catch (err: any) {
      console.warn("[Firebase Auth] sendPasswordResetEmail client error, falling back to CEN backend:", err);
      // Fall through to CEN backend service
    }
  }

  // CEN Backend Auth & Service fallback
  const response = await authService.forgotPassword(cleanEmail);
  return {
    success: true,
    message: response.message || "Password reset instructions have been dispatched to your email.",
    email: cleanEmail,
  };
}

/**
 * Direct password reset handler for demo/sandbox environments
 * Directly updates the user's password in the database so they can log in immediately.
 */
export async function resetDirectPassword(
  email: string,
  newPassword: string
): Promise<PasswordResetResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    throw new Error("Please provide a valid email address.");
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long.");
  }

  const response = await authService.resetPassword(cleanEmail, newPassword);
  return {
    success: true,
    message: response.message || "Password updated successfully! You can now log in with your new password.",
    email: cleanEmail,
  };
}

