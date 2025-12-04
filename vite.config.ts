import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Manually define __filename/__dirname for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Environment variables accessible at runtime
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.STRIPE_PUBLIC_KEY': JSON.stringify(env.STRIPE_PUBLIC_KEY || ''),
        'process.env.NODE_ENV': JSON.stringify(mode)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Production optimizations
        target: 'es2022',
        minify: 'esbuild',  // Using esbuild (built-in, faster)
        // Code splitting for optimal caching
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunks
              'react-vendor': ['react', 'react-dom'],
              'motion-vendor': ['framer-motion'],
            },
            // Asset naming for better caching
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
          }
        },
        // Chunk size warnings
        chunkSizeWarningLimit: 1000,
        // Source maps only in development
        sourcemap: !isProduction,
        // Report compressed size
        reportCompressedSize: true,
        // CSS code splitting
        cssCodeSplit: true
      },
      // Preview server configuration
      preview: {
        port: 3000,
        host: '0.0.0.0'
      },
      // Optimize dependencies
      optimizeDeps: {
        include: ['react', 'react-dom', 'framer-motion']
      },
      // Production settings
      esbuild: {
        drop: isProduction ? ['console', 'debugger'] : [],
      }
    };
});
