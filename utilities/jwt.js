import jwt from "jsonwebtoken";

/**
 * TokenBlacklist class to track blacklisted JWTs and cleanup expired tokens.
 */
export class TokenBlacklist {
  constructor() {
    this.tokens = new Map(); // token string => expiration timestamp
    this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000); // every 10 min
  }

  add(token) {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      throw new Error("Invalid token: cannot decode expiration");
    }
    this.tokens.set(token, decoded.exp * 1000);
  }

  has(token) {
    const expiresAt = this.tokens.get(token);
    if (!expiresAt) return false;

    if (Date.now() > expiresAt) {
      this.tokens.delete(token);
      return false;
    }
    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [token, expiresAt] of this.tokens.entries()) {
      if (expiresAt < now) {
        this.tokens.delete(token);
      }
    }
  }

  stop() {
    clearInterval(this.cleanupInterval);
  }
}
