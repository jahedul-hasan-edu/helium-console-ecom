import crypto from "crypto";

/**
 * Password hashing utility using crypto
 * Generates a hash using PBKDF2 algorithm
 */
export class PasswordUtil {
  private static readonly SALT_LENGTH = 32;
  private static readonly ITERATIONS = 100000;
  private static readonly DIGEST = "sha256";

  /**
   * Hash a password with a salt
   */
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(this.SALT_LENGTH).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, this.ITERATIONS, 64, this.DIGEST)
      .toString("hex");

    // Return salt + hash combined
    return `${salt}:${hash}`;
  }

  /**
   * Verify a password against its hash
   */
  static verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(":");

    if (!salt || !hash) {
      return false;
    }

    const verifyHash = crypto
      .pbkdf2Sync(password, salt, this.ITERATIONS, 64, this.DIGEST)
      .toString("hex");

    return verifyHash === hash;
  }
}
