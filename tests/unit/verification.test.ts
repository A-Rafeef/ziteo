import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeIndianPhone, sendPhoneCode, verifyPhoneCode } from '@/lib/integrations/twofactor';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('store phone verification', () => {
  it('normalizes the same Indian store phone across formatting and rejects malformed/international numbers', () => {
    for (const value of ['9876543210', '+91 98765 43210', '919876543210']) expect(normalizeIndianPhone(value)).toBe('919876543210');
    for (const value of ['', '1234567890', '+1 9876543210', '9198765432100', '9876543210<script>']) expect(() => normalizeIndianPhone(value)).toThrow();
  });
  it('sends only through the approved SMS contract and retains the provider session on the server', async () => {
    vi.stubEnv('TWOFACTOR_API_KEY', 'server-secret'); vi.stubEnv('TWOFACTOR_SMS_TEMPLATE', 'ZITEO_VERIFY');
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ Status: 'Success', Details: 'private-session' })); vi.stubGlobal('fetch', fetchMock);
    await expect(sendPhoneCode('9876543210', 'sms')).resolves.toBe('private-session');
    expect(fetchMock.mock.calls[0][0]).toBe('https://2factor.in/API/V1/server-secret/SMS/919876543210/AUTOGEN/ZITEO_VERIFY');
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  });
  it('does not silently route WhatsApp requests to an invented API', async () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    await expect(sendPhoneCode('9876543210', 'whatsapp')).rejects.toThrow('approved 2Factor');
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('requires both Status Success and OTP Matched before marking a challenge verified', async () => {
    vi.stubEnv('TWOFACTOR_API_KEY', 'test-key');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ Status: 'Success', Details: 'OTP Matched' }))
      .mockResolvedValueOnce(Response.json({ Status: 'Success', Details: 'OTP Mismatch' }))
      .mockResolvedValueOnce(Response.json({ Status: 'Error', Details: 'OTP Matched' })); vi.stubGlobal('fetch', fetchMock);
    await expect(verifyPhoneCode('session', '123456')).resolves.toBe(true);
    await expect(verifyPhoneCode('session', '123456')).resolves.toBe(false);
    await expect(verifyPhoneCode('session', '123456')).resolves.toBe(false);
  });
  it('fails closed on provider errors and rejects malformed codes before network calls', async () => {
    vi.stubEnv('TWOFACTOR_API_KEY', 'test-key');
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ Status: 'Success', Details: 'OTP Matched' }, { status: 503 })); vi.stubGlobal('fetch', fetchMock);
    await expect(verifyPhoneCode('session', 'not-a-code')).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(verifyPhoneCode('session', '123456')).rejects.toThrow('temporarily unavailable');
  });
});
