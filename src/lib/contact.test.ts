import { describe, expect, it, vi } from 'vitest';
import { sendContactMessage, type ContactConfig, type ContactInput } from './contact';

const TURNSTILE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const visitorInput: ContactInput = {
  nombre: 'Ada',
  apellido: 'Lovelace',
  email: 'ada@example.com',
  mensaje: 'Hola, quiero una reunión.',
  turnstileToken: 'turnstile-token',
};

// Builds a config whose fetch answers siteverify with the given outcome and whose email binding accepts every message.
function configWithTurnstile(success: boolean): ContactConfig {
  return {
    turnstileSecret: 'turnstile-secret',
    to: 'inbox@example.com',
    from: 'contacto@example.com',
    remoteIp: '203.0.113.7',
    fetch: vi.fn(async () => Response.json({ success })),
    sendEmail: vi.fn(async () => ({ messageId: 'message-id' })),
  };
}

describe('sendContactMessage', () => {
  it('reports success and sends nothing when the honeypot is filled', async () => {
    const config = configWithTurnstile(true);

    const result = await sendContactMessage({ ...visitorInput, website: 'https://spam.example' }, config);

    expect(result).toEqual({ ok: true });
    expect(config.fetch).not.toHaveBeenCalled();
    expect(config.sendEmail).not.toHaveBeenCalled();
  });

  it('returns an error and sends no email when Turnstile rejects the token', async () => {
    const config = configWithTurnstile(false);

    const result = await sendContactMessage(visitorInput, config);

    expect(result).toEqual({ ok: false, reason: 'turnstile' });
    expect(vi.mocked(config.fetch).mock.calls.map(([url]) => url)).toEqual([TURNSTILE_SITEVERIFY_URL]);
    expect(config.sendEmail).not.toHaveBeenCalled();
  });

  it('sends one email that replies to the visitor', async () => {
    const config = configWithTurnstile(true);

    const result = await sendContactMessage(visitorInput, config);

    expect(result).toEqual({ ok: true });
    expect(config.sendEmail).toHaveBeenCalledOnce();
    expect(config.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'inbox@example.com', replyTo: 'ada@example.com' }),
    );
  });

  it('returns an email error when the binding rejects the message', async () => {
    const config = configWithTurnstile(true);
    vi.mocked(config.sendEmail).mockRejectedValueOnce(Object.assign(new Error('rejected'), { code: 'E_DELIVERY_FAILED' }));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await sendContactMessage(visitorInput, config);

    expect(result).toEqual({ ok: false, reason: 'email' });
  });
});
