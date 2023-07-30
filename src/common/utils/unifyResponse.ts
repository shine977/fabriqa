export interface UnifyResponse {
  code: number;
  items?: any[];
  item?: object;
  message: string;
}

export function unifyResponse(message: string): UnifyResponse;
export function unifyResponse(message: string, code: number): UnifyResponse;
export function unifyResponse(message: string, items: any[]): UnifyResponse;
export function unifyResponse(message: string, item: object): UnifyResponse;
export function unifyResponse(
  message: string,
  codeOrItems?: number | any[] | object,
): UnifyResponse {
  const response = {
    code: 0,
    message,
  } as UnifyResponse;
  if (codeOrItems != null) {
    if (typeof codeOrItems == 'number') {
      response.code = codeOrItems;
    } else if (Array.isArray(codeOrItems)) {
      response.items = codeOrItems;
    } else {
      response.item = codeOrItems;
    }
  }

  return response;
}
