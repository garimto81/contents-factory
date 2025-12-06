# Testing Guide

## Test Stack

| 도구 | 용도 | 설정 파일 |
|------|------|-----------|
| Vitest | 단위 테스트 | `vitest.config.js` |
| Playwright | E2E 테스트 | `playwright.config.cjs` |
| happy-dom | DOM 환경 | Vitest 내장 |

## Commands

```bash
# Unit Tests (Vitest)
npm run test:unit                        # Watch 모드
npx vitest run                           # 전체 실행 (1회)
npx vitest run tests/unit/upload.test.js # 단일 파일
npx vitest run --coverage                # 커버리지 (threshold: 70%)

# E2E Tests (Playwright)
# 중요: 먼저 별도 터미널에서 dev 서버 실행 필요
# Terminal 1: npm run dev
# Terminal 2: npm test

npm test                                 # 전체 브라우저
npx playwright test --project=chromium   # 단일 브라우저
npx playwright test --debug              # 디버그 모드
npx playwright test tests/upload-ui.spec.cjs  # 단일 파일
```

## Vitest Configuration

`vitest.config.js`:

```javascript
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['tests/setup.js'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  }
});
```

### Test Setup

`tests/setup.js`에서 전역 Mock 설정:

- `fetch` - API 호출 mock
- `alert` - 브라우저 alert mock
- `console.warn/error` - 로깅 억제

### Path Aliases

```javascript
resolve: {
  alias: {
    '@': '/src',
    '@js': '/src/js',
    '@public': '/src/public'
  }
}
```

## Playwright Configuration

`playwright.config.cjs`:

```javascript
module.exports = {
  testDir: './tests',
  testMatch: '*.spec.cjs',
  timeout: 30000,
  expect: { timeout: 5000 },
  use: {
    baseURL: 'http://localhost:6010'
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Desktop Safari', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } }
  ]
};
```

### E2E Test Structure

```javascript
// tests/upload-ui.spec.cjs
const { test, expect } = require('@playwright/test');

test.describe('Upload Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload.html');
  });

  test('should display upload form', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
  });

  test('should validate file type', async ({ page }) => {
    // 파일 업로드 테스트
  });
});
```

## Coverage Requirements

| 메트릭 | 최소 요구사항 |
|--------|--------------|
| Lines | 70% |
| Functions | 70% |
| Branches | 70% |
| Statements | 70% |

## Test File Locations

```
tests/
├── setup.js              # 전역 설정
├── unit/                 # Vitest 단위 테스트
│   ├── upload.test.js
│   ├── db-api.test.js
│   └── state.test.js
├── debug/                # 디버그 스크립트
└── *.spec.cjs            # Playwright E2E 테스트
```

## Troubleshooting

### E2E 테스트 실패

1. Dev 서버 실행 확인: `npm run dev`
2. 포트 확인: `http://localhost:6010`
3. 브라우저 설치: `npx playwright install`

### Vitest 에러

```bash
# 캐시 정리
npx vitest --clearCache

# 단일 파일 디버그
npx vitest run tests/unit/upload.test.js --reporter=verbose
```

## Next Steps

- [Debugging Guide](debugging.md) - 디버깅 방법
- [Architecture](architecture.md) - 시스템 구조
