import nodemailer from 'nodemailer';

type EmailConfig =
  | { mode: 'url'; url: string; from: string }
  | { mode: 'smtp'; host: string; port: number; secure: boolean; user?: string; pass?: string; from: string };

let transporter: nodemailer.Transporter | null = null;
let cachedConfigKey: string | null = null;

function getEmailConfig(): EmailConfig | null {
  const from = String(process.env.EMAIL_FROM || '').trim();
  const url = String(process.env.SMTP_URL || '').trim();

  if (url && from) {
    return { mode: 'url', url, from };
  }

  const host = String(process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 0);
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const user = String(process.env.SMTP_USER || '').trim();
  const pass = String(process.env.SMTP_PASS || '').trim();

  if (!host || !port || !from) return null;
  return { mode: 'smtp', host, port, secure, user: user || undefined, pass: pass || undefined, from };
}

function configKey(cfg: EmailConfig): string {
  if (cfg.mode === 'url') return `url:${cfg.url}|from:${cfg.from}`;
  return `smtp:${cfg.host}:${cfg.port}:${cfg.secure}:${cfg.user || ''}|from:${cfg.from}`;
}

function getTransporter(): { transporter: nodemailer.Transporter; from: string } | null {
  const cfg = getEmailConfig();
  if (!cfg) return null;

  const key = configKey(cfg);
  if (!transporter || cachedConfigKey !== key) {
    cachedConfigKey = key;
    transporter =
      cfg.mode === 'url'
        ? nodemailer.createTransport(cfg.url)
        : nodemailer.createTransport({
            host: cfg.host,
            port: cfg.port,
            secure: cfg.secure,
            auth: cfg.user && cfg.pass ? { user: cfg.user, pass: cfg.pass } : undefined,
          });
  }

  return { transporter, from: cfg.from };
}

export async function sendEmail(params: { to: string; subject: string; text: string; html?: string }) {
  const t = getTransporter();
  if (!t) {
    return { ok: false as const, skipped: true as const, reason: 'EMAIL_NOT_CONFIGURED' as const };
  }

  await t.transporter.sendMail({
    from: t.from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });

  return { ok: true as const };
}

