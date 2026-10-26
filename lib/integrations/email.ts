import 'server-only';
import { Resend } from 'resend';
import { requiredEnv } from '@/lib/env';

// Auth confirmation and recovery mail use Resend SMTP configured in Supabase.
export async function sendTransactionalEmail(to: string, subject: string, text: string, idempotencyKey: string) {
  const resend = new Resend(requiredEnv('RESEND_API_KEY'));
  const {data, error} = await resend.emails.send({ from: requiredEnv('RESEND_FROM_EMAIL'), to, subject, text }, { idempotencyKey });
  if (error) throw new Error(`Email provider failed: ${error.name}`);
  return data;
}
