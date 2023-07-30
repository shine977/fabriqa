import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';
import { promisify } from 'util';
function getAlgorithm(keyBase64: string) {
  const key = Buffer.from(keyBase64, 'base64');
  switch (key.length) {
    case 16:
      return 'aes-128-ctr';
    case 32:
      return 'aes-256-ctr';
  }
  throw new Error('Invalid key length: ' + key.length);
}

const keyBase64 = 'DWIzFkO22qfVMgx2fIsxOXnwz10pRuZfFJBvf4RS3eY=';
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
