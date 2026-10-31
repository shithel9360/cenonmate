import test from 'node:test';
import assert from 'node:assert';
import { createAdminToken, verifyAdminToken } from '../lib/adminAuth.ts';

test('adminAuth - token lifecycle and signature verification', () => {
  process.env.ADMIN_SESSION_SECRET = 'test_secret_for_unit_tests_32chars_long';

  const version = 1;
  const token = createAdminToken(version);
  assert.ok(token.includes('.'));

  // Valid token with matching version
  assert.strictEqual(verifyAdminToken(token, version), true);

  // Invalidation when version mismatches (password changed)
  assert.strictEqual(verifyAdminToken(token, 2), false);

  // Tampered payload
  const [b64, sig] = token.split('.');
  const tamperedPayload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + 100000, version: 1 })).toString('base64url');
  assert.strictEqual(verifyAdminToken(`${tamperedPayload}.${sig}`, version), false);

  // Tampered signature
  assert.strictEqual(verifyAdminToken(`${b64}.forgedsignature`, version), false);

  // Invalid formats
  assert.strictEqual(verifyAdminToken(null, version), false);
  assert.strictEqual(verifyAdminToken('', version), false);
  assert.strictEqual(verifyAdminToken('no-dot-token', version), false);
});
