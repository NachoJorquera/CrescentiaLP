export interface ContactInput {
  nombre: string;
  apellido: string;
  email: string;
  mensaje: string;
  website?: string;
  turnstileToken: string;
}

export interface ContactEmail {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}

export interface ContactConfig {
  turnstileSecret: string;
  to: string;
  from: string;
  remoteIp: string | null;
  fetch: (url: string, init: RequestInit) => Promise<Response>;
  // Sends through the Worker's send_email binding, which throws an error carrying a `code` on failure.
  sendEmail: (email: ContactEmail) => Promise<unknown>;
}

export type ContactResult = { ok: true } | { ok: false; reason: 'turnstile' | 'email' };

const TURNSTILE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Delivers a contact form message by email after the honeypot and Turnstile checks.
// A filled honeypot returns success without sending, so bots get no signal.
export async function sendContactMessage(input: ContactInput, config: ContactConfig): Promise<ContactResult> {
  if (input.website) return { ok: true };
  if (!(await verifyTurnstileToken(input.turnstileToken, config))) return { ok: false, reason: 'turnstile' };
  if (!(await sendEmail(input, config))) return { ok: false, reason: 'email' };
  return { ok: true };
}

async function verifyTurnstileToken(token: string, config: ContactConfig): Promise<boolean> {
  const response = await config.fetch(TURNSTILE_SITEVERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: config.turnstileSecret,
      response: token,
      ...(config.remoteIp && { remoteip: config.remoteIp }),
    }),
  });
  const verification = response.ok ? ((await response.json()) as { success: boolean }) : { success: false };
  if (!verification.success) console.warn(`Turnstile verification failed with status ${response.status}`);
  return verification.success;
}

async function sendEmail(input: ContactInput, config: ContactConfig): Promise<boolean> {
  const visitorName = `${input.nombre} ${input.apellido}`.replace(/\s+/g, ' ');
  try {
    await config.sendEmail({
      from: config.from,
      to: config.to,
      replyTo: input.email,
      subject: `Mensaje de contacto de ${visitorName}`,
      text: [
        `Nombre: ${input.nombre}`,
        `Apellido: ${input.apellido}`,
        `Correo: ${input.email}`,
        '',
        input.mensaje,
      ].join('\n'),
    });
    return true;
  } catch (error) {
    console.error(`Email binding rejected the email with code ${errorCode(error)}`);
    return false;
  }
}

// Reads the `code` the send_email binding attaches to its errors, such as E_DELIVERY_FAILED.
function errorCode(error: unknown): string {
  if (error instanceof Error && 'code' in error) return String(error.code);
  return 'unknown';
}
