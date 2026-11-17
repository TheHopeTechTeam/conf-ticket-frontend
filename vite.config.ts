import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // NOTE: 在 .env.local 設 VITE_USE_MOCK_SERVER=true，/api 改指向本機 mock server（localhost:3001）
  // 測試付款流程時務必開啟，否則建立訂單、付款 API 會打到正式環境
  const useMockServer = env.VITE_USE_MOCK_SERVER === 'true';

  return {
    base: '/',
    plugins: [
      react(),
      EnvironmentPlugin(
        {
          VITE_TAPPAY_APP_KEY: '',
          VITE_TAPPAY_APP_ID: '',
          VITE_APPLE_MERCHANT_ID: '',
          VITE_GOOGLE_MERCHANT_ID: '',
        },
        { defineOn: 'import.meta.env' }
      ),
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: '.',
    },
    server: {
      // https: {}, // 啟用 HTTPS
      host: true, // 讓 Vite 綁定 0.0.0.0，允許內網訪問
      port: 5173, // 可選，設定開發伺服器端口
      allowedHosts: ['localhost', '127.0.0.1'],
      proxy: {
        '/api': useMockServer
          ? {
              target: 'http://localhost:3001',
              changeOrigin: true,
              rewrite: (path: string) => path.replace(/^\/api/, ''),
            }
          : {
              changeOrigin: true,
              // NOTE: 本機開發時，正式環境的 API 網域
              // NOTE: 本機開發時，設定 headers 以解決後端設定的 CORS 問題
              target: 'http://thehope.app',
              headers: {
                Origin: 'http://thehope.app',
                Referer: 'http://thehope.app',
              },
            },
      },
    },
  };
});
