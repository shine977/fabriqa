import { createCipheriv, createDecipheriv } from 'crypto';

const key = 'e3a74e3c7599f3ab4601d587bd2cc768';
const iv = '4601d587bd2cc768';

export function encryptData(plainText) {
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  return cipher.update(plainText, 'binary', 'hex') + cipher.final('hex');
}

export function decryptData(crypted) {
  crypted = Buffer.from(crypted, 'hex').toString('binary');
  const decipher = createDecipheriv('aes-256-cbc', key, iv);
  return decipher.update(crypted, 'binary', 'utf8') + decipher.final('utf8');
}
