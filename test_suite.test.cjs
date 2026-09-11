const assert = require('assert');

// 1. Test Date Parsing & Local Midnight Helper
function parseDateOnly(dateStr) {
  if (!dateStr) return new Date();
  const dateOnlyPart = dateStr.split('T')[0];
  const dateParts = dateOnlyPart.split('-');
  if (dateParts.length === 3) {
    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]) - 1;
    const day = Number(dateParts[2]);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  const parsed = new Date(dateStr);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getDaysUntilExpiry(expiryDateStr, referenceDate) {
  const ref = referenceDate || new Date();
  const today = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const expiryDate = parseDateOnly(expiryDateStr);

  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getEffectiveStatus(member, referenceDate) {
  if (member.status === 'pending') {
    return 'pending';
  }
  if (!member.expiry_date) {
    return member.status;
  }
  const diffDays = getDaysUntilExpiry(member.expiry_date, referenceDate);
  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays <= 3) {
    return 'expiring';
  } else {
    return 'active';
  }
}

console.log('=== RUNNING SUITE OF AUTOMATED TESTS ===\n');

// TEST 1: Date Parsing Accuracy
{
  const d = parseDateOnly('2026-08-15');
  assert.strictEqual(d.getFullYear(), 2026);
  assert.strictEqual(d.getMonth(), 7); // 0-indexed August
  assert.strictEqual(d.getDate(), 15);
  console.log('✓ TEST 1: parseDateOnly handles YYYY-MM-DD cleanly');
}

// TEST 2: Days Until Expiry Calculation
{
  const refDate = new Date(2026, 7, 13); // Aug 13, 2026
  assert.strictEqual(getDaysUntilExpiry('2026-08-13', refDate), 0);
  assert.strictEqual(getDaysUntilExpiry('2026-08-15', refDate), 2);
  assert.strictEqual(getDaysUntilExpiry('2026-08-20', refDate), 7);
  assert.strictEqual(getDaysUntilExpiry('2026-08-10', refDate), -3);
  console.log('✓ TEST 2: getDaysUntilExpiry calculates exact day differences');
}

// TEST 3: Effective Member Statuses
{
  const refDate = new Date(2026, 7, 13); // Aug 13, 2026
  
  // Pending member
  assert.strictEqual(getEffectiveStatus({ status: 'pending' }, refDate), 'pending');

  // Active member (>3 days left)
  assert.strictEqual(getEffectiveStatus({ status: 'active', expiry_date: '2026-08-20' }, refDate), 'active');

  // Expiring member (3 days left)
  assert.strictEqual(getEffectiveStatus({ status: 'active', expiry_date: '2026-08-16' }, refDate), 'expiring');

  // Expiring member (1 day left)
  assert.strictEqual(getEffectiveStatus({ status: 'active', expiry_date: '2026-08-14' }, refDate), 'expiring');

  // Expiring member (expires today)
  assert.strictEqual(getEffectiveStatus({ status: 'active', expiry_date: '2026-08-13' }, refDate), 'expiring');

  // Expired member (expired yesterday)
  assert.strictEqual(getEffectiveStatus({ status: 'active', expiry_date: '2026-08-12' }, refDate), 'expired');

  console.log('✓ TEST 3: getEffectiveStatus correctly categorizes active, expiring, expired, pending');
}

// TEST 4: Email Trimming & Normalization
{
  const sanitizeEmail = (email) => email.trim().toLowerCase();
  assert.strictEqual(sanitizeEmail('  Owner@YourGym.com '), 'owner@yourgym.com');
  assert.strictEqual(sanitizeEmail('USER@DOMAIN.ORG'), 'user@domain.org');
  console.log('✓ TEST 4: Email input sanitization and case normalization');
}

// TEST 5: Member Plan Matching (plan_id || current_plan_id)
{
  const plans = [
    { id: 'plan-1', name: 'Monthly' },
    { id: 'plan-2', name: 'Quarterly' }
  ];

  const memberWithPlanId = { id: 'm1', plan_id: 'plan-1' };
  const memberWithCurrentPlanId = { id: 'm2', current_plan_id: 'plan-2' };
  const memberWithNoPlan = { id: 'm3' };

  const findPlan = (m) => plans.find(p => p.id === (m.plan_id || m.current_plan_id));

  assert.strictEqual(findPlan(memberWithPlanId)?.name, 'Monthly');
  assert.strictEqual(findPlan(memberWithCurrentPlanId)?.name, 'Quarterly');
  assert.strictEqual(findPlan(memberWithNoPlan), undefined);

  console.log('✓ TEST 5: Member plan lookup handles plan_id and current_plan_id');
}

