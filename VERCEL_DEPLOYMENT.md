# Vercel 배포 가이드

**프로젝트**: Contents Factory
**버전**: 1.0.0
**업데이트**: 2025-11-10

---

## 📋 배포 개요

Contents Factory를 Vercel에 배포하는 전체 가이드입니다.

---

## 🚀 빠른 배포 (GitHub 연동)

### 1. GitHub 연동

1. **Vercel 대시보드** 접속: https://vercel.com/dashboard
2. **New Project** 클릭
3. **Import Git Repository** 선택
4. `garimto81/contents-factory` 선택
5. **Import** 클릭

### 2. 프로젝트 설정

**Framework Preset**: Other (정적 사이트)

**Build Settings**:
```
Build Command: (비워두기)
Output Directory: src/public
Install Command: (비워두기)
```

**Root Directory**: `.` (루트)

### 3. 환경 변수 설정 ⚠️ 중요

**Environment Variables** 섹션에서 다음 변수 추가:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `SUPABASE_URL` | `https://nuecesgtciziaotdmfhp.supabase.co` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | `(실제 키)` | Supabase Anon Key |
| `CLOUDINARY_CLOUD_NAME` | `dzjp22inj` | Cloudinary Cloud Name |
| `CLOUDINARY_UPLOAD_PRESET` | `photo-factory` | Cloudinary Upload Preset (Unsigned) |

**중요**:
- 모든 환경은 `Production`, `Preview`, `Development` 체크
- `SUPABASE_ANON_KEY`는 `src/js/config.js` 파일에서 확인

### 4. 배포

**Deploy** 버튼 클릭 → 자동 배포 시작 (약 1-2분 소요)

---

## 🔧 Vercel CLI 배포 (수동)

### 1. Vercel CLI 설치

```bash
npm install -g vercel
```

### 2. 로그인

```bash
vercel login
```

### 3. 프로젝트 배포

```bash
# 루트 디렉토리에서 실행
cd /home/user/contents-factory
vercel
```

**설정 질문**:
- Set up and deploy? **Y**
- Which scope? (계정 선택)
- Link to existing project? **N**
- Project name? **contents-factory**
- In which directory is your code located? **.**

### 4. 환경 변수 설정

```bash
# Supabase URL
vercel env add SUPABASE_URL
# 값 입력: https://nuecesgtciziaotdmfhp.supabase.co

# Supabase Anon Key
vercel env add SUPABASE_ANON_KEY
# 값 입력: (config.js의 실제 키)

# Cloudinary Cloud Name
vercel env add CLOUDINARY_CLOUD_NAME
# 값 입력: dzjp22inj

# Cloudinary Upload Preset
vercel env add CLOUDINARY_UPLOAD_PRESET
# 값 입력: photo-factory
```

### 5. 프로덕션 배포

```bash
vercel --prod
```

---

## 📁 프로젝트 구조 (Vercel 기준)

```
contents-factory/
├── src/
│   ├── public/              # 📌 HTML 파일 (배포 대상)
│   │   ├── index.html       → https://your-app.vercel.app/
│   │   ├── upload.html      → https://your-app.vercel.app/upload
│   │   ├── gallery.html     → https://your-app.vercel.app/gallery
│   │   └── job-detail.html  → https://your-app.vercel.app/job-detail
│   ├── js/                  # JavaScript 모듈
│   │   ├── config.js        → /js/config.js
│   │   ├── auth.js          → /js/auth.js
│   │   └── upload.js        → /js/upload.js
│   └── css/                 # 스타일시트
│       └── styles.css       → /css/styles.css
├── vercel.json              # Vercel 설정
└── package.json             # 프로젝트 메타데이터
```

---

## 🔗 URL 매핑

Vercel 배포 후 다음 URL로 접근 가능:

| 페이지 | 로컬 경로 | Vercel URL |
|--------|----------|-----------|
| 홈 | `src/public/index.html` | `https://your-app.vercel.app/` |
| 업로드 | `src/public/upload.html` | `https://your-app.vercel.app/upload` |
| 갤러리 | `src/public/gallery.html` | `https://your-app.vercel.app/gallery` |
| 작업 상세 | `src/public/job-detail.html` | `https://your-app.vercel.app/job-detail` |

---

## ⚙️ vercel.json 설정 설명

**파일 위치**: `/home/user/contents-factory/vercel.json`

### Routes (라우팅)
```json
{
  "routes": [
    { "src": "/js/(.*)", "dest": "/src/js/$1" },
    { "src": "/css/(.*)", "dest": "/src/css/$1" },
    { "src": "/(.*)", "dest": "/src/public/$1" }
  ]
}
```

- `/js/*` → `src/js/` 폴더로 매핑
- `/css/*` → `src/css/` 폴더로 매핑
- 나머지 → `src/public/` 폴더로 매핑

### Rewrites (URL 재작성)
```json
{
  "rewrites": [
    { "source": "/", "destination": "/src/public/index.html" },
    { "source": "/upload", "destination": "/src/public/upload.html" }
  ]
}
```

