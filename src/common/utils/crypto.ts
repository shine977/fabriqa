import { createCipheriv, createHash } from 'crypto';
const key = createHash('sha512')
  .update(process.env.AUTH_SECRET)
  .digest('hex')
  .substring(0, 32);
const iv = createHash('sha512')
  .update(process.env.AUTH_SECRET)
  .digest('hex')
  .substring(0, 16);

export const encryptData = (data) => {
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  return Buffer.from(
    cipher.update(data, 'utf8', 'hex') + cipher.final('hex'),
  ).toString('base64');
};

export const decryptData = (data) => {
  const buff = Buffer.from(data, 'base64');
  const decipher = createCipheriv('aes-256-cbc', key, iv);
  return (
    decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
    decipher.final('utf8')
  );
};
