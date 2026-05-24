# helium-console-ecom

## Free email setup for forgot password

This project sends forgot-password and 2FA emails through SMTP.

Set these environment variables:

- NEXT_PUBLIC_SMTP_HOST
- NEXT_PUBLIC_SMTP_PORT
- NEXT_PUBLIC_SMTP_SECURE
- NEXT_PUBLIC_SMTP_USER
- NEXT_PUBLIC_SMTP_PASS
- NEXT_PUBLIC_SMTP_FROM
- NEXT_PUBLIC_TWO_FA_EMAIL_FROM (optional override)
- NEXT_PUBLIC_PASSWORD_RESET_EMAIL_FROM (optional override)

### Recommended free provider: Brevo (reliable free tier)

Brevo gives a free transactional SMTP tier (daily cap) and works well for password reset emails.

Example .env values:

NEXT_PUBLIC_SMTP_HOST=smtp-relay.brevo.com
NEXT_PUBLIC_SMTP_PORT=587
NEXT_PUBLIC_SMTP_SECURE=false
NEXT_PUBLIC_SMTP_USER=your_brevo_login
NEXT_PUBLIC_SMTP_PASS=your_brevo_smtp_key
NEXT_PUBLIC_SMTP_FROM=your_verified_sender@yourdomain.com
NEXT_PUBLIC_TWO_FA_EMAIL_FROM=your_verified_sender@yourdomain.com
NEXT_PUBLIC_PASSWORD_RESET_EMAIL_FROM=your_verified_sender@yourdomain.com

### Alternative free provider: Gmail SMTP

You can also use Gmail with an App Password (requires 2FA on your Google account).

Example .env values:

NEXT_PUBLIC_SMTP_HOST=smtp.gmail.com
NEXT_PUBLIC_SMTP_PORT=587
NEXT_PUBLIC_SMTP_SECURE=false
NEXT_PUBLIC_SMTP_USER=yourgmail@gmail.com
NEXT_PUBLIC_SMTP_PASS=your_16_char_app_password
NEXT_PUBLIC_SMTP_FROM=yourgmail@gmail.com

After setting env values, restart the server.
