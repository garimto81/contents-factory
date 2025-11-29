import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src/public',
  publicDir: '../../public',
  server: {
    host: '0.0.0.0',
    port: 6010,  // 6000-6009 are blocked by Chrome (X11 protocol)
    strictPort: true,  // 포트 사용 중이면 에러 발생 (다른 포트로 자동 변경 안 함)
    open: true
  },
  preview: {
    host: '0.0.0.0',
    port: 6011,
    strictPort: true
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/public/index.html'),
        upload: resolve(__dirname, 'src/public/upload.html'),
        gallery: resolve(__dirname, 'src/public/gallery.html'),
        'job-detail': resolve(__dirname, 'src/public/job-detail.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@js': resolve(__dirname, 'src/js'),
      '@css': resolve(__dirname, 'src/css')
    }
  }
});
