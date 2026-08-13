const assert = require('assert');

function getEffectiveStatus(member) {
  if (member.status === 'pending') return 'pending';
  if (!member.expiry_date) return member.status;

  const now = new Date('2026-08-08T12:00:00Z'); // Mock today
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const expiry = new Date(member.expiry_date);
  const expiryDate = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());

  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  else if (diffDays <= 3) return 'expiring';
  else return 'active';
}

console.log(getEffectiveStatus({ status: 'active', expiry_date: '2026-08-08' })); // expiring
console.log(getEffectiveStatus({ status: 'active', expiry_date: '2026-08-09' })); // expiring
console.log(getEffectiveStatus({ status: 'active', expiry_date: '2026-08-10' })); // expiring
console.log(getEffectiveStatus({ status: 'active', expiry_date: '2026-08-11' })); // expiring
console.log(getEffectiveStatus({ status: 'active', expiry_date: '2026-08-12' })); // active
console.log(getEffectiveStatus({ status: 'active', expiry_date: '2026-08-07' })); // expired
console.log(getEffectiveStatus({ status: 'active', expiry_date: '2026-08-20' })); // active
