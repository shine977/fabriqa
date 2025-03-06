export interface BaseResponse {
  code: number;
  message: string;
}

export interface UnifyObjectResponse {
  item: Record<string, any>;
}

export interface UnifyPaginationResponse {
  items: any[];
  total: number;
  pageSize?: number;
  current?: number;
}

export interface UnifyRawValueResponse {
  item: string | boolean | number;
}

export type UnifyResponse = BaseResponse & (UnifyObjectResponse | UnifyPaginationResponse | UnifyRawValueResponse);

/* @description: 提示消息返回 */
export function unifyResponse(message: string): UnifyResponse;
/* @description: 状态码和消息返回 */
export function unifyResponse(code: number, message?: string): UnifyResponse;
/* @description: 分页数据返回 */
export function unifyResponse(options: UnifyPaginationResponse): UnifyResponse;
/* @description: 对象数据返回 */
export function unifyResponse(data: Record<string, any>): UnifyResponse;

export function unifyResponse(
  optionsOrCodeOrMessage: string | number | Record<string, any> | UnifyPaginationResponse,
  message?: string,
): UnifyResponse {
  // 处理字符串消息
  if (typeof optionsOrCodeOrMessage === 'string') {
    return {
      code: 0,
      message: optionsOrCodeOrMessage,
      item: optionsOrCodeOrMessage,
    };
  }

  // 处理状态码
  if (typeof optionsOrCodeOrMessage === 'number') {
    return {
      code: optionsOrCodeOrMessage,
      message: message || (optionsOrCodeOrMessage === 0 ? 'success' : 'error'),
      item: optionsOrCodeOrMessage.toString(),
    };
  }

  // 基础响应
  const baseResponse: BaseResponse = {
    code: 0,
    message: message || 'success',
  };

  // 处理分页数据
  if ('items' in optionsOrCodeOrMessage) {
    return {
      ...baseResponse,
      items: optionsOrCodeOrMessage.items,
      total: optionsOrCodeOrMessage.total,
      ...(optionsOrCodeOrMessage.pageSize && { pageSize: optionsOrCodeOrMessage.pageSize }),
      ...(optionsOrCodeOrMessage.current && { current: optionsOrCodeOrMessage.current }),
    };
  }

  // 处理单个对象或值
  if ('item' in optionsOrCodeOrMessage) {
    return {
      ...baseResponse,
      item: optionsOrCodeOrMessage.item,
    };
  }

  // 默认作为对象处理
  return {
    ...baseResponse,
    item: optionsOrCodeOrMessage,
  };
}
