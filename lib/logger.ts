import 'server-only';
import { after } from 'next/server';

type Level = 'info' | 'warn' | 'error';
type SafeContext = { requestId?: string; route?: string; status?: number; durationMs?: number; code?: string };
export function log(level: Level, message: string, context: SafeContext = {}) {
  const entry = { dt: new Date().toISOString(), level, message, ...context, service: 'ziteo', release: process.env.VERCEL_GIT_COMMIT_SHA };
  console[level](JSON.stringify(entry));
  const host = process.env.BETTER_STACK_INGESTING_HOST;
  const token = process.env.BETTER_STACK_SOURCE_TOKEN;
  if (!host || !token) return;
  const url = new URL(host.startsWith('https://') ? host : `https://${host}`);
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.betterstackdata.com')) return;
  after(async () => {
    try { await fetch(url, { method:'POST', headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body:JSON.stringify(entry), signal:AbortSignal.timeout(5000) }); }
    catch { console.error('Log delivery failed'); }
  });
}
