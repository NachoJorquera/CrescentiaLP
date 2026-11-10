import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, TURNSTILE_SECRET_KEY } from 'astro:env/server';
import { env } from 'cloudflare:workers';
import { sendContactMessage } from '../lib/contact';

const requiredText = (maxLength: number) => z.string().trim().min(1).max(maxLength);

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      nombre: requiredText(100),
      apellido: requiredText(100),
      email: requiredText(254).pipe(z.email()),
      mensaje: requiredText(5000),
      website: z.string().optional(),
      'cf-turnstile-response': z.string().min(1),
    }),
    handler: async (input, context) => {
      const result = await sendContactMessage(
        {
          nombre: input.nombre,
          apellido: input.apellido,
          email: input.email,
          mensaje: input.mensaje,
          website: input.website,
          turnstileToken: input['cf-turnstile-response'],
        },
        {
          turnstileSecret: TURNSTILE_SECRET_KEY,
          to: CONTACT_TO_EMAIL,
          from: CONTACT_FROM_EMAIL,
          remoteIp: context.request.headers.get('CF-Connecting-IP'),
          fetch: (url, init) => fetch(url, init),
          sendEmail: (email) => env.EMAIL.send(email),
        },
      );
      if (result.ok) return;
      throw new ActionError({ code: result.reason === 'turnstile' ? 'FORBIDDEN' : 'BAD_GATEWAY' });
    },
  }),
};
