# Installation Guide

## System Requirements

| 항목 | 최소 요구사항 |
|------|--------------|
| Node.js | >= 18.0.0 |
| npm | >= 9.0.0 |
| Browser | Chrome 90+, Firefox 88+, Safari 14+ |
| Storage | 500MB (IndexedDB) |

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/garimtoi/content-factory.git
cd contents-factory
```

### 2. Install Dependencies

```bash
npm install
```

주요 의존성:
- `browser-image-compression` - 이미지 압축 + EXIF 보정
- `dexie` - IndexedDB 래퍼
- `vite` - 빌드 도구
- `vite-plugin-pwa` - PWA 생성

### 3. Verify Installation

```bash
npm run dev
```

`http://localhost:6010`에서 앱이 정상 실행되는지 확인합니다.

## Sub-Projects Installation

### Field Uploader (스마트폰 PWA)

```bash
cd apps/frontend
npm install
npm run dev
# → http://localhost:5173
```

### Shorts Generator (PC CLI)

```bash
cd apps/backend
npm install
npm link  # 전역 CLI 등록
shorts-gen --help
```

### PocketBase Server

```bash
cd server
docker-compose up -d
# → http://localhost:8090
```

## Troubleshooting

### Port 6000-6009 Blocked

Chrome은 X11 프로토콜로 인해 6000-6009 포트를 차단합니다.
`vite.config.js`에서 포트가 6010으로 설정되어 있는지 확인하세요.

### npm install fails

```bash
# Node 버전 확인
node -v  # >= 18 필요

# npm 캐시 정리
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### PWA Not Installing

- HTTPS 필요 (또는 localhost)
- `manifest.json` 경로 확인
- Service Worker 등록 확인 (DevTools → Application)

## Next Steps

- [Configuration](configuration.md) - 환경 설정
- [Quick Start](quick-start.md) - 빠른 시작
