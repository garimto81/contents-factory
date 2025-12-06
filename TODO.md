# TODO - Photo Factory PWA

코드 리뷰 결과 (2025-12-01) 기반 개선 작업 목록

---

## 완료된 항목

### Phase 1-4 (2025-12-01)

**보안 개선**
- [x] XSS 취약점 수정 - `sanitizer.js` 생성
- [x] 입력 검증 추가 - `validateJobData()`, `validateFile()`
- [x] CSP 헤더 적용 - `vite.config.js`
- [x] 민감 정보 로깅 제거 - `logger.js`
- [x] CDN SRI 해시 추가 - `index.html`

**성능 최적화**
- [x] N+1 Query 수정 - `anyOf()` 사용
- [x] Photo Count 최적화 - `filter()` + `count()`
- [x] Bulk Insert 적용 - 단일 bulkAdd
- [x] Base64 이중 변환 제거 - `URL.createObjectURL()`
- [x] IndexedDB 인덱스 추가 - 복합 인덱스
- [x] 번들 최적화 - terser `drop_console`
- [x] DOM 렌더링 최적화 - DocumentFragment

**안정성 개선**
- [x] 작업번호 Race Condition 수정 - Optimistic Locking
- [x] Timezone 불일치 수정 - Local 시간 기준
- [x] State 동기화 수정 - Try-Catch + Rollback
- [x] Transaction 적용 - `db.transaction('rw', ...)`
- [x] 세션 타임아웃 조정 - 8시간 + 비활성 30분
- [x] Retry 타임아웃 추가 - 최대 지연 30초
- [x] 에러 타입 판별 개선 - `getErrorCategory()`
- [x] 비디오 생성 타임아웃 - 최대 60초
- [x] Image 메모리 해제 - `img.src = ''`
- [x] Deprecated 메서드 교체 - `substr()` → `slice()`
- [x] crypto.getRandomValues 적용

---

## 남은 작업 (Optional)

### Style
- [ ] Magic Numbers 상수화 - `MS_PER_HOUR`, `MS_PER_DAY` 등
- [ ] JSDoc 보완 - `@private` 태그, 반환 타입 상세화
- [ ] 사용하지 않는 Import 정리

### Performance
- [ ] Sequence 정렬 통일 - IndexedDB와 LocalStorage sequence 값

---

## 테스트 결과

### E2E Tests (Playwright)
- **총 테스트**: 22개
- **통과**: 22개
- **실패**: 0개
- **브라우저**: Chrome, Firefox, Safari

---

## PRD 참조

미래 기능은 각 PRD 문서 참조:

| PRD | 제목 | 상태 | 위치 |
|-----|------|------|------|
| PRD-0011 | 쇼츠 품질 향상 | 계획됨 | `tasks/prds/0011-prd-shorts-enhancement.md` |
| PRD-0012 | 분산 아키텍처 | 계획됨 | `tasks/prds/0012-prd-distributed-architecture.md` |
| PRD-0013 | Field Uploader | MVP 완료 | `tasks/prds/0013-prd-field-uploader.md` |
| PRD-0014 | Shorts Generator | 진행 중 | `tasks/prds/0014-prd-shorts-generator.md` |
| PRD-0015 | 문서 리팩토링 | 완료 | `tasks/prds/0015-prd-documentation-refactoring.md` |

---

## 참고

- 코드 리뷰: 2025-12-01
- 초기 점수: 62/100 → **개선 후: ~85/100**
- 발견 이슈: 56개 (Critical 9, High 16, Medium 19, Low 12)
