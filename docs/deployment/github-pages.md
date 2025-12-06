# GitHub Pages Deployment

## Automatic Deployment

GitHub Actions가 `main` 브랜치 push 시 자동 배포합니다.

### Workflow File

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Manual Deployment

```bash
# 1. 빌드
npm run build

# 2. 로컬 테스트
npm run preview
# → http://localhost:6011

# 3. dist/ 폴더를 gh-pages 브랜치에 푸시
npx gh-pages -d dist
```

## Configuration

### Base Path

`vite.config.js`에서 설정:

```javascript
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/contents-factory/' : '/'
});
```

GitHub Actions 환경에서는 자동으로 `/contents-factory/` 경로 사용.

### Deployment URL

```
https://<username>.github.io/contents-factory/
```

## PWA Considerations

### Service Worker Scope

GitHub Pages 배포 시 SW scope가 `/contents-factory/`로 변경됨.
`vite-plugin-pwa`가 자동 처리.

### Manifest Start URL

```json
{
  "start_url": "/contents-factory/",
  "scope": "/contents-factory/"
}
```

## Troubleshooting

### 404 on Refresh

SPA이므로 새로고침 시 404 발생 가능:

```bash
# dist/ 폴더에 404.html 복사
cp dist/index.html dist/404.html
```

### Cache Issues

배포 후 이전 버전 표시:

```javascript
// 브라우저에서 캐시 정리
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// 또는 Hard Refresh: Ctrl+Shift+R
```

### CORS Errors

GitHub Pages는 외부 API 호출 시 CORS 필요:

```javascript
// API 서버에서 CORS 허용
// PocketBase의 경우 pb_hooks/cors.pb.js 설정
```

## Environment-Specific Build

```bash
# Development
npm run dev

# Production (GitHub Pages)
npm run build
# → dist/ with base: /contents-factory/

# Preview (local)
npm run preview
# → http://localhost:6011
```

## Next Steps

- [Docker Deployment](docker.md) - PocketBase 배포
- [Security Guide](security.md) - 보안 설정
