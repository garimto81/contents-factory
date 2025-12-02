# 📱 모바일 테스트 가이드 - Photo Factory

**현재 서버 주소**: http://10.10.100.90:3001
**업데이트**: 2025-01-12

---

## 🚀 빠른 시작

### 1. 개발 서버 실행 (이미 실행 중)
```bash
npm run dev
```

서버 출력:
```
✓ Local:   http://localhost:3001/
✓ Network: http://10.10.100.90:3001/
```

### 2. 모바일에서 접속

**같은 Wi-Fi 네트워크에 연결된 모바일 기기에서:**

#### 로그인 페이지:
```
http://10.10.100.90:3001/public/index.html
```

#### 업로드 페이지 (로그인 후):
```
http://10.10.100.90:3001/public/upload.html
```

#### 갤러리 페이지:
```
http://10.10.100.90:3001/public/gallery.html
```

---

## 📋 모바일 테스트 체크리스트

### ✅ 기본 기능 테스트

#### 1. 로그인 (index.html)
- [ ] 페이지가 정상적으로 로드되는지 확인
- [ ] "Google로 시작하기" 버튼이 보이는지
- [ ] Google OAuth 로그인 작동 확인
- [ ] 로그인 후 upload.html로 자동 이동

#### 2. 사진 촬영/업로드 (upload.html)
- [ ] 페이지 레이아웃이 모바일에서 정상인지
- [ ] 제목 입력 필드가 보이는지
- [ ] Uppy Dashboard가 정상 표시되는지
- [ ] "📸 촬영하기" 버튼 클릭 시 카메라 활성화
- [ ] 후면 카메라가 기본으로 열리는지
- [ ] 사진 촬영 후 자동 업로드 확인
- [ ] 썸네일이 그리드에 표시되는지
- [ ] 여러 장 촬영 (3장 이상)
- [ ] 배지 숫자가 증가하는지
- [ ] 사진 삭제 버튼(X) 작동 확인
- [ ] "업로드 완료" 버튼 클릭 시 갤러리로 이동

#### 3. 갤러리 (gallery.html)
- [ ] 작업 목록이 카드 형태로 표시
- [ ] 썸네일 이미지가 정상 표시
- [ ] 작업번호, 제목, 날짜가 표시
- [ ] 작업 카드 클릭 시 상세 페이지로 이동
- [ ] 검색 필터 작동 확인
- [ ] + 버튼 클릭 시 업로드 페이지로 이동

#### 4. 작업 상세 (job-detail.html)
- [ ] 모든 사진이 그리드로 표시
- [ ] 사진 클릭 시 원본 크기로 확대
- [ ] 스와이프로 사진 전환
- [ ] "목록으로" 버튼 작동

---

## 📸 모바일 카메라 테스트

### Uppy Webcam 기능
- **촬영 모드**: 사진만 (비디오 없음)
- **기본 카메라**: 후면 카메라 (environment)
- **전환**: 카메라 전환 버튼으로 전면/후면 변경 가능

### 테스트 시나리오:
1. **후면 카메라 촬영**
   - Uppy에서 "📸 Take a picture" 클릭
   - 후면 카메라가 활성화되는지 확인
   - 사진 촬영 후 자동 업로드 확인

2. **파일 선택 업로드**
   - "My Device" 또는 "Browse" 클릭
   - 갤러리에서 사진 선택
   - 선택한 사진이 자동 업로드되는지

3. **여러 장 촬영**
   - 연속으로 3장 이상 촬영
   - 각각의 사진이 개별 업로드되는지
   - 썸네일이 순서대로 표시되는지

---

## 🔍 모바일 디버깅

### Chrome DevTools (원격 디버깅)

#### Android:
```bash
1. 모바일 설정 → 개발자 옵션 → USB 디버깅 활성화
2. USB로 PC 연결
3. Chrome에서 chrome://inspect 접속
4. 모바일 디바이스 선택 → "Inspect" 클릭
```

#### iOS (Safari):
```bash
1. 설정 → Safari → 고급 → 웹 속성 활성화
2. Mac에서 Safari → 개발 메뉴 → [디바이스명] 선택
```

### 브라우저 콘솔 확인
모바일 브라우저에서:
```javascript
// 에러 확인
window.onerror = function(msg, url, line) {
  alert('Error: ' + msg + ' at ' + url + ':' + line);
};

// 환경변수 확인
console.log('ENV:', {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  CLOUDINARY: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
});
```

---

## 🌐 네트워크 요구사항

### 필수 조건:
- ✅ PC와 모바일이 **같은 Wi-Fi** 네트워크에 연결
- ✅ 방화벽에서 포트 3001 허용 (또는 방화벽 임시 비활성화)

### 방화벽 설정 (Windows):
```bash
# PowerShell (관리자 권한)
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

### 네트워크 확인:
```bash
# PC에서 확인
ipconfig

# Wi-Fi 어댑터의 IPv4 주소 확인
# 예: 10.10.100.90

# 모바일에서 확인
# Wi-Fi 설정 → 연결된 네트워크 정보 확인
# IP 주소가 같은 대역(10.10.100.x)인지 확인
```

---

## 🐛 문제 해결

### 1. "사이트에 연결할 수 없음" 오류

**원인**: 방화벽 또는 네트워크 문제

**해결 방법**:
```bash
# 1. 같은 Wi-Fi 네트워크 확인
#    PC: 10.10.100.90
#    모바일: 10.10.100.xxx (같은 대역)

