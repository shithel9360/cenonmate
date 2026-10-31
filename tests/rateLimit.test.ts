import test from 'node:test';
import assert from 'node:assert';
import { checkRateLimit, getClientIp } from '../lib/rateLimit.ts';

test('rateLimit - extracts client IP correctly from headers', () => {
  const reqWithRealIp = new Request('https://cenonmate.com/api/test', {
    headers: { 'x-real-ip': '203.0.113.195' }
  });
  assert.strictEqual(getClientIp(reqWithRealIp), '203.0.113.195');

  const reqWithCfIp = new Request('https://cenonmate.com/api/test', {
    headers: { 'cf-connecting-ip': '198.51.100.42' }
  });
  assert.strictEqual(getClientIp(reqWithCfIp), '198.51.100.42');

  const reqWithForwarded = new Request('https://cenonmate.com/api/test', {
    headers: { 'x-forwarded-for': '192.0.2.1, 10.0.0.1' }
  });
  assert.strictEqual(getClientIp(reqWithForwarded), '192.0.2.1');

  const reqFallback = new Request('https://cenonmate.com/api/test');
  assert.strictEqual(getClientIp(reqFallback), '127.0.0.1');
});

test('rateLimit - enforces max limit within time window', async () => {
  const ip = '10.0.0.99';
  const action = 'test_action';
  const options = { windowMs: 1000, max: 3 };

  // First 3 should pass
  assert.strictEqual(await checkRateLimit(ip, action, options), true);
  assert.strictEqual(await checkRateLimit(ip, action, options), true);
  assert.strictEqual(await checkRateLimit(ip, action, options), true);

  // 4th should be blocked
  assert.strictEqual(await checkRateLimit(ip, action, options), false);
});
