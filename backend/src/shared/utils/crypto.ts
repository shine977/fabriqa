import * as crypto from 'crypto';

/**
 * 生成随机的Base64格式密钥
 * @returns Base64格式的32字节随机密钥
 */
export function generateBase64Key(): string {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * 使用指定的密钥对数据进行加密
 * @param data 要加密的数据
 * @param keyString 密钥字符串
 * @returns Base64编码的加密数据(前16字节是IV)
 */
export function encryptData(data: string, keyString: string): string {
  // 对密钥进行标准化处理
  const keyBuffer = normalizeKeyTo32Bytes(keyString);

  // 生成随机IV
  const iv = crypto.randomBytes(16);

  // 创建加密器
  const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);

  // 加密数据
  let encrypted = cipher.update(data, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // 组合IV和加密数据
  const result = Buffer.concat([iv, encrypted]);

  // 转换为Base64并返回
  return result.toString('base64');
}

/**
 * 使用指定的密钥解密数据
 * @param encryptedData Base64编码的加密数据(前16字节是IV)
 * @param key Base64格式的密钥
 * @returns 解密后的原始数据
 */
export function decryptData(encryptedData: string, key: string): string {
  // 将Base64数据转换为Buffer
  const dataBuffer = Buffer.from(encryptedData, 'base64');

  // 提取IV和加密数据
  const iv = dataBuffer.slice(0, 16);
  const encrypted = dataBuffer.slice(16);

  // 从Base64解码密钥
  const keyBuffer = Buffer.from(key, 'base64');

  // 创建解密器
  const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);

  // 解密数据
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  // 返回解密后的字符串
  return decrypted.toString('utf8');
}

/**
 * 前端传来的数据解密
 * @param encryptedDataBase64 前端加密的Base64字符串(带IV)
 * @param key 密钥(Base64格式)
 * @returns 解密后的数据
 */
export function decryptFrontendData(encryptedDataBase64: string, keyString: string): string {
  try {
    // 将Base64数据转换为Buffer
    const dataBuffer = Buffer.from(encryptedDataBase64, 'base64');

    // 提取IV和加密数据
    const iv = dataBuffer.slice(0, 16);
    const encrypted = dataBuffer.slice(16);

    // 对密钥进行标准化处理
    const keyBuffer = normalizeKeyTo32Bytes(keyString);

    // 创建解密器
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);

    // 解密
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('解密失败:', error);
    throw new Error('解密失败');
  }
}

// 后端标准化密钥函数
function normalizeKeyTo32Bytes(key: string): Buffer {
  // 尝试解析为Base64，如果失败则当作普通字符串
  let keyData;
  try {
    keyData = Buffer.from(key, 'base64');
    if (keyData.length === 32) {
      return keyData;
    }
  } catch (e) {
    // 不是有效的Base64，作为普通字符串处理
  }

  // 创建UTF-8编码的Buffer
  keyData = Buffer.from(key, 'utf8');

  // 如果密钥长度正好是32字节，直接返回
  if (keyData.length === 32) {
    return keyData;
  }

  // 创建一个32字节的Buffer
  const normalizedKey = Buffer.alloc(32);

  if (keyData.length < 32) {
    // 如果密钥太短，重复填充直到达到32字节
    for (let i = 0; i < 32; i++) {
      normalizedKey[i] = keyData[i % keyData.length];
    }
  } else {
    // 如果密钥太长，取前32字节
    keyData.copy(normalizedKey, 0, 0, 32);
  }

  return normalizedKey;
}