- `/` → `index.html` (홈페이지)
- `/upload` → `upload.html` (업로드 페이지)

---

## 🔒 환경 변수 보안

### Vercel 대시보드에서 설정

1. **Project Settings** → **Environment Variables**
2. 각 변수 추가:
   - Name: `SUPABASE_URL`
   - Value: `https://nuecesgtciziaotdmfhp.supabase.co`
   - Environments: `Production`, `Preview`, `Development` 모두 체크

### 주의사항

⚠️ **절대 GitHub에 커밋하지 말 것**:
- `.env` 파일 (`.gitignore`에 포함되어 있음)
- Supabase Anon Key
- API 키

✅ **Vercel 대시보드에서만 설정**:
- 환경 변수는 Vercel 대시보드에서만 관리
- 빌드 시 자동으로 주입됨

---

## 🧪 배포 후 테스트

### 1. 기본 접근 확인
```bash
# 홈페이지
curl https://your-app.vercel.app/

# 업로드 페이지
curl https://your-app.vercel.app/upload
```

### 2. JavaScript 모듈 로드 확인
브라우저 DevTools → Console:
```
✅ Configuration loaded: { supabaseUrl: ..., cloudinaryName: ... }
✅ Upload page with Uppy initialized
```

### 3. 환경 변수 확인
```javascript
// 브라우저 콘솔에서 실행
console.log(window.CLOUDINARY_CLOUD_NAME); // "dzjp22inj"
console.log(window.CLOUDINARY_UPLOAD_PRESET); // "photo-factory"
```

### 4. 업로드 테스트
1. `/upload` 페이지 접속
2. 카메라 버튼만 표시되는지 확인 ✅
3. 사진 촬영 후 업로드 성공 확인
4. 에러 발생 시 콘솔에 상세 로그 확인

---

## 📊 배포 상태 모니터링

### Vercel 대시보드
- **Deployments**: 모든 배포 히스토리
- **Analytics**: 방문자 통계
- **Logs**: 런타임 로그
- **Domains**: 커스텀 도메인 설정

### 배포 로그 확인
```bash
vercel logs your-deployment-url
```

---

## 🔄 재배포 (업데이트)

### GitHub Push로 자동 배포
```bash
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main

# Vercel이 자동으로 감지하고 배포 시작
```

### 수동 재배포
```bash
vercel --prod
```

---

## 🐛 문제 해결

### 1. 404 Not Found
**원인**: 라우팅 설정 오류

**해결**:
- `vercel.json` 파일 확인
- `rewrites` 설정 확인

### 2. JavaScript 모듈 로드 실패
**원인**: CORS 또는 경로 오류

**해결**:
```javascript
// src/public/upload.html에서 경로 확인
<script type="module">
  import { auth } from '../js/auth.js';  // ✅ 상대 경로
</script>
```

### 3. 환경 변수 인식 안 됨
**원인**: Vercel 환경 변수 미설정

**해결**:
1. Vercel 대시보드 → Project Settings → Environment Variables
2. 모든 변수 확인
3. 재배포: `vercel --prod`

### 4. Cloudinary 업로드 실패
**원인**: Upload Preset 설정 오류

**해결**:
1. Cloudinary 대시보드 → Settings → Upload
2. `photo-factory` preset 확인
3. **Signing Mode: Unsigned** 확인 ✅

---

## 📝 커스텀 도메인 설정

### 1. 도메인 추가
Vercel 대시보드 → Project Settings → Domains

### 2. DNS 설정
```
Type: CNAME
Name: www (또는 @)
Value: cname.vercel-dns.com
```

### 3. SSL 인증서
Vercel이 자동으로 Let's Encrypt SSL 인증서 발급 (무료)

---

## 🎯 체크리스트

배포 전 확인:

- [ ] `vercel.json` 파일 생성 완료
- [ ] `package.json` 파일 생성 완료
- [ ] `.gitignore`에 `.env` 포함 확인
- [ ] Vercel 환경 변수 설정 완료
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_UPLOAD_PRESET`
- [ ] Cloudinary Upload Preset **Unsigned** 설정 확인
- [ ] GitHub 레포지토리 최신 상태 확인

배포 후 확인:

- [ ] 홈페이지 접속 확인
- [ ] 업로드 페이지 접속 확인
- [ ] 카메라 버튼만 표시 확인
- [ ] 사진 업로드 테스트 성공
- [ ] 모바일 반응형 확인 (스크롤 없이 표시)
- [ ] 에러 로그 확인

---

## 📞 지원

- **Vercel 문서**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: https://github.com/garimto81/contents-factory/issues

---

**배포 완료 후**:
1. Vercel 대시보드에서 배포 URL 확인
2. 브라우저에서 접속 테스트
3. 모든 기능 동작 확인
4. 배포 URL을 README.md에 추가

*이 문서는 Contents Factory Vercel 배포 가이드입니다.*
