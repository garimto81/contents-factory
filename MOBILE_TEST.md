# 📱 스마트폰 테스트 가이드

Photo Factory MVP - 모바일 촬영 테스트 매뉴얼

---

## 🚀 빠른 시작 (5분)

### 1단계: PC에서 로컬 서버 실행

```bash
# 프로젝트 폴더로 이동
cd d:/AI/claude01/contents-factory/src/public

# Python HTTP 서버 실행 (포트 8080)
python -m http.server 8080
```

**실행 확인**:
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

---

### 2단계: PC의 로컬 IP 확인

**Windows**:
```bash
ipconfig
# WiFi 어댑터 무선 LAN:
#   IPv4 주소 . . . . . . . . . : 192.168.0.10  ← 이 IP 사용
```

**Mac/Linux**:
```bash
ifconfig | grep "inet "
# inet 192.168.0.10  ← 이 IP 사용
```

---

### 3단계: 스마트폰에서 접속

**조건**:
- ✅ **PC와 스마트폰이 같은 WiFi에 연결**되어 있어야 함

**접속 URL**:
```
http://192.168.0.10:8080/index.html
```
(192.168.0.10을 본인 PC IP로 변경)

---

## 📸 촬영 테스트 시나리오

### 시나리오 1: 5개 카테고리 촬영

1. **로그인**
   - Google 계정으로 로그인

2. **입고 (before_car)** 탭
   - "📸 촬영하기" 버튼 클릭
   - 후면 카메라로 차량 전체 촬영
   - **자동 업로드 시작** (진행바 확인)
   - 체크마크 표시 확인 ✓

3. **문제 (before_wheel)** 탭
   - 손상된 휠 클로즈업 촬영
   - 자동 업로드 확인

4. **과정 (during)** 탭
   - 작업 중 모습 촬영
   - 자동 업로드 확인

5. **해결 (after_wheel)** 탭
   - 복원 완료 휠 촬영
   - 자동 업로드 확인

6. **출고 (after_car)** 탭
   - 작업 완료 차량 전체 촬영
   - 자동 업로드 확인

7. **작업 정보 입력**
   - 차종: "제네시스 G80"
   - 위치: "서울 강남점" (선택사항)

8. **업로드 완료** 버튼 클릭
   - Supabase 저장 확인
   - 갤러리로 자동 이동

---

## 🔍 확인 사항

### ✅ 체크리스트

- [ ] 카메라 권한 요청 팝업 표시
- [ ] 후면 카메라 자동 선택
- [ ] 촬영 즉시 업로드 시작
- [ ] 진행바 표시 (0% → 100%)
- [ ] 업로드 완료 체크마크 ✓
- [ ] 탭 배지 숫자 증가 (0 → 1 → 2...)
- [ ] 갤러리에서 작업 조회 가능
- [ ] 작업 상세에서 사진 확대 보기

---

## 🐛 문제 해결

### "카메라가 작동하지 않습니다"

**해결**:
1. 브라우저 설정 → 사이트 권한 → 카메라 허용
2. Chrome 설정 → 개인정보 보호 → 사이트 설정 → 카메라 → 허용

---

### "업로드가 시작되지 않습니다"

**확인**:
1. `.env` 파일 설정 확인
   ```env
   CLOUDINARY_CLOUD_NAME=실제클라우드이름
   CLOUDINARY_UPLOAD_PRESET=photo-factory
   ```

2. `src/js/config.js` 파일 확인
   ```javascript
   export const CLOUDINARY_CLOUD_NAME = '실제클라우드이름';
   export const CLOUDINARY_UPLOAD_PRESET = 'photo-factory';
   ```

3. Cloudinary Upload Preset 설정 확인
   - Settings → Upload → photo-factory
   - **Signing Mode: Unsigned** ✓

---

### "같은 WiFi인데 접속이 안 됩니다"

**해결**:
1. 방화벽 확인 (Windows)
   ```
   제어판 → Windows Defender 방화벽
   → 고급 설정 → 인바운드 규칙
   → Python (포트 8080) 허용
   ```

2. 또는 ngrok 사용 (공개 URL 생성)
   ```bash
   # ngrok 설치
   choco install ngrok

   # 터널 생성
   ngrok http 8080

   # 출력된 URL로 접속 (예: https://abc123.ngrok.io)
   ```

---

### "HTTPS 필요 경고"

일부 브라우저는 카메라 접근에 HTTPS 필요

**해결**:
1. **ngrok 사용** (추천)
   ```bash
   ngrok http 8080
   # → https://abc123.ngrok.io (자동 HTTPS)
   ```

2. 또는 Chrome 플래그 활성화
   ```
   chrome://flags/#unsafely-treat-insecure-origin-as-secure
   → http://192.168.0.10:8080 추가
   ```

---

## 🎯 테스트 시나리오별 예상 시간

| 시나리오 | 소요 시간 |
|----------|-----------|
| 환경 설정 (최초 1회) | 15분 |
| 5개 카테고리 촬영 | 2분 |
| 작업 정보 입력 | 30초 |
| 갤러리 조회 | 30초 |
| **전체** | **3분** |

---

## 📊 성능 측정

### 측정 항목

1. **촬영 → 업로드 시작**: < 1초
2. **업로드 완료** (1장 3MB): < 5초
3. **Supabase 저장**: < 1초
4. **갤러리 로드**: < 2초

---

## 🔒 보안 체크

### ✅ 확인 사항

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지
- [ ] Cloudinary Upload Preset이 **Unsigned**인지
- [ ] Supabase RLS 정책 활성화 확인
- [ ] 본인 작업만 조회 가능한지

---

## 📱 지원 브라우저 (모바일)

| 브라우저 | 카메라 | 자동업로드 | 권장 |
|----------|--------|------------|------|
| Chrome (Android/iOS) | ✅ | ✅ | ⭐⭐⭐ |
| Safari (iOS) | ✅ | ✅ | ⭐⭐⭐ |
| Samsung Internet | ✅ | ✅ | ⭐⭐ |
| Firefox (Android) | ✅ | ✅ | ⭐⭐ |

---

## 🚀 프로덕션 배포 후 테스트

### Vercel 배포 후

1. **URL 확인**
   ```
   https://photo-factory.vercel.app
   ```

2. **HTTPS 자동 적용**
   - 카메라 권한 문제 없음
   - 어디서나 접속 가능

3. **환경변수 설정**
   ```
   Vercel Dashboard → Settings → Environment Variables
   → CLOUDINARY_CLOUD_NAME
   → CLOUDINARY_UPLOAD_PRESET
   ```

---

## 📞 문제 발생 시

**디버깅 도구**:
1. Chrome DevTools (모바일)
   ```
   chrome://inspect
   → Remote Devices
   → Inspect
   ```

2. 콘솔 로그 확인
   ```javascript
   ✅ Upload page with Uppy initialized
   ✅ 입고 사진 업로드 완료: https://...
   ```

---

## 🎓 참고 자료

- [Uppy 공식 문서](https://uppy.io/docs/)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

**테스트 성공 기준**:
✅ 5개 카테고리 각각 2장 촬영
✅ 자동 업로드 완료
✅ 갤러리에서 조회 가능
✅ 작업 상세에서 Lightbox 작동

**Happy Testing! 📸**
