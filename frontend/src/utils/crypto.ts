/**
 * 使用指定的密钥对数据进行加密
 * @param data 要加密的数据
 * @param keyString 密钥字符串
 * @returns Base64编码的加密数据(前16字节是IV)
 */
export async function encryptData(data: string, keyString: string): Promise<string> {
  // 对密钥进行标准化处理，确保长度为32字节
  const normalizedKey = normalizeKeyTo32Bytes(keyString);

  // 导入密钥
  const cryptoKey = await window.crypto.subtle.importKey('raw', normalizedKey, { name: 'AES-CBC' }, false, ['encrypt']);

  // 生成随机IV
  const iv = window.crypto.getRandomValues(new Uint8Array(16));

  // 编码数据
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  // 加密
  const encryptedData = await window.crypto.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, encodedData);

  // 将 ArrayBuffer 转换为 Uint8Array
  const encryptedDataArray = new Uint8Array(encryptedData);

  // 创建一个新的 Uint8Array，用于存放 IV + 加密后的数据
  const fullData = new Uint8Array(iv.length + encryptedDataArray.length);
  fullData.set(iv, 0); // 设置 IV
  fullData.set(encryptedDataArray, iv.length); // 设置加密数据

  // 转换为 Base64 字符串
  return btoa(String.fromCharCode(...fullData));
}

/**
 * 将任意长度的字符串规范化为32字节(256位)的Uint8Array
 * @param key 任意长度的字符串
 * @returns 32字节的Uint8Array
 */
function normalizeKeyTo32Bytes(key: string): Uint8Array {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);

  // 如果密钥长度正好是32字节，直接返回
  if (keyData.length === 32) {
    return keyData;
  }

  // 创建一个32字节的数组
  const normalizedKey = new Uint8Array(32);

  if (keyData.length < 32) {
    // 如果密钥太短，重复填充直到达到32字节
    for (let i = 0; i < 32; i++) {
      normalizedKey[i] = keyData[i % keyData.length];
    }
  } else {
    // 如果密钥太长，取前32字节
    normalizedKey.set(keyData.slice(0, 32));
  }

  return normalizedKey;
}
