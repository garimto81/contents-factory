# 📸 Photo Factory MVP

5-Category 포토 팩토리 자동화 시스템 - MVP 버전

현장 촬영 2분 + 마케터 가공 10분 = 3개 플랫폼 콘텐츠 자동 생성

---

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 1. 프로젝트 클론
git clone https://github.com/garimto81/contents-factory.git
cd contents-factory

# 2. 환경변수 설정
cp .env.example .env
# .env 파일을 열어 API 키 입력
```

### 2. Supabase 설정 (15분)

1. https://supabase.com 가입
2. 새 프로젝트 생성:
   - Name: `photo-factory`
   - Region: `Northeast Asia (Seoul)`
3. SQL Editor에서 실행:
   ```bash
   # sql/01_create_tables.sql 파일 내용 복사 → 실행
   ```
4. Authentication → Providers → Google 활성화
5. Settings → API에서 키 복사:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### 3. Cloudinary API 설정 (5분)

1. https://cloudinary.com 회원가입
2. Dashboard에서 **Cloud Name** 복사
3. Settings → Upload → **Add upload preset**:
   - Preset name: `photo-factory`
   - Signing Mode: **Unsigned** (중요! ⚠️)
   - Folder: `photo-factory` (선택사항)
4. `.env` 파일에 입력:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_UPLOAD_PRESET=photo-factory
   ```

### 4. 로컬 실행

```bash
# 간단한 HTTP 서버 실행 (Python 3)
cd src/public
python -m http.server 8080

# 또는 Node.js http-server
npx http-server -p 8080
```

브라우저에서 http://localhost:8080 접속

---

## 📁 프로젝트 구조

```
contents-factory/
├── docs/
│   └── prd.md                          # 개념 문서
├── tasks/prds/
│   ├── 0001-prd-5-category-photo-factory.md  # 기본 PRD
│   └── 0002-prd-ai-first-photo-factory.md    # AI 혁신 PRD
├── sql/
│   └── 01_create_tables.sql            # DB 스키마
├── src/
│   ├── public/
│   │   ├── index.html                  # ✅ 로그인 페이지 (완료)
│   │   ├── upload.html                 # 🔨 업로드 페이지 (TODO)
│   │   ├── gallery.html                # 🔨 갤러리 페이지 (TODO)
│   │   └── job-detail.html             # 🔨 작업 상세 페이지 (TODO)
│   ├── js/
│   │   ├── config.js                   # ✅ 설정 (완료)
│   │   ├── auth.js                     # ✅ 인증 (완료)
│   │   ├── upload.js                   # ✅ 업로드 (완료)
│   │   └── gallery.js                  # ✅ 갤러리 (완료)
│   └── css/
│       └── styles.css                  # 🔨 커스텀 스타일 (TODO)
├── .env.example                        # ✅ 환경변수 템플릿
├── .gitignore                          # ✅ Git 제외 파일
└── README.md                           # ✅ 이 파일
```

### 진행 상태

- ✅ **완료**: SQL 스키마, JavaScript 모듈, 모든 HTML 페이지, CSS 스타일
- ✅ **v1.1.0**: Uppy 통합 - 자동 업로드 + 웹캠 지원 + 진행바

---

## 🔧 기술 스택 (100% 무료)

| 레이어 | 기술 | 비용 |
|--------|------|------|
| Frontend | PWA + HTML5 | $0 |
| UI | Bootstrap 5 + **Uppy** | $0 |
| 인증 | Supabase Auth | $0 (월 5만 사용자) |
| DB | Supabase PostgreSQL | $0 (500MB) |
| 이미지 | **Cloudinary** | $0 (25 credits/월) |
| 호스팅 | Vercel / Netlify | $0 (100GB/월) |

---

## 📊 데이터베이스 스키마

### jobs 테이블
```sql
- id: UUID (PK)
- job_number: TEXT (예: WHL001)
- work_date: DATE
- car_model: TEXT (예: 제네시스 G80)
- technician_id: UUID (FK → auth.users)
- status: TEXT (uploaded, processing, published)
- location: TEXT (선택)
```

### photos 테이블
```sql
- id: UUID (PK)
- job_id: UUID (FK → jobs)
- category: TEXT (before_car, before_wheel, during, after_wheel, after_car)
- cloudinary_url: TEXT
- cloudinary_public_id: TEXT
- thumbnail_url: TEXT
- sequence: INTEGER
```

---

## 🎯 다음 단계 (TODO)

### Step 1: 로컬 테스트 (30분)
1. 로그인 → Google OAuth
2. 촬영 → 5개 카테고리 × 2장 (Uppy 자동 업로드)
3. 업로드 → Cloudinary + Supabase 저장
4. 갤러리 → 작업 목록 조회

### Step 2: Vercel 배포 (15분)

**방법 1: GitHub 연동 (추천) 🚀**
1. Vercel 대시보드: https://vercel.com/dashboard
2. **New Project** → `garimto81/contents-factory` 선택
3. **Environment Variables** 설정:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_UPLOAD_PRESET`
4. **Deploy** 클릭

**방법 2: CLI 배포**
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인 및 배포
vercel login
vercel --prod
```

**상세 가이드**: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) 참조

---

## 📖 사용 가이드

### 기술자 (촬영)
1. 로그인 (Google 계정)
2. 업로드 페이지에서 5개 카테고리 순서대로 촬영
3. 차종 입력 후 "업로드 완료" 클릭

### 마케터 (조회)
1. 갤러리 페이지에서 작업 목록 확인
2. 작업 클릭 → 카테고리별 사진 조회
3. 사진 다운로드 → 템플릿에 적용

---

## 🐛 문제 해결

### "Supabase URL이 설정되지 않았습니다"
→ `src/js/config.js` 파일에서 API 키 입력 확인

### "Google 로그인 실패"
→ Supabase Dashboard → Authentication → Providers → Google 활성화 확인

### "사진 업로드 실패"
→ Cloudinary Cloud Name & Upload Preset 확인 + 파일 크기 10MB 이하 확인

### "Uppy가 표시되지 않음"
→ CDN 로딩 확인 (https://releases.transloadit.com/uppy/v3.21.0/uppy.min.js)

---

## 📄 라이선스

MIT License

---

## 🤝 기여

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 지원

- GitHub Issues: https://github.com/garimto81/contents-factory/issues
- PRD 문서: [tasks/prds/0001-prd-5-category-photo-factory.md](tasks/prds/0001-prd-5-category-photo-factory.md)

---

**Made with 🤖 Claude Code**
