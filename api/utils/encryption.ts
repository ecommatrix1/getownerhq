import crypto from 'crypto';

/**
 * Enterprise AES-256-GCM Encryption / Decryption Utility
 * Encrypts sensitive secrets (such as Meta WhatsApp Access Tokens)
 * with an authenticated cipher, random 12-byte IV, and 16-byte Auth Tag.
 */

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET || process.env.META_APP_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Critical Security Error: ENCRYPTION_SECRET environment variable is missing in production.'
      );
    }
    // Local development fallback only
    return crypto.createHash('sha256').update('ownerhq-local-dev-secret-do-not-use-in-prod').digest();
  }

  // Always derive exact 32 bytes via SHA-256
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptSecret(plaintext: string): string {
  if (!plaintext) return '';
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  // Format: iv:encrypted:authTag (all hex encoded)
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

export function decryptSecret(ciphertext: string): string {
  if (!ciphertext) return '';
  // Check if string matches iv:encrypted:authTag format
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    // Return as-is if unencrypted or legacy
    return ciphertext;
  }

  try {
    const [ivHex, encryptedHex, authTagHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err: any) {
    console.error('[Encryption] Decryption failed (tampered ciphertext or invalid key):', err.message);
    throw new Error('Failed to decrypt secret: Authentication tag mismatch or corrupted data.');
  }
}
