import { SetMetadata } from '@nestjs/common';

export const NO_REPEAT_SUBMIT_KEY = 'no-repeat-submit';

/**
 * 防重复提交装饰器
 * @param timeout 防重复时间(ms)，默认2500ms
 */
export const NoRepeatSubmit = (timeout: number = 2500) =>
    SetMetadata(NO_REPEAT_SUBMIT_KEY, timeout);