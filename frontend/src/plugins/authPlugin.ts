import { AuthState, Plugin } from '../types';

const authPlugin: Plugin = {
  id: 'auth',
  name: 'Auth',
  version: '1.0.0',
  description: 'provide auth services',
  enabled: true,
  priority: 10,

  // 空的hooks对象，钩子将在initialize方法中注册
  hooks: {},
  _initialized: false,
  // 初始化插件 - 使用传入的插件系统实例注册钩子
  initialize: function (pluginSystem) {
    pluginSystem.addHook(this.id, 'auth:getState', (state: AuthState) => {
      console.log('auth:getState called');
      return state;
    });
    this._initialized = true;
    console.log('Auth Plugin initialized');
  },
};
export default authPlugin;
