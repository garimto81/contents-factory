# TODO - Photo Factory PWA

코드 리뷰 결과 (2025-12-01) 기반 개선 작업 목록

---

## Phase 1: Critical (즉시 수정) - 1-2일

### Security

- [ ] **XSS 취약점 수정** [Critical]
  - `src/js/utils/sanitizer.js` 생성 - `escapeHtml()` 함수
  - `gallery.html:397-436` - `job.car_model` 이스케이프
  - `upload.html:634-642` - `photo.filename` 이스케이프
  - `job-detail.html:504-511` - `job.car_model`, `job.job_number` 이스케이프

- [ ] **입력 검증 추가** [High]
  - `db-api.js` - `validateJobData()` 함수 추가
  - job_number 형식 검증: `/^WHL\d{6}\d{3}$/`
  - car_model 길이 제한: 100자
  - status 값 제한: `['uploaded', 'processing', 'published']`

### Performance

- [ ] **N+1 Query 수정** [Critical]
  - `db-api.js:63-75` - `anyOf()` 사용하여 단일 쿼리로 변경
  ```javascript
  const jobIds = jobs.map(j => j.id);
  const allPhotos = await db.photos.where('job_id').anyOf(jobIds).toArray();
  ```

- [ ] **Photo Count 최적화** [Critical]
  - `db.js:245-262` - `toArray()` 대신 `count()` 직접 사용
  - 복합 인덱스 추가: `[session_id+category]`

---

## Phase 2: High Priority - 1주일

### Logic

- [ ] **작업번호 Race Condition 수정** [Critical]
  - `db-api.js:319-347` - Optimistic Locking 패턴 적용
  - job_number 존재 여부 확인 후 생성
  - 충돌 시 Retry (최대 5회)

- [ ] **Timezone 불일치 수정** [Critical]
  - `db-api.js:321-326` - 모든 날짜 계산을 Local 시간 기준으로 통일
  - `toISOString()` 대신 Local 날짜 포맷 사용

- [ ] **State 동기화 수정** [Critical]
  - `state.js:208-232` - IndexedDB 저장 성공 후에만 LocalStorage 업데이트
  - Try-Catch + Rollback 패턴 적용

- [ ] **Transaction 적용** [High]
  - `db-api.js:139-158` - `db.transaction('rw', ...)` 사용
  - Job 삭제 시 Photos 함께 삭제 (atomic)

### Security

- [ ] **파일 업로드 검증** [High]
  - `upload.html:537-584`
  - 파일 크기 제한: 10MB
  - 파일 타입 제한: `['image/jpeg', 'image/png', 'image/webp']`
  - 전체 파일 수 제한: 50장

### Performance

- [ ] **Bulk Insert 적용** [High]
  - `upload.html:701-719` - `bulkAdd()` 사용
  - 개별 insert 50개 → 단일 bulkAdd 1개

- [ ] **Base64 이중 변환 제거** [High]
  - `db-api.js:369-410` - `URL.createObjectURL()` 사용
  - File → Blob URL → Canvas → Base64 (한번만 변환)

---

## Phase 3: Medium Priority - 2-4주

### Security

- [ ] **CSP 헤더 적용** [Medium]
  - `vite.config.js` - 서버 헤더에 CSP 추가
  - 또는 HTML meta 태그로 적용

- [ ] **민감 정보 로깅 제거** [Medium]
  - `src/js/utils/logger.js` 생성
  - 프로덕션에서 console.log 비활성화
  - 에러만 항상 로깅

- [ ] **세션 타임아웃 조정** [Medium]
  - `state.js:295-299` - 24시간 → 8시간 + 비활성 30분
  - 만료 시 사용자 확인 후 삭제

### Logic

- [ ] **Retry 타임아웃 추가** [High]
  - `retry.js:16-61`
  - 최대 지연: 30초
  - 전체 타임아웃: 2분

