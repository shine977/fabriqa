export interface BaseResponse {
  code: number;
  message: string;
}
export interface UnifyObjectResponse {
  item: Record<string, any>;
}
export interface UnifyPaginationResponse {
  items: any[];
  take?: number;
  current?: number;
  total: number;
}

export interface UnifyRawValueResponse {
  item: string | boolean | number;
}

export type UnifyResponse =
  | (BaseResponse & UnifyObjectResponse)
  | (UnifyPaginationResponse & BaseResponse)
  | (UnifyRawValueResponse & BaseResponse);

export type UnifySigleResponse = BaseResponse | UnifyObjectResponse | UnifyPaginationResponse | UnifyRawValueResponse;

/* @description: 原始值返回 */
export function unifyResponse(raw: boolean, message?: string): UnifyRawValueResponse;
/* @description: 提示类型消息返回 */
export function unifyResponse(code: number, message?: string): BaseResponse;
/* @description: 分页返回 */
export function unifyResponse(options: UnifyPaginationResponse, message?: string): UnifyPaginationResponse;
/* @description: 返回对象 */
export function unifyResponse(options: UnifyObjectResponse, message?: string): UnifyObjectResponse;

export function unifyResponse(options: any, message?: string): UnifySigleResponse {
  const response = {
    code: 0,
  } as any;
  if (typeof options == 'boolean') {
    (response as UnifyRawValueResponse).item = message;
  } else if (typeof options == 'number') {
    response.code = options;
    response.message = message;
  } else if (options.items) {
    if (options.code) {
      response.code = options.code;
    }
    response.take = options.take || 10;
    response.current = options.current || 1;

    response.total = options.total;
    response.items = options.items;
  } else if (options.item) {
    response.item = options.item;
    response.code = options.code;
    response.message = options.message;
  }

  return response;
}
