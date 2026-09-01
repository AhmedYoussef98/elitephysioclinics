import type { HandlerContext, HandlerEvent, HandlerResponse } from '@netlify/functions';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handler as sendBookingEmail } from '../netlify/functions/send-booking-email';

/**
 * Vercel entry point for the booking notification emails.
 *
 * The booking form posts to `/.netlify/functions/send-booking-email`; on Vercel
 * that path is rewritten here by `vercel.json`. The email logic itself stays in
 * the Netlify handler so both hosts send identical mail from a single source.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel parses JSON bodies into objects; the Netlify handler expects the raw string.
  const body =
    req.body == null ? '' : typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  const event = { httpMethod: req.method ?? 'GET', body } as unknown as HandlerEvent;
  // The handler is async, so it always resolves to a response; the `void` in its
  // declared return type is the generic Netlify signature, not a real case here.
  const result = (await sendBookingEmail(event, {} as HandlerContext)) as
    | HandlerResponse
    | undefined;

  const statusCode = result?.statusCode ?? 500;
  const responseBody = typeof result?.body === 'string' ? result.body : '';
  const looksLikeJson = /^\s*[[{]/.test(responseBody);

  res.setHeader('Content-Type', looksLikeJson ? 'application/json' : 'text/plain');
  res.status(statusCode).send(responseBody);
}
