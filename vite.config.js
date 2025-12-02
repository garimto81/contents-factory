import { defineConfig } from 'vite';
import { resolve } from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { VitePWA } from 'vite-plugin-pwa';

// Get git info for version display
function getGitInfo() {
  try {
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const message = execSync('git log -1 --format=%s', { encoding: 'utf8' }).trim();
    return { hash, message };
  } catch {
    return { hash: 'dev', message: 'local' };
  }
}

// Get local network IP address
function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (127.0.0.1) and non-IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// CSP Policy (Content Security Policy)
const cspPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "img-src 'self' data: blob:",
  "font-src 'self' https://cdn.jsdelivr.net",
  "connect-src 'self' https://cdn.jsdelivr.net",
  "media-src 'self' blob:",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');

// GitHub Pages base path (set via environment variable or default to '/')
const base = process.env.GITHUB_ACTIONS ? '/content-factory/' : '/';

export default defineConfig({
  base,
  root: 'src/public',
  publicDir: '../../public',
  // Inject build info at build/dev time
  define: {
    '__NETWORK_IP__': JSON.stringify(getNetworkIP()),
    '__DEV_PORT__': JSON.stringify(6010),
    '__GIT_HASH__': JSON.stringify(getGitInfo().hash),
    '__GIT_MESSAGE__': JSON.stringify(getGitInfo().message),
    '__APP_VERSION__': JSON.stringify('1.0.0')
  },
  server: {
    host: '0.0.0.0',
    port: 6010,  // 6000-6009 are blocked by Chrome (X11 protocol)
    strictPort: true,  // 포트 사용 중이면 에러 발생 (다른 포트로 자동 변경 안 함)
    open: true,
    headers: {
      'Content-Security-Policy': cspPolicy,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 6011,
    strictPort: true,
    headers: {
      'Content-Security-Policy': cspPolicy,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log in production
        drop_debugger: true
      }
    },
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
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Photo Factory - 휠 복원 사진 관리',
        short_name: 'Photo Factory',
        description: '휠 복원 기술자를 위한 사진 관리 및 마케팅 영상 생성 앱',
        theme_color: '#4A90D9',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        scope: base,
        start_url: base,
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Runtime caching for CDN resources
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true // Enable PWA in dev mode for testing
      }
    })
  ]
});
