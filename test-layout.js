// Playwright를 사용하여 upload.html의 실제 렌더링 상태를 확인
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // 모바일 뷰포트 설정 (iPhone 12 Pro)
  await page.setViewportSize({ width: 390, height: 844 });

  console.log('📱 페이지 로딩 중...');
  await page.goto('http://10.10.100.90:8080/public/upload.html');

  // 페이지 로드 대기
  await page.waitForTimeout(3000);

  console.log('\n=== 1. 기본 구조 확인 ===');

  // .upload-container 확인
  const containerExists = await page.locator('.upload-container').count();
  console.log(`✓ .upload-container 존재: ${containerExists > 0 ? 'Yes' : 'No'}`);

  // flexbox 속성 확인
  const containerStyle = await page.locator('.upload-container').evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      display: computed.display,
      flexDirection: computed.flexDirection,
      height: computed.height
    };
  });
  console.log('  - display:', containerStyle.display);
  console.log('  - flex-direction:', containerStyle.flexDirection);
  console.log('  - height:', containerStyle.height);

  console.log('\n=== 2. 상단 고정 영역 (.fixed-top-section) ===');
  const topSectionExists = await page.locator('.fixed-top-section').count();
  console.log(`✓ .fixed-top-section 존재: ${topSectionExists > 0 ? 'Yes' : 'No'}`);

  if (topSectionExists > 0) {
    const topStyle = await page.locator('.fixed-top-section').evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        flexShrink: computed.flexShrink,
        position: computed.position,
        top: rect.top,
        height: rect.height
      };
    });
    console.log('  - flex-shrink:', topStyle.flexShrink);
    console.log('  - position:', topStyle.position);
    console.log('  - top:', topStyle.top);
    console.log('  - height:', topStyle.height);
  }

  console.log('\n=== 3. 중간 스크롤 영역 (.tab-content) ===');
  const tabContentExists = await page.locator('.tab-content').count();
  console.log(`✓ .tab-content 존재: ${tabContentExists > 0 ? 'Yes' : 'No'}`);

  if (tabContentExists > 0) {
    const contentStyle = await page.locator('.tab-content').evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        flex: computed.flex,
        overflowY: computed.overflowY,
        height: rect.height,
        scrollHeight: el.scrollHeight
      };
    });
    console.log('  - flex:', contentStyle.flex);
    console.log('  - overflow-y:', contentStyle.overflowY);
    console.log('  - height:', contentStyle.height);
    console.log('  - scrollHeight:', contentStyle.scrollHeight);
    console.log('  - 스크롤 가능:', contentStyle.scrollHeight > contentStyle.height ? 'Yes' : 'No');
  }

  console.log('\n=== 4. 하단 고정 버튼 (.fixed-bottom-section) ===');
  const bottomSectionExists = await page.locator('.fixed-bottom-section').count();
  console.log(`✓ .fixed-bottom-section 존재: ${bottomSectionExists > 0 ? 'Yes' : 'No'}`);

  if (bottomSectionExists > 0) {
    const bottomStyle = await page.locator('.fixed-bottom-section').evaluate(el => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      return {
        flexShrink: computed.flexShrink,
        position: computed.position,
        bottom: viewportHeight - rect.bottom,
        top: rect.top,
        height: rect.height,
        isAtBottom: Math.abs(viewportHeight - rect.bottom) < 5
      };
    });
    console.log('  - flex-shrink:', bottomStyle.flexShrink);
    console.log('  - position:', bottomStyle.position);
    console.log('  - bottom:', bottomStyle.bottom);
    console.log('  - 화면 하단에 고정:', bottomStyle.isAtBottom ? 'Yes ✅' : 'No ❌');
  }

  console.log('\n=== 5. 업로드 완료 버튼 (#submitBtn) ===');
  const submitBtnExists = await page.locator('#submitBtn').count();
  console.log(`✓ #submitBtn 존재: ${submitBtnExists > 0 ? 'Yes' : 'No'}`);

  if (submitBtnExists > 0) {
    const btnStyle = await page.locator('#submitBtn').evaluate(el => {
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      return {
        visible: rect.width > 0 && rect.height > 0,
        top: rect.top,
        bottom: rect.bottom,
        needsScroll: rect.top > viewportHeight
      };
    });
    console.log('  - 버튼 보임:', btnStyle.visible ? 'Yes' : 'No');
    console.log('  - top:', btnStyle.top);
    console.log('  - bottom:', btnStyle.bottom);
    console.log('  - 스크롤 필요:', btnStyle.needsScroll ? 'Yes ❌' : 'No ✅');
  }

  console.log('\n=== 6. Uppy Dashboard 확인 ===');
  const uppyExists = await page.locator('[id^="uppy-"]').count();
  console.log(`✓ Uppy Dashboard 컨테이너: ${uppyExists}개`);

  if (uppyExists > 0) {
    const uppyRendered = await page.locator('.uppy-Dashboard').count();
    console.log(`✓ Uppy Dashboard 렌더링: ${uppyRendered > 0 ? 'Yes' : 'No'}`);

    const webcamBtn = await page.locator('.uppy-Dashboard-input').count();
    console.log(`✓ 카메라 버튼 (Take Picture): ${webcamBtn > 0 ? 'Yes' : 'No'}`);
  }

  console.log('\n=== 7. JavaScript 콘솔 에러 ===');
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });

  // 스크린샷 저장
  await page.screenshot({ path: 'upload-layout-test.png', fullPage: true });
  console.log('\n📸 스크린샷 저장: upload-layout-test.png');

  console.log('\n테스트 완료. 5초 후 브라우저 종료...');
  await page.waitForTimeout(5000);
  await browser.close();
})();
