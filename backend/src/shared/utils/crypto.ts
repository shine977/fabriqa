import { createCipheriv, createDecipheriv } from 'crypto';

import * as crypto from 'crypto';
import { Request, Response } from 'express';

const key = 'e3a74e3c7599f3ab4601d587bd2cc768';
const iv = '4601d587bd2cc768';

// export function encryptData(plainText) {
//   const cipher = createCipheriv('aes-256-cbc', key);
//   return cipher.update(plainText, 'binary', 'hex') + cipher.final('hex');
// }

// export function decryptData(crypted) {
//   crypted = Buffer.from(crypted, 'hex').toString('binary');
//   const decipher = createDecipheriv('aes-256-cbc', key, iv);
//   return decipher.update(crypted, 'binary', 'utf8') + decipher.final('utf8');
// }


export function generateBase64Key() {
  return crypto.randomBytes(32).toString('base64')
}

export function generateIV() {
  return crypto.randomBytes(16);   // 生成 16 字节的随机 IV
}

export function encryptAESData(data: string,) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  return cipher.update(data, 'binary', 'hex') + cipher.final('hex');
  // const encryptedDataArray = new Uint8Array(encrypted)
  // const fullData = new Uint8Array(iv.length + encryptedDataArray.length)
  // fullData.set(iv, 0)
  // fullData.set(encryptedDataArray, iv.length)
  // return String.fromCharCode(...fullData)
}

export function decryptDynamicKeyAESData(data: string, secretKey: string) {
  // 将 Base64 字符串转回为 Buffer
  const dataBuffer = Buffer.from(data, 'base64');

  // 提取 IV 和加密的数据
  const iv = dataBuffer.slice(0, 16);
  const encrypted = dataBuffer.slice(16);

  // 创建解密器
  const decipher = crypto.createDecipheriv('aes-256-cbc', base64ToUnit8Array(secretKey), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString()
}

export function base64ToUnit8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}