# E2E 테스트 도구 비교 분석 (2025)

**작성일**: 2025-12-05
**목적**: Playwright 대안으로 경량 E2E 테스트 도구 조사

---

## 요약 비교표

| 도구 | GitHub Stars | 라이선스 | 설치 복잡도 | 브라우저 지원 | PWA 지원 | 모바일 에뮬레이션 | 주요 장점 |
|------|--------------|----------|-------------|---------------|----------|-------------------|-----------|
| **Playwright** | 78.5k | Apache 2.0 | 2/5 | Chromium, Firefox, WebKit | ✅ 우수 | ✅ 우수 (터치, 지오로케이션) | 크로스 브라우저, 자동 대기, 풍부한 기능 |
| **Puppeteer** | ~88k | Apache 2.0 | 1/5 | Chromium (Firefox 실험적) | ✅ 가능 | ⚠️ 제한적 | 가볍고 빠름, Chrome DevTools 통합 |
| **TestCafe** | 9.9k | MIT | 1/5 | All major browsers | ✅ 가능 | ✅ 우수 (프록시 기반) | WebDriver 불필요, 자동 대기 |
| **Nightwatch.js** | ~12k | MIT | 3/5 | Selenium 지원 브라우저 | ⚠️ 설정 필요 | ⚠️ WebDriver 기반 | W3C WebDriver 표준, POM 지원 |
| **CodeceptJS** | ~4k | MIT | 2/5 | 멀티 백엔드 (Playwright, Puppeteer 등) | ✅ Playwright 통해 가능 | ✅ Appium 통해 가능 | BDD 스타일, AI 기능, 백엔드 교체 가능 |

**점수 기준 (설치 복잡도)**:
- 1/5: npm install만으로 즉시 실행 가능
- 2/5: 간단한 설정 파일 필요
- 3/5: WebDriver/Selenium 설정 필요
- 4/5: 추가 의존성 다수
- 5/5: 복잡한 환경 구성 필요

---

## 1. Puppeteer (Google)

### 기본 정보
- **GitHub Stars**: ~88,000
- **라이선스**: Apache 2.0
- **설치 복잡도**: ⭐ (1/5) - 가장 간단
- **유지보수**: Google Chrome DevTools 팀

### Playwright와의 차이점

| 항목 | Puppeteer | Playwright |
|------|-----------|------------|
| **브라우저 지원** | Chromium 전용 (Firefox 실험적) | Chromium, Firefox, WebKit |
| **언어 지원** | JavaScript/TypeScript | JS, TS, Python, Java, C# |
| **성능** | 짧은 스크립트 30% 빠름 | 네비게이션 작업 6% 빠름 (4.513초 vs 4.784초) |
| **빌트인 기능** | 기본적 | 풍부함 (병렬 테스트, 추적, 네트워크 가로채기) |
| **자동 대기** | 수동 wait 로직 필요 | 자동 대기 (flaky 테스트 감소) |
| **무게감** | 경량 | 기능 풍부 (무거움) |

### PWA/오프라인 테스트
- ✅ **지원**: Chrome DevTools Protocol을 통한 Service Worker 제어 가능
- Chrome 전용이므로 PWA 네이티브 동작 테스트에 적합

### 모바일 에뮬레이션
- ⚠️ **제한적**: Chrome 모바일 뷰포트 에뮬레이션 가능
- Playwright에 비해 터치/지오로케이션 지원 약함

### 장점
- **경량**: 설치 크기 작고 실행 빠름
- **Chrome 최적화**: Chrome/Chromium에 대한 깊은 통합
- **빠른 설정**: `npm install puppeteer` 후 즉시 사용
- **DevTools 통합**: Chrome DevTools Protocol 직접 접근

### 단점
- **크로스 브라우저 불가**: Firefox 지원 불안정
- **기능 부족**: 병렬 테스트, 추적 등 직접 구현 필요
- **플러그인 생태계**: Playwright에 비해 작음

### 추천 사용 사례
- Chrome 전용 프로젝트
- 빠른 스크립팅/자동화
- 경량 솔루션이 필요한 CI 환경

---

## 2. TestCafe (DevExpress)

### 기본 정보
- **GitHub Stars**: 9,900
- **라이선스**: MIT
- **설치 복잡도**: ⭐ (1/5)
- **유지보수**: DevExpress (상용 지원 있음)

### 브라우저 드라이버 불필요
- ✅ **프록시 기반**: WebDriver 없이 프록시 서버로 HTML/JS 변환
- 모든 주요 브라우저 지원 (Chrome, Firefox, Safari, Edge, IE)
- 헤드리스 모드 및 클라우드 브라우저 지원

