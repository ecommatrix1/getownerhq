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

console.log('\nALL 5 TEST SUITE CATEGORIES PASSED SUCCESSFULLY!');