- [ ] **에러 타입 판별 개선** [High]
  - `errors.js:139-155` - 비재시도 에러 명시적 정의
  - QuotaExceededError, SecurityError 등 추가

- [ ] **비디오 생성 타임아웃** [Medium]
  - `video-generator.js:64-119` - 최대 60초 제한
  - 프레임 렌더링 에러 처리

- [ ] **Sequence 정렬 통일** [Medium]
  - `state.js:208-232, 241-254`
  - IndexedDB와 LocalStorage sequence 값 통일

### Performance

- [ ] **DOM 렌더링 최적화** [High]
  - `upload.html:617-643` - DocumentFragment 사용
  - 전체 innerHTML 교체 → 증분 업데이트

- [ ] **Image 메모리 해제** [High]
  - `video-generator.js:43-45` - 비디오 생성 완료 후 `img.src = ''`

- [ ] **IndexedDB 인덱스 추가** [Medium]
  - `db.js` - version 3 마이그레이션
  - 복합 인덱스: `[session_id+category]`, `[job_id+sequence]`

- [ ] **번들 최적화** [Medium]
  - `vite.config.js` - terser 옵션 추가
  - `drop_console: true` (프로덕션)

---

## Phase 4: Low Priority - 다음 스프린트

### Style

- [ ] **Deprecated 메서드 교체** [High]
  - `db.js:182` - `substr()` → `slice()`

- [ ] **Magic Numbers 상수화** [Medium]
  - 24시간, 30분 등 → 상수 정의
  - `MS_PER_HOUR`, `MS_PER_DAY` 등

- [ ] **JSDoc 보완** [Low]
  - `@private` 태그 추가
  - 반환 타입 상세화
  - 모듈 레벨 문서 추가

- [ ] **사용하지 않는 Import 정리** [Low]
  - `tests/unit/upload.test.js:3` - `addPhotoToCategory`

### Security

- [ ] **crypto.getRandomValues 적용** [Low]
  - `db.js:182` - `Math.random()` 대체

- [ ] **CDN SRI 해시 추가** [Low]
  - Bootstrap, Bootstrap Icons integrity 속성 추가

---

## 테스트 추가

### Security Tests

- [ ] XSS 방지 테스트
  ```javascript
  it('should escape HTML in user input', () => {
    expect(escapeHtml('<script>alert("XSS")</script>'))
      .not.toContain('<script>');
  });
  ```

### Logic Tests

- [ ] Race Condition 테스트
  ```javascript
  it('should generate unique job numbers concurrently', async () => {
    const results = await Promise.all([
      generateJobNumber(),
      generateJobNumber(),
      generateJobNumber()
    ]);
    const unique = new Set(results.map(r => r.data));
    expect(unique.size).toBe(3);
  });
  ```

- [ ] State 동기화 테스트
  ```javascript
  it('should rollback on IndexedDB failure', async () => {
    vi.spyOn(db.temp_photos, 'add').mockRejectedValue(new Error('Quota'));
    await expect(state.addPhoto('before_car', photo)).rejects.toThrow();
    expect(state.getPhotoCount()).toBe(0);
  });
  ```

---

## 완료된 항목

### Phase 1 (2025-12-01)

- [x] **XSS 취약점 수정** [Critical]
  - `src/js/utils/sanitizer.js` 생성
  - `gallery.html`, `upload.html`, `job-detail.html` escapeHtml 적용

- [x] **입력 검증 추가** [High]
  - `db-api.js` - `validateJobData()`, `validateFile()` 함수 추가

- [x] **N+1 Query 수정** [Critical]
  - `db-api.js:131-150` - `anyOf()` 사용하여 단일 쿼리로 변경

- [x] **Photo Count 최적화** [Critical]
  - `db.js:246-272` - `filter()` + `count()` 사용 (이미지 데이터 로드 안 함)

---

## 참고

- 코드 리뷰 보고서: 2025-12-01
- 총 발견 이슈: 56개 (Critical 9, High 16, Medium 19, Low 12)
- 전체 점수: 62/100
