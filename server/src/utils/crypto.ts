import crypto from 'crypto';

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function randomToken(bytes = 48): string {
  // URL-safe base64
  return crypto.randomBytes(bytes).toString('base64url');
}

