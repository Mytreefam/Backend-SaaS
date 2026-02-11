import fs from 'fs';
import admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

function loadServiceAccount(): admin.ServiceAccount | null {
  const b64 = String(process.env.FCM_SERVICE_ACCOUNT_JSON_BASE64 || '').trim();
  const filePath = String(process.env.FCM_SERVICE_ACCOUNT_PATH || '').trim();

  try {
    if (b64) {
      const json = Buffer.from(b64, 'base64').toString('utf8');
      return JSON.parse(json);
    }
    if (filePath) {
      const json = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(json);
    }
  } catch {
    return null;
  }

  return null;
}

function getFirebaseApp(): admin.app.App | null {
  if (firebaseApp) return firebaseApp;

  const sa = loadServiceAccount();
  if (!sa) return null;

  try {
    firebaseApp = admin.initializeApp({ credential: admin.credential.cert(sa) });
  } catch {
    // If already initialized by something else, reuse default app
    try {
      firebaseApp = admin.app();
    } catch {
      firebaseApp = null;
    }
  }

  return firebaseApp;
}

export async function sendPushToTokens(params: {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<
  | { ok: true; successCount: number; failureCount: number; invalidTokens: string[] }
  | { ok: false; skipped: true; reason: 'PUSH_NOT_CONFIGURED' }
> {
  if (!params.tokens.length) return { ok: true, successCount: 0, failureCount: 0, invalidTokens: [] };

  const app = getFirebaseApp();
  if (!app) return { ok: false, skipped: true, reason: 'PUSH_NOT_CONFIGURED' };

  const messaging = admin.messaging(app);
  const res = await messaging.sendEachForMulticast({
    tokens: params.tokens,
    notification: { title: params.title, body: params.body },
    data: params.data,
  });

  const invalidTokens: string[] = [];
  res.responses.forEach((r, idx) => {
    if (!r.success) {
      const code = (r.error as any)?.code as string | undefined;
      if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
        invalidTokens.push(params.tokens[idx]);
      }
    }
  });

  return {
    ok: true,
    successCount: res.successCount,
    failureCount: res.failureCount,
    invalidTokens,
  };
}

