export class EmailService {
  static async sendTwoFactorCode(email: string, code: string): Promise<void> {
    const fromAddress = process.env.TWO_FA_EMAIL_FROM || "noreply@example.local";
    console.log(`[EmailService] Sending 2FA code from ${fromAddress} to ${email}: ${code}`);
  }
}