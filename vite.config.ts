import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { transcribeApiHandler } from './app/api/transcribe/route';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [
        {
          name: 'custom-api-middleware',
          configureServer(server) {
            server.middlewares.use('/api/transcribe', transcribeApiHandler);
          }
        }
      ]
    };
});