### 설정 간소화
- `npm install testcafe` 후 즉시 실행
- 설정 파일 최소화 가능
- 자동 디렉토리 구조 생성 없음 (수동 설정)

### PWA/오프라인 테스트
- ✅ **지원**: 프록시 기반으로 Service Worker 동작 테스트 가능
- 네트워크 가로채기 가능

### 모바일 에뮬레이션
- ✅ **우수**: 모바일 브라우저, 멀티탭, iframe 지원
- 병렬 실행으로 여러 디바이스 동시 테스트

### 장점
- **설정 제로**: WebDriver 설치/설정 불필요
- **자동 대기**: 페이지 로드, XHR 자동 대기
- **병렬 실행**: 빌트인 병렬 테스트 (무료)
- **에러 감지**: 페이지 JS 에러 자동 리포트
- **TypeScript/ES2017**: async/await 지원

### 단점
- **커뮤니티 작음**: Selenium/Cypress보다 플러그인 부족
- **프록시 제약**: 일부 복잡한 시나리오에서 제한적
- **속도**: 프록시 오버헤드로 Puppeteer보다 느릴 수 있음

### 추천 사용 사례
- **브라우저 호환성 중요**: Safari, 모바일 브라우저, iframe 많은 프로젝트
- **빠른 CI 설정**: WebDriver 설정 시간 절약
- **실용적 팀**: 플러그인보다 안정성 우선

---

## 3. Nightwatch.js

### 기본 정보
- **GitHub Stars**: ~12,000
- **라이선스**: MIT
- **설치 복잡도**: ⭐⭐⭐ (3/5)
- **유지보수**: 커뮤니티 주도

### Selenium 기반
- W3C WebDriver API 사용 (Selenium WebDriver)
- Selenium Server + ChromeDriver 등 필요

### 설정 복잡도
- ⚠️ **중간**: Node.js, npm, Selenium Server, WebDriver 설치 필요
- 설정 파일이 많은 옵션으로 압도적일 수 있음
- Playwright에 비해 설정 오버헤드 및 동기화 복잡도 높음

### PWA/오프라인 테스트
- ⚠️ **설정 필요**: WebDriver를 통한 간접 제어
- Service Worker 테스트 위해 추가 설정 필요

### 모바일 에뮬레이션
- ⚠️ **WebDriver 기반**: 모바일 브라우저 테스트 가능하나 Appium 연동 필요
- Playwright의 터치/지오로케이션 API보다 불편

### 장점
- **W3C 표준**: WebDriver 표준 준수
- **병렬화**: V3부터 기본 병렬 실행 및 BrowserStack 연동
- **POM 지원**: Page Object Model, Shadow DOM, XPath
- **CI/CD**: TeamCity, Jenkins, Travis 등 연동 용이
- **엔터프라이즈**: 오래된 프로젝트에 검증됨

### 단점
- **복잡한 설정**: WebDriver 의존성
- **느린 디버깅**: Playwright의 추적 기능 부재
- **구식 접근**: 최신 도구 대비 자동 대기 부족

### 추천 사용 사례
- **레거시 프로젝트**: 이미 Selenium 인프라 있는 경우
- **엔터프라이즈**: WebDriver 표준 요구사항
- **CI/CD 통합**: Jenkins 등 기존 파이프라인 활용

---

## 4. CodeceptJS

### 기본 정보
- **GitHub Stars**: ~4,000
- **라이선스**: MIT (오픈소스)
- **설치 복잡도**: ⭐⭐ (2/5)
- **유지보수**: 커뮤니티 주도

### 멀티 백엔드 지원
- ✅ **백엔드 교체 가능**: Playwright, Puppeteer, WebDriver, TestCafe, Appium
- 동일한 테스트 코드로 백엔드만 변경 가능
- 백엔드 선택에 따라 설치 복잡도 달라짐

### BDD 스타일
- 사용자 관점의 가독성 높은 테스트
- 스마트 로케이터: 이름, 라벨, 텍스트, CSS, XPath

### PWA/오프라인 테스트
- ✅ **Playwright 백엔드 사용 시**: PWA 및 모바일 웹 앱 테스트 우수
- Playwright의 모바일 에뮬레이션, 터치, 지오로케이션 활용

### 모바일 에뮬레이션
- ✅ **Appium 백엔드**: 네이티브 iOS/Android 앱 테스트
- Android/iOS 플랫폼별 로케이터 지정 가능
- Detox 래퍼로 React Native 앱 그레이박스 테스트
- Playwright 백엔드로 모바일 웹/PWA 테스트