# 2. 서버 실행 확인 (PC에서)
npm run dev

# 3. 방화벽 규칙 추가 또는 비활성화

# 4. PC에서 브라우저로 먼저 테스트
http://10.10.100.90:3001/public/index.html
```

---

### 2. 카메라가 작동하지 않음

**원인**: 브라우저 권한 또는 HTTPS 필요

**해결 방법**:
```bash
# 1. 브라우저 권한 확인
#    - 카메라 권한 허용했는지 확인
#    - 사이트 설정 → 권한 → 카메라 "허용"

# 2. HTTPS 사용 (필요 시)
#    일부 브라우저는 HTTPS에서만 카메라 허용
```

**HTTPS 로컬 서버 설정** (선택사항):
```bash
# mkcert 설치
npm install -g mkcert

# 로컬 인증서 생성
mkcert -install
mkcert localhost 10.10.100.90

# vite.config.js 수정
server: {
  https: {
    key: './localhost+1-key.pem',
    cert: './localhost+1.pem',
  },
  host: '0.0.0.0',
  port: 3001,
}
```

---

### 3. Google 로그인 리다이렉트 오류

**원인**: Supabase OAuth Redirect URL 설정

**해결 방법**:
```bash
1. Supabase Dashboard → Authentication → URL Configuration
2. Redirect URLs에 추가:
   - http://10.10.100.90:3001/public/upload.html
   - http://localhost:3001/public/upload.html
```

---

### 4. 이미지 업로드 실패

**원인**: Cloudinary 설정 또는 네트워크

**확인 사항**:
```javascript
// 브라우저 콘솔에서 확인
console.log('Cloudinary Config:', {
  cloud_name: window.CLOUDINARY_CLOUD_NAME,
  upload_preset: window.CLOUDINARY_UPLOAD_PRESET
});
```

**해결**:
- .env 파일에 올바른 Cloudinary 키 확인
- Cloudinary Upload Preset이 "unsigned"로 설정되어 있는지 확인

---

## 📊 성능 테스트

### 모바일 네트워크 환경 테스트

#### Chrome DevTools Network Throttling:
```
1. F12 → Network 탭
2. Throttling: "Fast 3G" 또는 "Slow 3G" 선택
3. 업로드 속도 확인
```

#### 측정 항목:
- **페이지 로드 시간**: < 3초
- **사진 업로드 시간**: < 10초 (10MB 기준)
- **썸네일 표시 시간**: < 1초

---

## ✅ 모바일 UI/UX 체크리스트

### 반응형 디자인
- [ ] 화면이 가로/세로 회전 시 레이아웃 정상
- [ ] 버튼 크기가 터치하기 적절한지 (최소 44x44px)
- [ ] 텍스트 크기가 모바일에서 읽기 편한지
- [ ] 스크롤이 부드러운지
- [ ] 입력 필드 포커스 시 화면이 너무 확대되지 않는지

### 터치 제스처
- [ ] 스와이프로 사진 전환 (상세 페이지)
- [ ] 핀치 줌 (사진 확대/축소)
- [ ] 길게 누르기 (컨텍스트 메뉴)

### 성능
- [ ] 스크롤 시 버벅임 없음
- [ ] 사진 로딩 시 플레이스홀더 표시
- [ ] 업로드 중 진행률 표시

---

## 🎯 실제 사용 시나리오 테스트

### 시나리오 1: 현장 촬영 워크플로우
```
1. 모바일로 현장 도착
2. Photo Factory 접속 (북마크 사용)
3. 제목 입력: "2025 WSOP 메인 이벤트"
4. 카메라로 연속 촬영 (5-10장)
5. 각 사진이 자동 업로드되는 것 확인
6. "업로드 완료" 클릭
7. 갤러리에서 방금 업로드한 작업 확인
```

### 시나리오 2: 네트워크 불안정 환경
```
1. 사진 촬영 시작
2. 업로드 중 Wi-Fi 끊기 (의도적)
3. 에러 메시지 확인
4. Wi-Fi 재연결
5. 재업로드 또는 재시도 기능 확인
```

### 시나리오 3: 여러 작업 처리
```
1. 작업 A 업로드 (3장)
2. 갤러리로 이동
3. + 버튼으로 새 작업 시작
4. 작업 B 업로드 (5장)
5. 갤러리에서 두 작업 모두 표시되는지 확인
```

---

## 📱 권장 테스트 기기

### 최소 요구사항:
- **Android**: 8.0 이상, Chrome 90+
- **iOS**: 14.0 이상, Safari 14+

### 추천 테스트 기기:
1. **Android**: Samsung Galaxy S21 이상
2. **iOS**: iPhone 12 이상
3. **태블릿**: iPad Pro, Galaxy Tab

---

## 🔗 접속 URL 요약

| 페이지 | URL |
|--------|-----|
| 로그인 | http://10.10.100.90:3001/public/index.html |
| 업로드 | http://10.10.100.90:3001/public/upload.html |
| 갤러리 | http://10.10.100.90:3001/public/gallery.html |
| 상세 | http://10.10.100.90:3001/public/job-detail.html |

---

## 📞 지원

### 문제 보고:
- GitHub Issues
- 개발자 Slack/Discord

### 로그 수집:
모바일에서 문제 발생 시:
1. 브라우저 콘솔 스크린샷
2. Network 탭 스크린샷
3. 에러 메시지 복사

---

**마지막 업데이트**: 2025-01-12
**작성자**: Claude Code
**서버 주소**: http://10.10.100.90:3001
