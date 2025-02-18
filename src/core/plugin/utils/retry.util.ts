/**
 * 重试执行异步函数
 * @param fn 要重试的异步函数
 * @param maxRetries 最大重试次数
 * @param delay 重试延迟(ms)
 */
export async function retry<T>(fn: () => Promise<T>, maxRetries: number = 3, delay: number = 1000): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
