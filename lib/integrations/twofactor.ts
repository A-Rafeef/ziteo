import 'server-only';
import { ApiError } from '@/app/server/validation';
import { requiredEnv } from '@/lib/env';

type TwoFactorResult = { Status?: string; Details?: string };

export function normalizeIndianPhone(value: string): string {
  const digits = value.replace(/[\s()+-]/g, '');
  const local = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) throw new ApiError('Enter a valid Indian mobile number.');
  return `91${local}`;
}

async function call(path: string[]): Promise<TwoFactorResult> {
  // This legacy provider places the key in the URL. Never log URLs or provider responses.
  const key = requiredEnv('TWOFACTOR_API_KEY');
  try {
    const response = await fetch(`https://2factor.in/API/V1/${encodeURIComponent(key)}/${path.map(encodeURIComponent).join('/')}`, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    const result = await response.json() as TwoFactorResult;
    if (!response.ok) throw new Error('Provider unavailable');
    return result;
  } catch {
    throw new ApiError('Phone verification is temporarily unavailable. Please try again shortly.', 503);
  }
}

export async function sendPhoneCode(phone: string, channel: unknown = 'sms'): Promise<string> {
  if (channel !== 'sms') throw new ApiError('WhatsApp verification needs an approved 2Factor authentication template. Use SMS for now.', 503);
  const path = ['SMS', normalizeIndianPhone(phone), 'AUTOGEN'];
  if (process.env.TWOFACTOR_SMS_TEMPLATE) path.push(process.env.TWOFACTOR_SMS_TEMPLATE);
  const result = await call(path);
  if (result.Status !== 'Success' || typeof result.Details !== 'string' || !result.Details || result.Details.length > 200) {
    throw new ApiError('We could not send a verification code. Please try again shortly.', 503);
  }
  return result.Details;
}

export async function verifyPhoneCode(sessionId: string, code: unknown): Promise<boolean> {
  if (typeof code !== 'string' || !/^\d{4,6}$/.test(code)) throw new ApiError('Enter the verification code from your message.');
  const result = await call(['SMS', 'VERIFY', sessionId, code]);
  return result.Status === 'Success' && result.Details === 'OTP Matched';
}
