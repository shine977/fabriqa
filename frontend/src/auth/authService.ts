/**
 * Authentication Service
 * 
 * 认证服务模块，提供用户登录、登出和状态管理功能
 * 采用封装良好的模块化设计，便于扩展和测试
 */

import { pluginSystem } from '../plugins';

// 用户类型定义
export interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  [key: string]: any; // 允许其他属性
}

// 认证状态接口
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// 登录请求接口
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

// 登录响应接口
export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

/**
 * 认证服务类
 * 提供认证相关的所有功能
 */
class AuthService {
  // 存储键名
  private TOKEN_KEY = 'auth_token';
  private USER_KEY = 'user';
  
  /**
   * 获取当前认证状态
   * @returns 认证状态对象
   */
  getAuthState(): AuthState {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userString = localStorage.getItem(this.USER_KEY);
    
    // 检查插件系统是否有自定义认证状态处理
    return pluginSystem.applyHooks('auth:getState', {
      isAuthenticated: Boolean(token && userString),
      user: userString ? JSON.parse(userString) : null,
      token,
    });
  }

  /**
   * 用户登录
   * @param credentials 登录凭据
   * @returns 登录结果
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // 这里应当是实际的API调用
      // 为演示目的，使用模拟的登录过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟成功登录响应
      const loginResponse: LoginResponse = {
        success: true,
        token: 'demo_token_' + Math.random().toString(36).substring(2),
        user: {
          id: 1,
          name: 'Admin User',
          email: credentials.email,
          role: 'admin',
          avatar: 'https://i.pravatar.cc/150?u=' + credentials.email
        }
      };
      
      // 允许插件处理登录响应
      const processedResponse = pluginSystem.applyHooks('auth:processLogin', loginResponse);
      
      if (processedResponse.success) {
        // 存储认证信息
        this.setAuthData(processedResponse.token!, processedResponse.user!);
        
        // 触发登录成功事件
        pluginSystem.callHooks('auth:loginSuccess', processedResponse.user);
      }
      
      return processedResponse;
    } catch (error) {
      // 处理登录失败
      const errorResponse: LoginResponse = {
        success: false,
        message: error instanceof Error ? error.message : '登录失败，请重试'
      };
      
      // 触发登录失败事件
      pluginSystem.callHooks('auth:loginFailed', errorResponse);
      
      return errorResponse;
    }
  }
  
  /**
   * 用户登出
   */
  logout(): void {
    // 获取当前用户，用于事件触发
    const user = this.getAuthState().user;
    
    // 清除本地存储的认证数据
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // 允许插件在登出前执行操作
    pluginSystem.callHooks('auth:beforeLogout', user);
    
    // 触发登出成功事件
    pluginSystem.callHooks('auth:logoutSuccess');
  }
  
  /**
   * 存储认证数据
   * @param token 认证令牌
   * @param user 用户信息
   */
  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}

// 导出单例实例
export const authService = new AuthService();

// 快捷方法导出
export const useAuth = () => {
  return authService.getAuthState();
};

export default authService;
