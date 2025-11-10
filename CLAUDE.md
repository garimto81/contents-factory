# Contents Factory - Claude AI 개발 가이드

**프로젝트**: Contents Factory (5-Category Photo Factory)
**버전**: 1.0.0
**업데이트**: 2025-11-10

---

## 📋 프로젝트 개요

**Contents Factory**는 5개 카테고리별로 사진을 촬영하고 관리하는 웹 애플리케이션입니다.

### 핵심 기능
- ✅ **5개 카테고리 사진 촬영**: 입고 → 문제 → 과정 → 해결 → 출고
- ✅ **Uppy 파일 업로드**: 카메라 촬영 및 파일 선택
- ✅ **Cloudinary 이미지 저장**: 클라우드 이미지 호스팅
- ✅ **Supabase 데이터베이스**: 작업 및 사진 메타데이터 저장
- ✅ **Google OAuth 인증**: 간편한 로그인

---

## 🛠️ 기술 스택

### 프론트엔드
- **HTML5/CSS3/JavaScript (ES6)**
- **Bootstrap 5**: UI 프레임워크
- **Uppy v3.21.0**: 파일 업로드 (Dashboard, Webcam 플러그인)

### 백엔드/서비스
- **Supabase**: PostgreSQL 데이터베이스, 인증
- **Cloudinary**: 이미지 호스팅 및 변환

---

## 📁 프로젝트 구조

```
contents-factory/
├── src/
│   ├── public/               # HTML 페이지
│   │   ├── index.html       # 랜딩 페이지
│   │   ├── login.html       # 로그인
│   │   ├── upload.html      # 사진 촬영 업로드
│   │   └── gallery.html     # 갤러리
│   ├── js/                  # JavaScript 모듈
│   │   ├── config.js        # API 설정
│   │   ├── auth.js          # 인증 로직
│   │   └── upload.js        # 업로드 로직
│   └── css/                 # 스타일시트
│       └── styles.css
├── sql/                     # 데이터베이스 스키마
│   └── 01_create_tables.sql
├── tasks/                   # 작업 관리
│   ├── prds/               # PRD 문서
│   └── tickets/            # 이슈 티켓
├── docs/                    # 문서
│   └── prd.md
├── .env.example            # 환경 변수 예시
├── .gitignore
├── CLAUDE.md               # 이 문서
└── README.md
```

---

## 🚀 개발 워크플로우

### Phase 0: 요구사항 정의 (PRD)
1. 이슈/기능 요청 접수
2. PRD 문서 작성 (`tasks/prds/NNNN-feature-name.md`)
3. 사용자 승인 대기

### Phase 1: 코드 작성
1. 브랜치 생성: `claude/feature-name-sessionID`
2. 코드 구현
3. 로컬 테스트

### Phase 2: 테스트
- **수동 테스트**: 브라우저에서 기능 동작 확인
- **모바일 테스트**: Chrome DevTools 모바일 시뮬레이터
- **업로드 테스트**: Cloudinary 업로드 성공 확인

### Phase 3: 커밋 및 푸시
```bash
git add .
git commit -m "feat: 기능 설명 (v버전) [PRD-NNNN]"
git push -u origin claude/feature-name-sessionID
```

### Phase 4: PR 생성 (필요시)
- GitHub에서 Pull Request 생성
- 리뷰 및 머지

---

## 🔑 환경 설정

### 1. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 2. Cloudinary Upload Preset 생성

**중요**: `CLOUDINARY_UPLOAD_PRESET`은 **Unsigned**로 설정해야 함

1. Cloudinary 대시보드 → Settings → Upload
2. Upload presets → Add upload preset
3. 설정:
   - **Signing Mode**: Unsigned ✅
   - **Upload preset name**: `photo-factory`
   - **Folder**: `photo-factory`
   - **Allowed formats**: `jpg, png, webp`
4. Save

### 3. Supabase 테이블 생성

`sql/01_create_tables.sql` 실행:
```sql
-- Supabase SQL Editor에서 실행
CREATE TABLE jobs (...);
CREATE TABLE photos (...);
```

