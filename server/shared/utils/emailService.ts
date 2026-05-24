import nodemailer, { type Transporter } from "nodemailer";

interface EmailPayload {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

function readSmtpConfig() {
  const host = process.env.NEXT_PUBLIC_SMTP_HOST?.trim();
  const user = process.env.NEXT_PUBLIC_SMTP_USER?.trim();
  const pass = process.env.NEXT_PUBLIC_SMTP_PASS?.trim();
  const port = Number(process.env.NEXT_PUBLIC_SMTP_PORT || "587");
  const secureFromEnv = process.env.NEXT_PUBLIC_SMTP_SECURE;
  const secure = secureFromEnv ? secureFromEnv === "true" : port === 465;

  if (!host || !user || !pass || Number.isNaN(port)) {
    return null;
  }

  return {
    host,
    user,
    pass,
    port,
    secure,
  };
}

export class EmailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    const smtpConfig = readSmtpConfig();
    if (!smtpConfig) {
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });

    return this.transporter;
  }

  private static async sendMail(payload: EmailPayload): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) {
      console.warn("[EmailService] SMTP is not configured. Set NEXT_PUBLIC_SMTP_HOST, NEXT_PUBLIC_SMTP_PORT, NEXT_PUBLIC_SMTP_SECURE, NEXT_PUBLIC_SMTP_USER, and NEXT_PUBLIC_SMTP_PASS.");
      console.log(`[EmailService] Email fallback (not sent) to ${payload.to} | subject: ${payload.subject} | text: ${payload.text}`);
      return;
    }

    try {
      await transporter.sendMail({
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      });
    } catch {
      throw new Error("Email delivery failed");
    }
  }

  static async sendTwoFactorCode(email: string, code: string): Promise<void> {
    const fromAddress = process.env.NEXT_PUBLIC_TWO_FA_EMAIL_FROM || process.env.NEXT_PUBLIC_SMTP_FROM || "noreply@example.local";

    await this.sendMail({
      to: email,
      from: fromAddress,
      subject: "Your Helium verification code",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>This code expires in 10 minutes.</p>`,
    });
  }

  static async sendPasswordResetLink(email: string, resetUrl: string): Promise<void> {
    const fromAddress =
      process.env.NEXT_PUBLIC_PASSWORD_RESET_EMAIL_FROM ||
      process.env.NEXT_PUBLIC_SMTP_FROM ||
      process.env.NEXT_PUBLIC_TWO_FA_EMAIL_FROM ||
      "noreply@example.local";

    await this.sendMail({
      to: email,
      from: fromAddress,
      subject: "Reset your Helium password",
      text: `Use this link to reset your password: ${resetUrl} . The link expires soon.`,
      html: `<p>Use the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`,
    });
  }
}