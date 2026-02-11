import prisma from '../prisma/client';
import { sendEmail } from './email.service';
import { sendPushToTokens } from './push.service';

function defaultPrefs(clienteId: number) {
  return {
    usuarioId: String(clienteId),
    canalesActivos: { email: true, push: true, sms: false, in_app: true },
  };
}

function getCanalesActivos(prefs: any): { email: boolean; push: boolean; sms: boolean; in_app: boolean } {
  const ca = prefs?.canalesActivos || {};
  return {
    email: Boolean(ca.email),
    push: Boolean(ca.push),
    sms: Boolean(ca.sms),
    in_app: Boolean(ca.in_app),
  };
}

export async function deliverNotification(params: {
  clienteId: number;
  titulo: string;
  mensaje: string;
  // optional metadata
  data?: Record<string, string>;
}) {
  const cliente = await prisma.cliente.findUnique({ where: { id: params.clienteId } });
  if (!cliente) return { ok: false as const, error: 'CLIENT_NOT_FOUND' as const };

  let prefsRow = await prisma.notificacionPreferencias.findUnique({ where: { clienteId: params.clienteId } });
  if (!prefsRow) {
    prefsRow = await prisma.notificacionPreferencias.create({
      data: { clienteId: params.clienteId, data: defaultPrefs(params.clienteId) as any },
    });
  }
  const prefs = prefsRow.data as any;
  const canales = getCanalesActivos(prefs);

  const result: any = {
    ok: true,
    attempted: { email: canales.email, push: canales.push },
    sent: { email: false, push: false },
    skipped: {},
  };

  if (canales.email) {
    const emailRes = await sendEmail({
      to: cliente.email,
      subject: params.titulo,
      text: params.mensaje,
    });
    if ((emailRes as any).skipped) result.skipped.email = (emailRes as any).reason;
    else result.sent.email = true;
  }

  if (canales.push) {
    const tokens = await prisma.pushDeviceToken.findMany({
      where: { clienteId: params.clienteId, revokedEn: null },
      select: { token: true },
    });
    const tokenList = tokens.map((t) => t.token);

    const pushRes = await sendPushToTokens({
      tokens: tokenList,
      title: params.titulo,
      body: params.mensaje,
      data: params.data,
    });

    if (!pushRes.ok) {
      result.skipped.push = pushRes.reason;
    } else {
      result.sent.push = pushRes.successCount > 0;
      if (pushRes.invalidTokens.length) {
        // Revoke invalid tokens
        await prisma.pushDeviceToken.updateMany({
          where: { token: { in: pushRes.invalidTokens } },
          data: { revokedEn: new Date() },
        });
        result.revokedInvalidTokens = pushRes.invalidTokens.length;
      }
    }
  }

  return result;
}

