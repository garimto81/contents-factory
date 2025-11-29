# PRD-0003: 업로드 페이지 UI/UX 개선

**작성일**: 2025-01-12
**작성자**: Claude AI
**관련 이슈**: [GitHub Issue #1](https://github.com/garimto81/contents-factory/issues/1)
**우선순위**: P1 (High)
**예상 작업 시간**: 4-6시간

---

## 1. 배경 (Background)

### 문제 상황
현재 모바일 업로드 페이지에서 다음 UX 문제가 발생:
1. **카메라 버튼 축소 문제**: CSS로 150px 설정했으나 실제로는 더 작게 렌더링됨
2. **모바일 스크롤 발생**: 원스크린 폼 의도했으나 콘텐츠 높이 초과로 스크롤 발생
3. **Uppy "내 기기" 버튼 표시**: 카메라만 표시해야 하나 파일 선택 버튼도 함께 노출
4. **업로드 기능 미작동**: 에러 로그 없이 조용히 실패

### 비즈니스 임팩트
- 사용자가 사진 촬영 어려움 (버튼 작음)
- 모바일 UX 저하 (스크롤 필요)
- 업로드 불가로 서비스 이용 불가

---

## 2. 목표 (Goals)

### 핵심 목표
1. ✅ 모바일에서 카메라 버튼이 의도한 크기(150px+)로 정상 표시
2. ✅ 초기 화면이 스크롤 없이 한 화면에 완전히 표시
3. ✅ Uppy에서 "내 기기" 버튼 완전히 숨김 (카메라만 표시)
4. ✅ 업로드 기능 정상 작동 (다음 Phase에서 처리)

### 성공 지표
- 모바일 테스트: 카메라 버튼 150px 이상 렌더링 확인
- 초기 로딩 시 스크롤 없이 모든 UI 표시
- Uppy Dashboard에서 "Browse files" 버튼 미표시
- 사진 촬영 후 그리드가 모달/슬라이드로 분리 표시

---

## 3. 범위 (Scope)

### In Scope ✅
1. **카메라 버튼 CSS 수정**
   - 150px 크기가 정상 렌더링되도록 CSS 디버깅
   - 모바일 뷰포트에서 크기 보장

2. **모바일 레이아웃 최적화**
   - 초기 화면을 원스크린으로 조정
   - 헤더, 제목 입력, 카메라 버튼만 표시
   - 사진 그리드는 모달/슬라이드로 분리

3. **Uppy 설정 변경**
   - Dashboard 옵션에서 파일 선택 비활성화
   - Webcam 플러그인만 활성화
   - `disableLocalFiles: true` 추가

4. **테스트 케이스 작성**
   - Playwright를 사용한 모바일 UI 테스트
   - 카메라 버튼 크기 검증
   - 스크롤 발생 여부 체크

### Out of Scope ❌
- 업로드 실패 문제 (Phase 2에서 처리)
- Uppy 라이브러리 교체 (현재 버전에서 해결 우선)
- 데스크톱 레이아웃 변경
- 새로운 기능 추가

---

## 4. 기술 사양 (Technical Specification)

### 4.1 카메라 버튼 수정

**파일**: `src/public/upload.html`

**현재 코드** (121-134줄):
```css
.camera-btn {
  width: 100%;
  height: 150px;
  border: 3px dashed #667eea;
  /* ... */
}
```

**문제점**:
- 부모 컨테이너의 padding/margin으로 실제 크기 축소
- 모바일에서 flex 레이아웃으로 인한 높이 손실

**해결 방안**:
```css
.camera-btn {
  width: 100%;
  min-height: 180px; /* height → min-height */
  max-width: 500px;  /* 최대 너비 제한 */
  margin: 0 auto;    /* 중앙 정렬 */
  /* ... */
}

/* 모바일 전용 */
@media (max-width: 768px) {
  .camera-btn {
    min-height: 200px; /* 모바일에서 더 크게 */
    font-size: 1.1rem;
  }
}
```

---

### 4.2 Uppy 설정 변경

**파일**: `src/public/upload.html` (390-440줄)

**현재 코드**:
```javascript
.use(Dashboard, {
  inline: true,
  target: `#uppy-${category.id}`,
  height: 200,
  /* ... */
})
```

**수정 사항**:
```javascript
.use(Dashboard, {
  inline: true,
  target: `#uppy-${category.id}`,
  height: 250,  // 200 → 250
  proudlyDisplayPoweredByUppy: false,
  showProgressDetails: true,
  hideUploadButton: true,
  disableLocalFiles: true,  // ⭐ 핵심: 파일 선택 비활성화
  onlyAllowNewFiles: true,
  /* ... */
})
```

**CSS 추가** (232-236줄):
```css
/* Uppy Dashboard 파일 선택 영역 완전히 숨김 */
.uppy-Dashboard-AddFiles,
.uppy-Dashboard-AddFilesPanel,
.uppy-DashboardTab-btn[aria-label*="browse"],
.uppy-DashboardTab-btn:not([data-uppy-acquirer-id="Webcam"]) {
  display: none !important;
}

/* Webcam 버튼만 표시 */
.uppy-DashboardTab-btn[data-uppy-acquirer-id="Webcam"] {
  display: block !important;
  width: 100%;
  min-height: 60px;
  font-size: 1.2rem;
}
```

---

### 4.3 사진 그리드 모달/슬라이드 분리

**새로운 구조**:
```html
<!-- 사진 개수 표시 버튼 (그리드 대신) -->
<button class="photos-summary-btn" onclick="openPhotosModal()">
  <i class="bi bi-images"></i>
  촬영한 사진 <span class="badge">3</span>장 보기