### 장점
- **BDD 가독성**: 비개발자도 이해 가능
- **백엔드 유연성**: 프로젝트 요구사항에 맞춰 변경
- **AI 기능**: GPT 기반 실패 테스트 자동 치유
- **인터랙티브 디버깅**: 테스트 중단 후 브라우저 명령 시도
- **멀티세션**: 여러 브라우저 창 테스트
- **클라우드 연동**: Pcloudy 등 실 디바이스 플랫폼 지원

### 단점
- **커뮤니티 작음**: Playwright/Cypress 대비 리소스 부족
- **추상화 오버헤드**: 백엔드 추상화로 고급 기능 제한적
- **문서 부족**: 특정 백엔드 조합의 사례 적음

### 추천 사용 사례
- **멀티 플랫폼**: 웹 + 모바일 네이티브 통합 테스트
- **BDD 팀**: QA와 개발자 협업 중요 시
- **미래 대비**: 백엔드 기술 변경 가능성 있을 때

---

## 5. 종합 추천

### 프로젝트별 최적 도구

| 프로젝트 특성 | 추천 도구 | 이유 |
|--------------|----------|------|
| **PWA + Chrome 전용** | Puppeteer | 경량, 빠름, Chrome DevTools 통합 |
| **PWA + 크로스 브라우저** | Playwright | PWA 네이티브 지원, 자동 대기 |
| **모바일 웹/PWA 중심** | TestCafe | 프록시 기반으로 모바일 브라우저 우수 |
| **레거시 Selenium** | Nightwatch.js | WebDriver 표준, 기존 인프라 활용 |
| **웹 + 네이티브 앱** | CodeceptJS + Appium | 단일 프레임워크로 통합 테스트 |
| **빠른 프로토타입** | Puppeteer / TestCafe | 최소 설정, 즉시 실행 |
| **엔터프라이즈 CI/CD** | Nightwatch.js / Playwright | Jenkins, Azure DevOps 연동 |

### contents-factory (Photo Factory) 프로젝트 권장

**현재 상황**:
- PWA (Service Worker, 오프라인 지원)
- 모바일 우선 (Vite, IndexedDB)
- Vitest (단위 테스트) + Playwright (E2E)

**대안 평가**:

1. **Puppeteer** ⭐⭐⭐⭐
   - ✅ 경량, Chrome 전용으로 충분 (PWA는 주로 Chrome)
   - ✅ Vitest보다 가벼운 E2E 가능
   - ❌ 크로스 브라우저 테스트 불가 (Safari iOS)

2. **TestCafe** ⭐⭐⭐⭐⭐
   - ✅ WebDriver 불필요, 설정 간단
   - ✅ 모바일 브라우저 및 Safari 테스트 우수
   - ✅ PWA 프록시 기반 테스트 가능
   - ✅ 병렬 실행으로 CI 시간 단축
   - **추천**: **Photo Factory의 모바일 우선 + PWA에 최적**

3. **Nightwatch.js** ⭐⭐
   - ❌ Selenium 오버헤드, 설정 복잡
   - ❌ 빠른 프로토타입에 부적합

4. **CodeceptJS** ⭐⭐⭐
   - ✅ BDD 가독성 (마케팅 팀 협업 시 유리)
   - ⚠️ Playwright 백엔드 사용 시 현재와 차이 없음
   - 🤔 네이티브 앱 확장 계획 있다면 고려

---

## 6. 마이그레이션 비용 추정

### Playwright → Puppeteer

**변경 사항**:
- `page.goto()`, `page.click()` 등 유사 API
- 자동 대기 → 수동 `waitForSelector()` 추가 필요
- 브라우저 런처 변경

**비용**: **낮음** (API 유사도 높음)

```javascript
// Playwright
await page.goto('http://localhost:6010');
await page.click('button#upload');

// Puppeteer
await page.goto('http://localhost:6010', { waitUntil: 'networkidle0' });
await page.waitForSelector('button#upload');
await page.click('button#upload');
```

### Playwright → TestCafe

**변경 사항**:
- 테스트 러너 문법 변경 (`test()`, `Selector()`)
- 자동 대기는 유사
- Page Object 패턴 권장

**비용**: **중간** (러너 재작성 필요)

```javascript
// Playwright
test('upload photo', async ({ page }) => {
  await page.goto('http://localhost:6010');
  await page.click('button#upload');
});

// TestCafe
import { Selector } from 'testcafe';

fixture('Upload')
  .page('http://localhost:6010');

test('upload photo', async t => {
  await t.click(Selector('button#upload'));
});
```

