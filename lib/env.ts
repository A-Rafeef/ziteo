import 'server-only';

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}

export function appUrl(): string {
  const value = requiredEnv('NEXT_PUBLIC_APP_URL');
  const url = new URL(value);
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('App URL must use HTTPS');
  return url.origin;
}
