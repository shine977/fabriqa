/**
 * 系统错误码定义
 * 遵循以下规则：
 * 1. 错误码为5位数字
 * 2. 第1位表示错误级别：1-系统级错误，2-业务级错误
 * 3. 第2-3位表示模块：00-通用，01-认证授权，02-用户，03-角色，04-权限
 * 4. 第4-5位表示具体错误码
 */

export enum ErrorCode {
  // 系统级错误 (10000-19999)
  SYSTEM_ERROR = 10000,           // 系统错误
  INVALID_PARAMS = 10001,         // 无效的参数
  UNAUTHORIZED = 10100,           // 未授权
  TOKEN_EXPIRED = 10101,          // Token过期
  FORBIDDEN = 10102,              // 禁止访问
  NOT_FOUND = 10103,             // 资源不存在

  // 认证授权错误 (20100-20199)
  AUTH_INVALID_USER = 20100,      // 用户不存在或密码错误
  AUTH_INVALID_TOKEN = 20101,     // 无效的Token
  AUTH_EXPIRED_TOKEN = 20102,     // Token已过期
  AUTH_INVALID_REFRESH = 20103,   // 无效的刷新Token

  // 用户模块错误 (20200-20299)
  USER_NOT_FOUND = 20200,         // 用户不存在
  USER_ALREADY_EXISTS = 20201,    // 用户已存在
  USER_INVALID_PASSWORD = 20202,  // 密码不符合要求
  USER_DISABLED = 20203,          // 用户已禁用

  // 角色模块错误 (20300-20399)
  ROLE_NOT_FOUND = 20300,         // 角色不存在
  ROLE_ALREADY_EXISTS = 20301,    // 角色已存在
  ROLE_IN_USE = 20302,           // 角色正在使用中

  // 权限模块错误 (20400-20499)
  PERMISSION_DENIED = 20400,      // 权限不足
  PERMISSION_NOT_FOUND = 20401,   // 权限不存在
}

/**
 * 错误码对应的错误信息
 */
export const ErrorMessage: Record<ErrorCode, string> = {
  [ErrorCode.SYSTEM_ERROR]: '系统错误',
  [ErrorCode.INVALID_PARAMS]: '无效的参数',
  [ErrorCode.UNAUTHORIZED]: '未授权',
  [ErrorCode.TOKEN_EXPIRED]: 'Token已过期',
  [ErrorCode.FORBIDDEN]: '禁止访问',
  [ErrorCode.NOT_FOUND]: '资源不存在',

  [ErrorCode.AUTH_INVALID_USER]: '用户不存在或密码错误',
  [ErrorCode.AUTH_INVALID_TOKEN]: '无效的Token',
  [ErrorCode.AUTH_EXPIRED_TOKEN]: 'Token已过期',
  [ErrorCode.AUTH_INVALID_REFRESH]: '无效的刷新Token',

  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_ALREADY_EXISTS]: '用户已存在',
  [ErrorCode.USER_INVALID_PASSWORD]: '密码不符合要求',
  [ErrorCode.USER_DISABLED]: '用户已禁用',

  [ErrorCode.ROLE_NOT_FOUND]: '角色不存在',
  [ErrorCode.ROLE_ALREADY_EXISTS]: '角色已存在',
  [ErrorCode.ROLE_IN_USE]: '角色正在使用中',

  [ErrorCode.PERMISSION_DENIED]: '权限不足',
  [ErrorCode.PERMISSION_NOT_FOUND]: '权限不存在',
};

/**
 * 创建错误响应
 * @param code 错误码
 * @param message 自定义错误信息（可选）
 */
export function createErrorResponse(code: ErrorCode, message?: string) {
  return {
    code,
    message: message || ErrorMessage[code],
  };
}
