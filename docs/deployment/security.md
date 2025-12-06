# Security Guide

## Implemented Security Features

### 1. XSS Prevention

`src/js/utils/sanitizer.js`:

```javascript
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

적용 위치:
- `gallery.html` - 작업 목록 렌더링
- `upload.html` - 파일명 표시
- `job-detail.html` - 작업 상세 정보

### 2. Input Validation

`src/js/db-api.js`:

```javascript
export function validateJobData(data) {
  const required = ['car_model', 'technician_id'];
  for (const field of required) {
    if (!data[field] || typeof data[field] !== 'string') {
      throw new ValidationError(`Invalid ${field}`);
    }
  }
  return true;
}

export function validateFile(file) {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (file.size > MAX_SIZE) {
    throw new ValidationError('File too large');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ValidationError('Invalid file type');
  }
  return true;
}
```

### 3. File Upload Limits

| 제한 | 값 |
|------|-----|
| 최대 파일 크기 | 10MB |
| 허용 타입 | JPEG, PNG, WebP |
| 최대 파일 수 | 50장 |

### 4. CSP Headers

`vite.config.js`:

```javascript
server: {
  headers: {
    'Content-Security-Policy': `
      default-src 'self';
      script-src 'self' 'unsafe-inline';
      style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
      img-src 'self' data: blob:;
      connect-src 'self' http://localhost:8090;
    `.replace(/\s+/g, ' ').trim(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  }
}
```

### 5. Session Management

`src/js/utils/state.js`:

```javascript
// 절대 만료: 8시간
const SESSION_ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000;

// 비활성 만료: 30분
const SESSION_INACTIVITY_TIMEOUT = 30 * 60 * 1000;

// 세션 만료 확인
isExpired() {
  const now = Date.now();
  const sessionStart = this.getSessionStart();
  const lastActivity = this.getLastActivity();

  // 절대 만료 체크
  if (now - sessionStart > SESSION_ABSOLUTE_TIMEOUT) return true;

  // 비활성 만료 체크
  if (now - lastActivity > SESSION_INACTIVITY_TIMEOUT) return true;

  return false;
}
```

### 6. Secure Random ID

`src/js/db.js`:

```javascript
function generateSessionId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}
```

### 7. CDN SRI Hash

`index.html`:

```html
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
  rel="stylesheet"
  integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
  crossorigin="anonymous"
>
```

### 8. Production Logging

`src/js/utils/logger.js`:

```javascript
export function sanitizeForLog(data) {
  const sensitiveKeys = ['password', 'token', 'key', 'secret'];
  const sanitized = { ...data };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

// 프로덕션에서 console.log 비활성화
if (import.meta.env.PROD) {
  console.log = () => {};
}
```

## Security Checklist

### Development

- [x] XSS 방지 (escapeHtml 적용)
- [x] 입력 검증 (validateJobData, validateFile)
- [x] 파일 크기/타입 제한
- [x] CSP 헤더 설정
- [x] 보안 세션 ID 생성 (crypto.getRandomValues)

### Production

- [ ] HTTPS 적용
- [ ] CORS 제한 (허용 도메인만)
- [ ] Rate Limiting
- [ ] API Key 관리
- [ ] 정기 보안 점검

## OWASP Top 10 대응

| 취약점 | 대응 |
|--------|------|
| Injection | 입력 검증, Parameterized queries |
| Broken Auth | 세션 타임아웃, 안전한 ID 생성 |
| Sensitive Data | 로깅 필터링, HTTPS |
| XXE | 해당 없음 (XML 미사용) |
| Broken Access | 세션 기반 접근 제어 |
| Security Misconfig | CSP, Security Headers |
| XSS | escapeHtml, CSP |
| Insecure Deserialization | JSON.parse 사용 |
| Components | SRI, 정기 업데이트 |
| Logging | 민감 정보 필터링 |

## Reporting Security Issues

보안 취약점 발견 시:

1. GitHub Issue 생성 (비공개 가능)
2. 재현 단계 포함
3. 영향 범위 명시

## Next Steps

- [GitHub Pages](github-pages.md) - 배포
- [Docker](docker.md) - PocketBase 배포