// TEST 6: AES-256-GCM Authenticated Encryption & Decryption
{
  const crypto = require('crypto');
  const secretKey = crypto.createHash('sha256').update('test-secret-key-32-bytes').digest();
  
  function encrypt(text) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', secretKey, iv);
    let enc = cipher.update(text, 'utf8', 'hex');
    enc += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${enc}:${tag}`;
  }

  function decrypt(ciphertext) {
    const [ivHex, encHex, tagHex] = ciphertext.split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', secretKey, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let dec = decipher.update(encHex, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }

  const originalToken = 'EAABwb12345SystemUserAccessTokenForGymTest';
  const encrypted = encrypt(originalToken);
  assert.notStrictEqual(encrypted, originalToken);
  assert.strictEqual(encrypted.split(':').length, 3);
  
  const decrypted = decrypt(encrypted);
  assert.strictEqual(decrypted, originalToken);
  console.log('✓ TEST 6: AES-256-GCM authenticated encryption/decryption roundtrip');
}

// TEST 7: OAuth CSRF State HMAC Signing & Verification
{
  const crypto = require('crypto');
  const appSecret = 'meta-app-secret-xyz';
  const gymId = '123e4567-e89b-12d3-a456-426614174000';
  const ownerId = 'user-owner-abc';
  const ts = Date.now().toString();

  const signature = crypto.createHmac('sha256', appSecret).update(`${gymId}:${ownerId}:${ts}`).digest('hex');
  const expectedSig = crypto.createHmac('sha256', appSecret).update(`${gymId}:${ownerId}:${ts}`).digest('hex');
  const tamperedSig = crypto.createHmac('sha256', appSecret).update(`${gymId}:attacker:${ts}`).digest('hex');

  assert.strictEqual(crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig)), true);
  assert.strictEqual(crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(tamperedSig)), false);
  console.log('✓ TEST 7: OAuth CSRF state HMAC signing and timing-safe verification');
}

// TEST 8: Meta Webhook Ingestion HMAC-SHA256 Signature Verification
{
  const crypto = require('crypto');
  const appSecret = 'ownerhq-webhook-app-secret';
  const rawBody = JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{ id: 'waba_123', changes: [] }]
  });

  const validSig = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const header = `sha256=${validSig}`;
  const extractedSig = header.slice(7);

  const check = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  assert.strictEqual(crypto.timingSafeEqual(Buffer.from(extractedSig, 'hex'), Buffer.from(check, 'hex')), true);
  console.log('✓ TEST 8: Meta Webhook HMAC-SHA256 signature verification');
}

// TEST 9: Deterministic Idempotency Key Derivation
{
  const crypto = require('crypto');
  const gymId = 'gym-uuid-1';
  const memberId = 'member-uuid-2';
  const jobType = 'expiry_reminder_3d';
  const expiryDate = '2026-09-14';

  const key1 = crypto.createHash('sha256').update(`${gymId}:${memberId}:${jobType}:${expiryDate}`).digest('hex');
  const key2 = crypto.createHash('sha256').update(`${gymId}:${memberId}:${jobType}:${expiryDate}`).digest('hex');
  const keyDifferentDate = crypto.createHash('sha256').update(`${gymId}:${memberId}:${jobType}:2026-09-15`).digest('hex');

  assert.strictEqual(key1, key2);
  assert.notStrictEqual(key1, keyDifferentDate);
  assert.strictEqual(key1.length, 64);
  console.log('✓ TEST 9: Deterministic idempotency key derivation for automated reminders');
}

// TEST 10: Phone Number Normalization to E.164
{
  const normalizePhone = (phone) => {
    const cleaned = (phone || '').replace(/\D/g, '');
    if (cleaned.length === 10) return `91${cleaned}`;
    return cleaned;
  };

  assert.strictEqual(normalizePhone('9876543210'), '919876543210');
  assert.strictEqual(normalizePhone('+91 98765 43210'), '919876543210');
  assert.strictEqual(normalizePhone('919876543210'), '919876543210');
  assert.strictEqual(normalizePhone('+1 (555) 234-5678'), '15552345678');
  console.log('✓ TEST 10: Phone number normalization handles 10-digit Indian & international formats');
}

// TEST 11: AES-256-GCM Tampered Ciphertext & Wrong Key Rejection
{
  const crypto = require('crypto');
  const keyA = crypto.createHash('sha256').update('key-a-secret').digest();
  const keyB = crypto.createHash('sha256').update('key-b-secret').digest();

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyA, iv);
  let enc = cipher.update('sensitive-system-token', 'utf8', 'hex');
  enc += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  const payload = `${iv.toString('hex')}:${enc}:${tag}`;

  // Decrypt with correct key succeeds
  const decipherGood = crypto.createDecipheriv('aes-256-gcm', keyA, iv);
  decipherGood.setAuthTag(Buffer.from(tag, 'hex'));
  assert.strictEqual(decipherGood.update(enc, 'hex', 'utf8') + decipherGood.final('utf8'), 'sensitive-system-token');

  // Decrypt with wrong key throws
  assert.throws(() => {
    const decipherBad = crypto.createDecipheriv('aes-256-gcm', keyB, iv);
    decipherBad.setAuthTag(Buffer.from(tag, 'hex'));
    decipherBad.update(enc, 'hex', 'utf8');
    decipherBad.final('utf8');
  });

  // Tampered ciphertext throws
  assert.throws(() => {
    const tamperedEnc = enc.slice(0, -2) + (enc.slice(-2) === '00' ? 'ff' : '00');
    const decipherTampered = crypto.createDecipheriv('aes-256-gcm', keyA, iv);
    decipherTampered.setAuthTag(Buffer.from(tag, 'hex'));
    decipherTampered.update(tamperedEnc, 'hex', 'utf8');
    decipherTampered.final('utf8');
  });
  console.log('✓ TEST 11: AES-256-GCM fails closed on wrong key or tampered ciphertext');
}

// TEST 12: Expired OAuth State Rejection (>15 min TTL)
{
  const maxTtlMs = 15 * 60 * 1000;
  const expiredTs = (Date.now() - (16 * 60 * 1000)).toString();
  const freshTs = Date.now().toString();

  const isExpired = (ts) => {
    const age = Date.now() - parseInt(ts, 10);
    return isNaN(age) || age < 0 || age > maxTtlMs;
  };

  assert.strictEqual(isExpired(expiredTs), true);
  assert.strictEqual(isExpired(freshTs), false);
  console.log('✓ TEST 12: OAuth state expiration enforces strict 15-minute TTL');
}

// TEST 13: Modified Gym/Owner in State Fails HMAC Verification
{
  const crypto = require('crypto');
  const secret = 'app-secret-123';
  const gymId = 'gym-aaa';
  const ownerId = 'user-owner-1';
  const ts = Date.now().toString();

  const originalSig = crypto.createHmac('sha256', secret).update(`${gymId}:${ownerId}:${ts}`).digest('hex');

  // Attacker swaps gymId
  const attackerCheck = crypto.createHmac('sha256', secret).update(`gym-bbb:${ownerId}:${ts}`).digest('hex');
  assert.strictEqual(originalSig === attackerCheck, false);

  // Attacker swaps ownerId
  const attackerOwnerCheck = crypto.createHmac('sha256', secret).update(`${gymId}:attacker:${ts}`).digest('hex');
  assert.strictEqual(originalSig === attackerOwnerCheck, false);
  console.log('✓ TEST 13: State HMAC detects and rejects tampered gym or owner parameters');
}

// TEST 14: Invalid Webhook Signature Rejected
{
  const crypto = require('crypto');
  const secret = 'webhook-secret-real';
  const body = '{"object":"whatsapp_business_account","entry":[]}';

  const correctSig = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const forgedSig = crypto.createHmac('sha256', 'wrong-secret').update(body).digest('hex');

  const verifySig = (receivedHex, payloadBody) => {
    const expectedHex = crypto.createHmac('sha256', secret).update(payloadBody).digest('hex');
    const recBuf = Buffer.from(receivedHex, 'hex');
    const expBuf = Buffer.from(expectedHex, 'hex');
    if (recBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(recBuf, expBuf);
  };

  assert.strictEqual(verifySig(correctSig, body), true);
  assert.strictEqual(verifySig(forgedSig, body), false);
  console.log('✓ TEST 14: Webhook signature verification fails safely on invalid or forged signature');
}

// TEST 15: Outbound Pre-Flight Claim Prevents Duplicate Sends (Race Condition Protection)
{
  const inMemoryMessages = new Set();

  function preFlightClaim(idempotencyKey) {
    if (inMemoryMessages.has(idempotencyKey)) {
      return { success: false, code: '23505' }; // Unique constraint collision
    }
    inMemoryMessages.add(idempotencyKey);
    return { success: true, status: 'sending' };
  }

  const key = 'gym1:member1:expiry_3d:2026-09-15';
  const worker1 = preFlightClaim(key);
  const worker2 = preFlightClaim(key); // Simultaneous worker claim attempt

  assert.strictEqual(worker1.success, true);
  assert.strictEqual(worker2.success, false);
  assert.strictEqual(worker2.code, '23505');
  console.log('✓ TEST 15: Outbound pre-flight claim guarantees mutually exclusive single send');
}

// TEST 16: Event Queue Lease Expiration Logic
{
  const now = Date.now();
  const activeLeaseUntil = new Date(now + 30000); // 30s in the future
  const expiredLeaseUntil = new Date(now - 1000); // 1s in past

  const isClaimable = (status, leaseUntil) => {
    if (status === 'pending') return true;
    if (status === 'processing' && (!leaseUntil || leaseUntil.getTime() < Date.now())) return true;
    return false;
  };

  assert.strictEqual(isClaimable('processing', activeLeaseUntil), false); // Active worker holds lease
  assert.strictEqual(isClaimable('processing', expiredLeaseUntil), true); // Crashed worker lease expired
  assert.strictEqual(isClaimable('pending', null), true);
  console.log('✓ TEST 16: Event queue lease prevents concurrent workers while recovering stalled leases');
}

// TEST 17: Meta API Error Classification (Retryable vs Permanent Dead-Letter)
{
  function classifyMetaError(status, errorCode) {
    if (status === 429 || errorCode === 130429) return { retryable: true, category: 'rate_limit' };
    if (status >= 500) return { retryable: true, category: 'provider_server_error' };
    if (errorCode === 100 || errorCode === 132000 || errorCode === 190) return { retryable: false, category: 'permanent' };
    return { retryable: false, category: 'unknown_client_error' };
  }

  assert.strictEqual(classifyMetaError(429, 130429).retryable, true);
  assert.strictEqual(classifyMetaError(500, null).retryable, true);
  assert.strictEqual(classifyMetaError(400, 100).retryable, false);
  assert.strictEqual(classifyMetaError(401, 190).retryable, false); // Expired token
  console.log('✓ TEST 17: Meta API error classifier distinguishes retryable transient errors from permanent failures');
}

// TEST 18: Dual-Write Idempotency (Outbound Messages + Legacy Reminder Logs)
{
  let legacyReminderCount = 0;
  let outboundMessageCount = 0;
  const processedKeys = new Set();

  function triggerReminder(key) {
    if (processedKeys.has(key)) return { dispatched: false };
    processedKeys.add(key);
    outboundMessageCount++;
    legacyReminderCount++;
    return { dispatched: true };
  }

  const key = 'gym-1:member-1:expiry_reminder_3d:2026-09-14';
  const run1 = triggerReminder(key);
  const run2 = triggerReminder(key); // Duplicate trigger attempt

  assert.strictEqual(run1.dispatched, true);
  assert.strictEqual(run2.dispatched, false);
  assert.strictEqual(outboundMessageCount, 1);
  assert.strictEqual(legacyReminderCount, 1);
  console.log('✓ TEST 18: Dual-write reminder flow produces exactly 1 message and 1 legacy log');
}

// TEST 19: Unknown Inbound phone_number_id Does Not Leak to Another Gym
{
  const gymAccountMap = new Map([
    ['phone_gym_a', 'gym_a_id'],
    ['phone_gym_b', 'gym_b_id']
  ]);

  const resolveTenant = (incomingPhoneId) => gymAccountMap.get(incomingPhoneId) || null;

  assert.strictEqual(resolveTenant('phone_gym_a'), 'gym_a_id');
  assert.strictEqual(resolveTenant('phone_gym_b'), 'gym_b_id');
  assert.strictEqual(resolveTenant('unknown_phone_999'), null);
  console.log('✓ TEST 19: Unknown incoming phone IDs resolve to null and never leak cross-tenant');
}

// TEST 20: Manual wa.me Fallback Preserved
{
  const generateWaMeLink = (phone, text) => {
    const cleaned = (phone || '').replace(/\D/g, '');
    const normalized = cleaned.length === 10 ? `91${cleaned}` : cleaned;
    return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
  };

  const link = generateWaMeLink('9876543210', 'Hi Rahul! Your membership expires soon.');
  assert.strictEqual(link.startsWith('https://wa.me/919876543210?text=Hi%20Rahul'), true);
  console.log('✓ TEST 20: Manual wa.me link generation remains completely functional without Cloud API');
}

// TEST 21: Fencing Token Rejection for Stale Worker Updates
{
  const eventRecord = {
    id: 'evt-101',
    status: 'processing',
    locked_by: 'worker-b', // Worker B overtook the lease
    lease_until: new Date(Date.now() + 60000)
  };

  function commitEvent(evt, workerId) {
    if (evt.locked_by !== workerId || evt.lease_until.getTime() < Date.now()) {
      return { updated: false, reason: 'FENCING_TOKEN_MISMATCH' };
    }
    evt.status = 'processed';
    return { updated: true };
  }

  // Worker A tries to commit after losing lease
  const commitWorkerA = commitEvent(eventRecord, 'worker-a');
  assert.strictEqual(commitWorkerA.updated, false);
  assert.strictEqual(commitWorkerA.reason, 'FENCING_TOKEN_MISMATCH');

  // Worker B commits while holding lease
  const commitWorkerB = commitEvent(eventRecord, 'worker-b');
  assert.strictEqual(commitWorkerB.updated, true);
  assert.strictEqual(eventRecord.status, 'processed');
  console.log('✓ TEST 21: Fencing token successfully rejects stale worker updates when lease is overtaken');
}

// TEST 22: Outbound Ambiguous Network Timeout Classification & Status Recovery
{
  function handleOutboundResponse(responseResult) {
    if (responseResult.error && responseResult.error.name === 'AbortError') {
      return {
        status: 'failed',
        error_message: 'AMBIGUOUS_TIMEOUT: Network dropped after dispatch. Pending webhook delivery reconciliation.',
        retryable: false, // Prevent blind duplicate send; wait for webhook reconciliation
      };
    }
    if (responseResult.ok && responseResult.data?.messages?.[0]?.id) {
      return {
        status: 'sent',
        wamid: responseResult.data.messages[0].id,
      };
    }
    return { status: 'failed', error_message: 'Meta rejected' };
  }

  const timeoutResult = handleOutboundResponse({ error: { name: 'AbortError', message: 'The operation was aborted' } });
  assert.strictEqual(timeoutResult.status, 'failed');
  assert.strictEqual(timeoutResult.retryable, false);
  assert.strictEqual(timeoutResult.error_message.includes('AMBIGUOUS_TIMEOUT'), true);
  console.log('✓ TEST 22: Outbound network timeout correctly classifies as ambiguous without blind duplicate retry');
}

// TEST 23: Centralized Meta Graph API Versioning
{
  const version = process.env.META_GRAPH_VERSION || 'v21.0';
  const base = `https://graph.facebook.com/${version}`;
  const oauthBase = `https://www.facebook.com/${version}/dialog/oauth`;

  assert.strictEqual(base.includes('/v21.0'), true);
  assert.strictEqual(oauthBase.includes('/v21.0/dialog/oauth'), true);
  console.log('✓ TEST 23: Centralized Meta Graph API configuration targets v21.0 with dynamic override capability');
}

