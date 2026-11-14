export const LOGIN_ERROR_FALLBACK = "Login failed";

const MAX_MESSAGE_LENGTH = 200;

/**
 * Picks the message the login page shows for a non-OK login response.
 * Rule: `.ai/specs/S5-login-error-feedback.md`, section "Message selection".
 */
export function loginErrorMessage(body: unknown): string {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return LOGIN_ERROR_FALLBACK;
  }
  if (!Object.prototype.hasOwnProperty.call(body, "error")) {
    return LOGIN_ERROR_FALLBACK;
  }
  const value = (body as { error: unknown }).error;
  if (typeof value !== "string") return LOGIN_ERROR_FALLBACK;
  const message = value.trim();
  if (message.length < 1 || message.length > MAX_MESSAGE_LENGTH) {
    return LOGIN_ERROR_FALLBACK;
  }
  return message;
}