</button>

<!-- 모달 -->
<div class="modal fade" id="photosModal">
  <div class="modal-dialog modal-fullscreen">
    <div class="modal-content">
      <div class="modal-header">
        <h5>촬영한 사진</h5>
        <button class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div id="photos-grid" class="photos-grid">
          <!-- 사진 썸네일 -->
        </div>
      </div>
    </div>
  </div>
</div>
```

**CSS**:
```css
.photos-summary-btn {
  width: 100%;
  padding: 15px;
  margin-top: 15px;
  border: 2px solid #667eea;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
}

.photos-summary-btn .badge {
  background: #28a745;
  color: white;
  margin: 0 5px;
  padding: 5px 10px;
  border-radius: 12px;
}
```

---

### 4.4 레이아웃 구조 변경

**변경 전**:
```
[Header]
[제목 입력]
[Uppy Dashboard (200px)]
[사진 그리드] ← 스크롤 발생
[업로드 버튼]
```

**변경 후**:
```
[Header]
[제목 입력]
[Uppy Dashboard (250px)]
[사진 개수 버튼] ← 클릭하면 모달
[업로드 버튼]
```

---

## 5. 테스트 계획 (Testing Plan)

### 5.1 단위 테스트

**파일**: `tests/upload-ui.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Upload Page - Mobile UI', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('카메라 버튼 크기 150px 이상', async ({ page }) => {
    await page.goto('/public/upload.html');

    const cameraBtn = page.locator('.camera-btn');
    const box = await cameraBtn.boundingBox();

    expect(box.height).toBeGreaterThanOrEqual(150);
  });

  test('초기 화면 스크롤 없음', async ({ page }) => {
    await page.goto('/public/upload.html');

    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    expect(scrollHeight).toBeLessThanOrEqual(viewportHeight + 50); // 50px 여유
  });

  test('Uppy Dashboard에 Browse 버튼 없음', async ({ page }) => {
    await page.goto('/public/upload.html');

    await page.waitForSelector('.uppy-Dashboard');

    const browseBtn = page.locator('.uppy-DashboardTab-btn:not([data-uppy-acquirer-id="Webcam"])');
    await expect(browseBtn).toBeHidden();
  });

  test('사진 개수 버튼 클릭 시 모달 표시', async ({ page }) => {
    await page.goto('/public/upload.html');

    // 사진 업로드 후 (mock)
    await page.evaluate(() => {
      window.currentJob.photos = { photos: [{ url: 'test.jpg' }] };
    });

    await page.click('.photos-summary-btn');

    const modal = page.locator('#photosModal');
    await expect(modal).toBeVisible();
  });
});
```

---

### 5.2 수동 테스트 체크리스트

| 항목 | 디바이스 | 기대 결과 | 확인 |
|------|---------|----------|------|
| 카메라 버튼 크기 | iPhone SE | 150px+ | ⬜ |
| 초기 화면 스크롤 | Galaxy S21 | 스크롤 없음 | ⬜ |
| Uppy Browse 숨김 | iPad Mini | 카메라만 표시 | ⬜ |
| 사진 모달 열기 | Pixel 6 | 모달 정상 표시 | ⬜ |

---

## 6. 마일스톤 (Milestones)

| Phase | 작업 | 예상 시간 | 담당 |
|-------|------|----------|------|
| 0 | ✅ PRD 작성 | 1h | Claude |
| 0.5 | Task List 생성 | 30m | Claude |
| 1 | 카메라 버튼 CSS 수정 | 1h | Dev |
| 2 | Uppy 설정 변경 | 1h | Dev |
| 3 | 사진 그리드 모달 분리 | 2h | Dev |
| 4 | 테스트 작성 및 실행 | 1.5h | QA |
| 5 | 버전 업데이트 (v1.1.0) | 30m | Dev |
| 6 | Git 커밋 & Push | 30m | Dev |

**Total**: ~6.5시간

---

## 7. 위험 요소 (Risks)

| 위험 | 확률 | 영향도 | 완화 방안 |
|------|------|--------|----------|
| Uppy 버전 호환성 | 중 | 중 | v3.21.0 문서 확인, 테스트 충분히 |
| 모바일 브라우저 차이 | 중 | 중 | iOS Safari, Chrome, Samsung Internet 테스트 |
| CSS 우선순위 충돌 | 낮 | 낮 | `!important` 최소화, 명확한 선택자 |
| 업로드 기능 영향 | 낮 | 높 | UI만 변경, 업로드 로직 건드리지 않음 |

---

## 8. 후속 작업 (Follow-ups)

1. **PRD-0004**: 업로드 실패 문제 해결
   - Cloudinary 설정 검증
   - 에러 핸들링 강화
   - 네트워크 오류 대응

2. **향후 개선**:
   - Uppy 대체 라이브러리 검토 (FilePond, react-dropzone)
   - 오프라인 지원 (Service Worker)
   - 사진 편집 기능 (크롭, 필터)

---

## 9. 참고 자료 (References)

- [Uppy Documentation](https://uppy.io/docs/)
- [Uppy Dashboard Options](https://uppy.io/docs/dashboard/#disableLocalFiles)
- [Bootstrap 5 Modal](https://getbootstrap.com/docs/5.3/components/modal/)
- [Playwright Mobile Testing](https://playwright.dev/docs/emulation)

---

## 10. 승인 (Approval)

- [ ] 기술 검토 (Tech Review)
- [ ] 디자인 검토 (Design Review)
- [ ] 제품 승인 (Product Approval)

**승인 후 Phase 0.5 (Task List 생성) 진행**

---

**PRD Version**: 1.0
**Last Updated**: 2025-01-12
