import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    strictPort: true, // 如果端口被占用，则会直接失败而不是尝试下一个可用端口
    // open: true, // 自动在浏览器中打开应用
  },
});