### Playwright → CodeceptJS (Playwright 백엔드)

**변경 사항**:
- BDD 스타일 래퍼 추가
- 백엔드는 Playwright 그대로 사용

**비용**: **낮음** (래퍼만 변경)

```javascript
// CodeceptJS
Scenario('upload photo', ({ I }) => {
  I.amOnPage('http://localhost:6010');
  I.click('button#upload');
});
```

---

## 7. 결론

### 최종 권장 순위 (Photo Factory 기준)

1. **TestCafe** ⭐⭐⭐⭐⭐
   - **모바일 PWA에 최적**, WebDriver 불필요, 빠른 CI
2. **Puppeteer** ⭐⭐⭐⭐
   - **Chrome 전용 충분하다면** 가장 경량/빠름
3. **CodeceptJS** ⭐⭐⭐
   - **BDD 필요 시**, 네이티브 앱 확장 시
4. **Nightwatch.js** ⭐⭐
   - 레거시 Selenium 프로젝트 아니면 비추천

### 다음 단계

1. **TestCafe POC**:
   - 기존 Playwright 테스트 1-2개를 TestCafe로 재작성
   - 설정 복잡도, 실행 속도, 모바일 에뮬레이션 비교
2. **Puppeteer 벤치마크**:
   - 동일 테스트 Puppeteer로 작성 후 실행 시간 측정
3. **의사결정**:
   - 크로스 브라우저 필요성 재평가 (Safari iOS 테스트 필수?)
   - CI 시간 단축 vs 설정 간소화 우선순위

---

## Sources

- [Playwright vs Puppeteer: The Definitive Comparison | Better Stack Community](https://betterstack.com/community/comparisons/playwright-vs-puppeteer/)
- [Playwright vs Puppeteer: Which to choose in 2025? | BrowserStack](https://www.browserstack.com/guide/playwright-vs-puppeteer)
- [Puppeteer vs Playwright Performance: Speed Test Results](https://www.skyvern.com/blog/puppeteer-vs-playwright-complete-performance-comparison-2025/)
- [Playwright vs. Puppeteer: which is better in 2025?](https://blog.apify.com/playwright-vs-puppeteer/)
- [Playwright vs. Puppeteer in 2025: Which Should You Choose - ZenRows](https://www.zenrows.com/blog/playwright-vs-puppeteer)
- [Cross-Browser End-to-End Testing Framework | TestСafe](https://testcafe.io/)
- [Cypress vs TestCafe: The Ultimate E2E Testing Showdown for 2025 - Momentic Blog](https://momentic.ai/resources/cypress-vs-testcafe-the-ultimate-e2e-testing-showdown-for-2025)
- [TestCafe Framework: A Detailed Guide | BrowserStack](https://www.browserstack.com/guide/testcafe-framework-tutorial)
- [Nightwatch V3 | Node.js powered End-to-End testing framework](https://nightwatchjs.org/)
- [End-to-End Testing with Nightwatch.js: Best Practices](https://www.fullstack.com/labs/resources/blog/e2e-testing-with-nightwatch)
- [Top 13 Alternatives to Nightwatch.js for E2E UI - TestDriver](https://testdriver.ai/articles/top-13-alternatives-to-nightwatch-js-for-e2e-ui)
- [CodeceptJS](https://codecept.io/)
- [CodeceptJS: The Ultimate Tutorial for Advanced E2E Testing Organization](https://testomat.io/blog/codeceptjs-testing-tutorial-on-how-to-organize-an-advanced-e2e-testing-framework/)
- [GitHub - codeceptjs/CodeceptJS: Supercharged End 2 End Testing Framework for NodeJS](https://github.com/codeceptjs/CodeceptJS)
- [Mobile Testing with Appium | CodeceptJS](https://codecept.io/mobile/)
- [Top 10 End-to-End Testing Tools and Frameworks in 2025](https://katalon.com/resources-center/blog/end-to-end-e2e-testing-tools-frameworks)
- [The best mobile E2E testing frameworks in 2025: Strengths, tradeoffs, and use cases | QA Wolf](https://www.qawolf.com/blog/the-best-mobile-e2e-testing-frameworks-in-2025-strengths-tradeoffs-and-use-cases)
- [Best End-to-End Testing Tools for Web Apps in 2025 (AI Options Included) - DEV Community](https://dev.to/unclebigbay/best-end-to-end-testing-tools-for-web-apps-in-2025-ai-options-included-2j6)