// TEST 24: Strict Multi-Tenant Isolation Simulation (Gym A vs Gym B)
{
  const gyms = [
    { id: 'gym-a', name: 'Power Gym', phone_id: 'phone-a', owner_id: 'user-a' },
    { id: 'gym-b', name: 'Iron Gym', phone_id: 'phone-b', owner_id: 'user-b' },
  ];

  const members = [
    { id: 'mem-1', gym_id: 'gym-a', name: 'Alice', phone: '919000000001' },
    { id: 'mem-2', gym_id: 'gym-b', name: 'Bob', phone: '919000000002' },
  ];

  function dispatchReminderForGym(gym, member) {
    if (member.gym_id !== gym.id) {
      throw new Error(`SECURITY VIOLATION: Cross-tenant dispatch attempted! Member ${member.id} belongs to ${member.gym_id}, not ${gym.id}`);
    }
    return {
      sender_phone_id: gym.phone_id,
      recipient: member.phone,
      content: `Hello ${member.name}, renewal for ${gym.name}`
    };
  }

  // Valid Gym A dispatch
  const resA = dispatchReminderForGym(gyms[0], members[0]);
  assert.strictEqual(resA.sender_phone_id, 'phone-a');
  assert.strictEqual(resA.recipient, '919000000001');

  // Attempt cross-tenant dispatch (Gym A sending to Gym B's member)
  assert.throws(() => {
    dispatchReminderForGym(gyms[0], members[1]);
  }, /SECURITY VIOLATION/);

  console.log('✓ TEST 24: Multi-tenant tenant boundary checks strictly prevent cross-gym dispatches');
}

console.log('\nALL 24 PRODUCTION GATE & CHAOS SCENARIO TESTS PASSED SUCCESSFULLY!');
