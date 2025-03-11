/**
 * Cryptographic utility functions
 *
 * Provides encryption and decryption functionality for secure data handling
 * using the Web Crypto API with AES-CBC algorithm
 */

/**
 * 生成随机的Base64格式密钥，等同于Node.js中的crypto.randomBytes(32).toString('base64')
 * @returns Base64格式的32字节随机密钥
 */
export function generateBase64Key(): string {
  // 创建32字节的随机数
  const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));

  // 转换为Base64字符串
  return btoa(String.fromCharCode.apply(null, [...randomBytes]));
}

export async function encryptData(data: string, aesKey: CryptoKey) {
  const iv = window.crypto.getRandomValues(new Uint8Array(16)); // 生成随机 IV
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  const encryptedData = await window.crypto.subtle.encrypt({ name: 'AES-CBC', iv }, aesKey, encodedData);

  // 将 ArrayBuffer 转换为 Uint8Array
  const encryptedDataArray = new Uint8Array(encryptedData);

  // 创建一个新的 Uint8Array，用于存放 IV + 加密后的数据
  const fullData = new Uint8Array(iv.length + encryptedDataArray.length);
  fullData.set(iv, 0); // 设置 IV
  fullData.set(encryptedDataArray, iv.length); // 设置加密数据

  // 转换为 Base64 字符串以便传输
  const base64EncryptedData = btoa(String.fromCharCode(...fullData));

  return base64EncryptedData;
}

export async function stringToCryptoKey(str: string): Promise<CryptoKey> {
  const rawKey = base64ToArrayBuffer(str);
  return await window.crypto.subtle.importKey('raw', rawKey, { name: 'AES-CBC', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
}
export async function decryptData(encryptedDataWithIvBase64: string, aesKey: CryptoKey) {
  // 将 Base64 字符串转换为 Uint8Array
  const encryptedDataWithIv = Uint8Array.from(atob(encryptedDataWithIvBase64), c => c.charCodeAt(0));

  // 提取 IV 和加密数据
  const iv = encryptedDataWithIv.slice(0, 16);
  const encryptedData = encryptedDataWithIv.slice(16);

  // 解密
  const decryptedData = await window.crypto.subtle.decrypt({ name: 'AES-CBC', iv }, aesKey, encryptedData);

  return new TextDecoder().decode(decryptedData);
}

export function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