---

## 📝 코딩 규칙

### 1. 한글 우선
- **변수명**: 영문 (camelCase)
- **주석**: 한글
- **문서**: 한글
- **커밋 메시지**: 한글

```javascript
// ✅ 좋은 예
const jobNumber = '20251110001'; // 작업 번호

// ❌ 나쁜 예
const job_number = '20251110001'; // Job number
```

### 2. 파일 경로
- **절대 경로 사용 금지**: `/public/upload.html` ❌
- **상대 경로 사용**: `upload.html` ✅
- **프로젝트 루트 기준**: `/src/public/upload.html` (문서에서만)

### 3. 모듈 import
```javascript
// ES6 module
import { supabase } from './auth.js';
import { CLOUDINARY_CLOUD_NAME } from './config.js';
```

### 4. 에러 핸들링
```javascript
try {
  const result = await uploadToCloudinary(file);
  console.log('✅ 업로드 성공:', result);
} catch (error) {
  console.error('❌ 업로드 실패:', error);
  alert(`업로드 실패: ${error.message}`);
}
```

---

## 🐛 디버깅

### 브라우저 콘솔 확인
```javascript
// config.js에서 설정 확인
console.log('✅ Configuration loaded:', {
  supabaseUrl: SUPABASE_URL,
  cloudinaryName: CLOUDINARY_CLOUD_NAME
});

// upload.html에서 업로드 이벤트 확인
uppy.on('upload', (data) => {
  console.log('📤 업로드 시작:', data.fileIDs);
});

uppy.on('upload-success', (file, response) => {
  console.log('✅ 업로드 성공:', response.body.secure_url);
});

uppy.on('upload-error', (file, error, response) => {
  console.error('❌ 업로드 오류:', { file, error, response });
});
```

### 네트워크 탭 확인
1. Chrome DevTools → Network
2. Cloudinary API 요청 확인:
   - URL: `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`
   - Method: POST
   - Status: 200 OK (성공)
3. 실패 시 Response 확인

---

## 📌 자주 사용하는 명령어

### Git
```bash
# 브랜치 생성 및 전환
git checkout -b claude/feature-name-sessionID

# 변경사항 확인
git status
git diff

# 커밋
git add .
git commit -m "feat: 기능 추가 (v1.1.0)"

# 푸시
git push -u origin claude/feature-name-sessionID

# 로그 확인
git log --oneline -5
```

### 로컬 서버 (필요시)
```bash
# Python 간단 서버
python -m http.server 8000

# Node.js 서버 (http-server)
npx http-server src/public -p 8000
```

---

## 🔒 보안 체크리스트

- ✅ `.env` 파일 `.gitignore`에 포함
- ✅ API 키를 코드에 하드코딩 금지
- ✅ Cloudinary upload preset을 **Unsigned**로 설정
- ✅ Supabase Row Level Security (RLS) 활성화
- ✅ Google OAuth 도메인 제한 설정

---

## 📚 참고 문서

### 공식 문서
- [Uppy Documentation](https://uppy.io/docs/)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

### 프로젝트 문서
- [README.md](README.md): 프로젝트 소개
- [docs/prd.md](docs/prd.md): 제품 요구사항 문서
- [tasks/tickets/](tasks/tickets/): 이슈 티켓 목록

---

## 🎯 핵심 원칙

1. **한글 우선**: 코드 주석, 문서, 커밋 메시지 모두 한글
2. **상대 경로**: 파일 경로는 상대 경로 사용
3. **에러 로깅**: 모든 에러는 console.error로 출력
4. **사용자 피드백**: alert 또는 UI로 사용자에게 피드백
5. **보안**: API 키는 환경 변수로 관리

---

**v1.0.0 변경사항**:
- 🎉 Contents Factory 전용 가이드 작성
- 📦 모노레포 구조에서 단일 프로젝트 레포로 변경
- 🔧 개발 워크플로우 명확화
- 🐛 디버깅 섹션 추가

*이 문서는 Contents Factory 프로젝트의 개발 가이드입니다.*
