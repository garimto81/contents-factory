# 이미지 압축 라이브러리 비교 (2025)

**작성일**: 2025-12-05
**프로젝트**: Photo Factory (contents-factory)
**현재 사용**: browser-image-compression v2.0.2

---

## 요약

모바일 우선 PWA 환경에서 브라우저 기반 이미지 압축 라이브러리를 비교 분석하여 최적의 선택을 제시합니다.

---

## 비교 대상 라이브러리

| 라이브러리 | Stars | 주간 다운로드 | 라이선스 | 번들크기 | EXIF 자동보정 | AVIF | WebP | Worker | 모바일 Safari |
|------------|-------|--------------|---------|---------|--------------|------|------|--------|---------------|
| **browser-image-compression** | 2,600+ | 486K | MIT | ~50KB | ✅ | ❌ | ✅ | ✅ | ✅ |
| **compressorjs** | 5,600+ | 212K | MIT | ~3.5KB | ✅ (v1.2+) | ❌ | ❌ | ❌ | ✅ |
| **pica** | 3,900+ | - | MIT | ~40KB | ❌* | ❌ | ❌ | ✅ | ⚠️ |
| **jSquash** | 1,000+ | - | Apache 2.0 | ~100KB+ | ❌ | ✅ | ✅ | ✅ | ⚠️ |
| **image-blob-reduce** | 300+ | - | MIT | ~45KB | ⚠️ | ❌ | ❌ | ✅ | ⚠️ |
| **Squoosh (웹앱)** | 22K+ | - | Apache 2.0 | N/A | ✅ | ✅ | ✅ | ✅ | ✅ |

> **Note**:
> - pica*: EXIF 처리는 image-blob-reduce 래퍼 사용 필요
> - image-blob-reduce: EXIF 보정에 일부 버그 존재 (Issue #26, #15)
> - jSquash: Node.js/Edge 환경 지원, Vite 최적화 이슈 존재
> - Squoosh: 웹앱 제공, 라이브러리 통합 어려움 (CLI deprecated)

---

## 상세 비교

### 1. browser-image-compression ⭐ (현재 사용 중)

**GitHub**: [Donaldcwl/browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)

#### 장점
- **완벽한 EXIF 방향 자동 보정**: 모바일 사진 회전 문제 해결
- **Web Worker 지원**: UI 블로킹 없는 비동기 압축
- **간단한 API**: 설정 없이 바로 사용 가능
- **높은 다운로드 수**: 486K/주 (신뢰성 검증)
- **PWA 친화적**: Service Worker와 호환
- **JPEG/PNG/WebP/BMP 지원**

#### 단점
- **번들 크기 큼**: ~50KB (compressorjs의 14배)
- **AVIF 미지원**: 최신 포맷 지원 부족
- **압축 품질 제어 제한적**: 고급 설정 부족

#### 성능
- 속도: ⭐⭐⭐⭐ (소형 이미지, 실시간 앱에 최적)
- 품질: ⭐⭐⭐⭐
- 모바일: ⭐⭐⭐⭐⭐

#### 사용 사례
```javascript
import imageCompression from 'browser-image-compression';

const compressed = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp'  // v2.0+
});
```

---

### 2. compressorjs 🔥 (경량 대안)

**GitHub**: [fengyuanchen/compressorjs](https://github.com/fengyuanchen/compressorjs)

#### 장점
- **초경량**: ~3.5KB (browser-image-compression의 1/14)
- **네이티브 API 사용**: `canvas.toBlob()` 기반 (안정성)
- **고급 옵션**: quality, maxWidth, maxHeight, resize, mimeType
- **EXIF 보존**: v1.2.0+ `retainExif` 옵션 추가 (2025-02-25)
- **높은 Star 수**: 5,600+

#### 단점
- **Web Worker 미지원**: 메인 스레드 블로킹 가능
- **EXIF 자동 보정 없음**: 회전 이미지 수동 처리 필요
- **WebP/AVIF 미지원**: JPEG/PNG만 출력
- **브라우저별 압축 품질 차이**: 네이티브 API 의존

#### 성능
- 속도: ⭐⭐⭐ (대형 이미지는 느림)
- 품질: ⭐⭐⭐⭐⭐ (고급 설정 가능)
- 모바일: ⭐⭐⭐⭐

#### 사용 사례
```javascript
import Compressor from 'compressorjs';

new Compressor(file, {
  quality: 0.8,
  maxWidth: 1920,
  retainExif: true,  // v1.2+
  success(result) {
    // result: Blob
  }
});
```

---

### 3. pica + image-blob-reduce 🎨 (고품질)

**GitHub**:
- [nodeca/pica](https://github.com/nodeca/pica) (3,900+ stars)
- [nodeca/image-blob-reduce](https://github.com/nodeca/image-blob-reduce) (300+ stars)

#### 장점
- **최고 품질**: Lanczos 필터, Unsharp Mask
- **대형 이미지 최적화**: 5000x3000px → ~0.5s (데스크톱)
- **Web Worker + WASM**: 자동 최적화
- **타일 처리**: 메모리 피크 제한 (1024px 타일)
- **멀티코어 활용**: 병렬 처리

#### 단점
- **EXIF 처리 복잡**: image-blob-reduce 래퍼 필요
- **image-blob-reduce 버그**: EXIF 보정 이슈 존재 (Issue #26, #15)
- **압축 기능 없음**: 리사이즈 전용, `toBlob()` 수동 호출
- **모바일 성능**: ~2s (대형 이미지)
- **Chrome EXIF 버그**: createImageBitmap 문제

#### 성능
- 속도: ⭐⭐⭐ (대형 이미지는 느림)
- 품질: ⭐⭐⭐⭐⭐ (최고)
- 모바일: ⭐⭐⭐

#### 사용 사례
```javascript
import pica from 'pica';

const canvas = document.createElement('canvas');
canvas.width = 1920;
canvas.height = 1080;

await pica().resize(sourceCanvas, canvas, {
  unsharpAmount: 80,
  unsharpRadius: 0.6,
  quality: 3  // Lanczos filter
});

canvas.toBlob((blob) => {
  // 압축된 이미지
}, 'image/jpeg', 0.9);
```

---

### 4. jSquash 🚀 (최신 포맷)

**GitHub**: [jamsinclair/jSquash](https://github.com/jamsinclair/jSquash)

#### 장점
- **AVIF/WebP/JPEG XL 지원**: 최신 포맷
- **WASM 기반**: 고성능 코덱 (MozJPEG, libavif)
- **Web Worker 친화적**: 엄격한 환경 지원 (Cloudflare Workers)
- **모듈화**: 필요한 코덱만 선택 설치
- **Squoosh 기반**: 검증된 압축 알고리즘

#### 단점
- **번들 크기 큼**: ~100KB+ (코덱별 추가)
- **EXIF 자동 보정 없음**: 수동 처리 필요
- **Vite 이슈**: dependency optimizer 충돌 (workaround 필요)
- **모바일 Safari 정보 부족**: 호환성 미검증
- **복잡한 설정**: 코덱별 설치 및 초기화

#### 성능
- 속도: ⭐⭐⭐⭐ (WASM 최적화)
- 품질: ⭐⭐⭐⭐⭐ (최신 코덱)
- 모바일: ⚠️ (미검증)

#### 사용 사례
```javascript
import { encode as encodeAvif } from '@jsquash/avif';
import { encode as encodeWebP } from '@jsquash/webp';

// AVIF 압축
const avifData = await encodeAvif(imageData, { quality: 80 });

// WebP 압축
const webpData = await encodeWebP(imageData, { quality: 85 });
```

---

### 5. Squoosh (웹앱) 🌐

**GitHub**: [GoogleChromeLabs/squoosh](https://github.com/GoogleChromeLabs/squoosh) (22K+ stars)

#### 장점
- **최고 품질**: 실시간 비교 (원본 vs 압축)
- **모든 최신 포맷**: AVIF, WebP, JPEG XL, MozJPEG, OxiPNG
- **완전 로컬**: 이미지가 서버로 전송 안 됨
- **WASM 기반**: 네이티브급 속도
- **무료 웹앱**: https://squoosh.app

#### 단점
- **CLI deprecated** (2023년 중단)
- **라이브러리 통합 어려움**: 독립 앱 전용
- **일괄 처리 불가**: 이미지 1개씩 수동 처리
- **자동화 불가**: 빌드 파이프라인 통합 불가

#### 권장 용도
- 디자이너/개발자 수동 최적화 도구
- 압축 품질 벤치마크 테스트
- 라이브러리 선택 전 품질 비교

---

## 압축 알고리즘 & 포맷 비교

### JPEG vs WebP vs AVIF (2025)

| 포맷 | 압축률 | 브라우저 지원 | 품질 | 권장 사용 |
|------|--------|-------------|------|----------|
| **JPEG** | 기준 | 100% | ⭐⭐⭐ | 레거시 지원 필수 시 |
| **WebP** | -30% | 95.3% | ⭐⭐⭐⭐ | 범용 최적화 |
| **AVIF** | -50% | 93.8% | ⭐⭐⭐⭐⭐ | 최신 브라우저 타겟 |

#### WebP 특징
- Safari 14+ 지원 (2020-09-16부터)
- 8비트 컬러만 지원
- 로고/일러스트는 JPEG 대비 -35%
- 디코딩 속도 빠름 (CPU 오버헤드 낮음)

#### AVIF 특징
- Safari 16+ 지원 (2022년)
- 8/10/12비트 컬러, HDR, Wide Color Gamut
- WebP 대비 -20~25% 추가 압축
- 디코딩 느림 (CPU 집약적)

#### 권장 전략 (Picture Element)
```html
<picture>
  <source srcset="photo.avif" type="image/avif">
  <source srcset="photo.webp" type="image/webp">
  <img src="photo.jpg" alt="fallback">
</picture>
```

---

## 모바일 성능 분석

### 테스트 환경
- 디바이스: iPhone 13 Pro (Safari), Galaxy S23 (Chrome)
- 이미지: 4000x3000px JPEG (~5MB)
- 목표: 1920x1440px, 1MB 이하

### 벤치마크 결과 (예상치)

| 라이브러리 | iPhone 처리 시간 | Galaxy 처리 시간 | UI 블로킹 | 메모리 피크 |
|------------|-----------------|-----------------|-----------|------------|
| browser-image-compression (Worker) | ~1.5s | ~1.0s | 없음 | 80MB |
| browser-image-compression (Main) | ~2.0s | ~1.5s | 있음 | 120MB |
| compressorjs | ~2.5s | ~1.8s | 있음 | 150MB |
| pica (Worker) | ~2.0s | ~1.5s | 없음 | 60MB |
| jSquash (AVIF) | ~3.0s | ~2.5s | 없음 | 100MB |

> **Note**: 실제 벤치마크는 추후 Playwright E2E 테스트로 측정 예정

---

## Photo Factory 프로젝트 분석

### 현재 구현 (src/js/utils/image-compressor.js)

```javascript
import imageCompression from 'browser-image-compression';

export async function processImage(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type
  };

  const compressed = await imageCompression(file, options);
  const thumbnail = await imageCompression(file, {
    ...options,
    maxWidthOrHeight: 300
  });

  return {
    image_data: await toBase64(compressed),
    thumbnail_data: await toBase64(thumbnail),
    file_size: compressed.size
  };
}
```

### 요구사항 체크리스트

| 요구사항 | browser-image-compression | compressorjs | pica | jSquash |
|---------|--------------------------|--------------|------|---------|
| EXIF 자동 보정 | ✅ | ❌ | ❌ | ❌ |
| Web Worker | ✅ | ❌ | ✅ | ✅ |
| 1MB 이하 압축 | ✅ | ✅ | ⚠️ | ✅ |
| 썸네일 생성 | ✅ | ✅ | ✅ | ✅ |
| 모바일 Safari | ✅ | ✅ | ⚠️ | ⚠️ |
| PWA 호환 | ✅ | ✅ | ✅ | ⚠️ |
| 간단한 API | ✅ | ✅ | ❌ | ❌ |

### 핵심 요구사항

1. **EXIF 방향 자동 보정** (Critical): 모바일 사진 회전 문제
2. **Web Worker 지원** (High): UI 블로킹 방지
3. **1MB 이하 압축** (High): 네트워크 대역폭
4. **썸네일 생성** (Medium): 갤러리 성능
5. **모바일 Safari 호환** (Critical): iOS 사용자 지원

---

## 추천 순위

### 🥇 1순위: browser-image-compression (유지 권장)

**점수**: 92/100

#### 선택 이유
1. **EXIF 자동 보정**: 모바일 사진 회전 문제 완벽 해결
2. **Web Worker 지원**: UI 블로킹 없는 비동기 압축
3. **간단한 API**: 러닝커브 없음
4. **검증된 안정성**: 486K 주간 다운로드
5. **PWA 친화적**: Service Worker 호환
6. **현재 코드베이스 호환**: 마이그레이션 비용 없음

#### 단점 (감수 가능)
- 번들 크기 50KB → PWA 특성상 초기 로딩 후 캐시됨
- AVIF 미지원 → WebP로 충분 (95.3% 브라우저 지원)

#### 권장 개선 사항
```javascript
// WebP 출력으로 추가 압축 (-30%)
const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',  // ← 추가
  initialQuality: 0.85      // ← 품질 조정
};
```

---

### 🥈 2순위: compressorjs + EXIF.js

**점수**: 75/100

#### 선택 이유
1. **초경량**: 3.5KB (번들 크기 민감 시)
2. **고급 품질 제어**: quality, maxWidth, maxHeight
3. **EXIF 보존**: v1.2+ retainExif 옵션

#### 단점 (치명적)
- **EXIF 자동 보정 없음**: EXIF.js 추가 통합 필요
- **Web Worker 미지원**: 대형 이미지 처리 시 UI 멈춤
- **WebP 미지원**: JPEG/PNG만 출력

#### 마이그레이션 비용
- EXIF.js 통합 (1-2일)
- 회전 로직 구현 (1일)
- E2E 테스트 업데이트 (1일)
- **총 3-4일** + QA

---

### 🥉 3순위: jSquash (미래 대비)

**점수**: 65/100

#### 선택 이유
1. **AVIF 지원**: 최고 압축률 (-50%)
2. **WASM 성능**: 네이티브급 속도
3. **최신 코덱**: MozJPEG, libavif

#### 단점 (블로커)
- **EXIF 자동 보정 없음**: 별도 라이브러리 필요
- **Vite 이슈**: optimizeDeps 설정 필요
- **번들 크기 큼**: 100KB+
- **모바일 Safari 미검증**: 호환성 리스크

#### 권장 시점
- 브라우저 AVIF 지원 98%+ 도달 시 (현재 93.8%)
- EXIF 보정 기능 추가 시
- 서버 비용 절감이 Critical 할 때

---

## 최종 권장 사항

### ✅ browser-image-compression 유지

**결정 근거**:
1. **핵심 요구사항 100% 충족**: EXIF 보정 + Worker + PWA
2. **번들 크기 문제 없음**: PWA 캐싱으로 초기 로딩만 영향
3. **마이그레이션 비용 제로**: 현재 코드 유지
4. **리스크 없음**: 검증된 안정성

### 📝 개선 제안

#### 1. WebP 출력으로 전환 (즉시)
```javascript
// src/js/utils/image-compressor.js 수정
const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',  // ← 변경
  initialQuality: 0.85
};
```

**효과**: 파일 크기 -30%, 브라우저 지원 95.3%

#### 2. 압축 품질 프리셋 추가 (선택)
```javascript
export const COMPRESSION_PRESETS = {
  thumbnail: { maxSizeMB: 0.1, maxWidthOrHeight: 300, quality: 0.7 },
  preview: { maxSizeMB: 0.5, maxWidthOrHeight: 1080, quality: 0.8 },
  full: { maxSizeMB: 1, maxWidthOrHeight: 1920, quality: 0.85 }
};
```

#### 3. 진행률 콜백 활용 (UX 개선)
```javascript
const compressed = await imageCompression(file, {
  ...options,
  onProgress: (progress) => {
    updateProgressBar(progress);  // 0-100
  }
});
```

### 🔮 미래 계획 (2026+)

**AVIF 전환 조건**:
1. 브라우저 지원 98%+ 도달
2. iOS Safari 성능 개선 확인
3. IndexedDB 저장 공간 부족 이슈 발생 시

**전환 시 라이브러리**:
- 1순위: jSquash (@jsquash/avif)
- 2순위: browser-image-compression (AVIF 지원 시)

---

## 벤치마크 테스트 계획

### Playwright E2E 테스트

```javascript
// tests/compression-benchmark.spec.cjs
test.describe('Image Compression Performance', () => {
  test('should compress 5MB image under 2s on mobile', async ({ page }) => {
    const file = await fs.readFile('fixtures/large-photo.jpg');

    const start = Date.now();
    await page.evaluate(async (fileBuffer) => {
      const file = new File([fileBuffer], 'photo.jpg', { type: 'image/jpeg' });
      await imageCompression(file, { maxSizeMB: 1, useWebWorker: true });
    }, file);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(2000);
  });
});
```

---

## 참고 자료

### 라이브러리 문서
- [browser-image-compression - npm](https://www.npmjs.com/package/browser-image-compression)
- [browser-image-compression - GitHub](https://github.com/Donaldcwl/browser-image-compression)
- [compressorjs - GitHub](https://github.com/fengyuanchen/compressorjs)
- [compressorjs 공식 사이트](https://fengyuanchen.github.io/compressorjs/)
- [pica - GitHub](https://github.com/nodeca/pica)
- [jSquash - GitHub](https://github.com/jamsinclair/jSquash)
- [Squoosh 웹앱](https://squoosh.app/)

### 비교 분석
- [npm-compare: browser-image-compression vs compressorjs](https://npm-compare.com/browser-image-compression,compressorjs)
- [npm trends: compression libraries](https://npmtrends.com/browser-image-compression-vs-compressorjs-vs-image-blob-reduce)

### 이미지 포맷
- [AVIF vs WebP 비교 (2025)](https://crystallize.com/blog/avif-vs-webp)
- [WebP vs AVIF (SpeedVitals 2025)](https://speedvitals.com/blog/webp-vs-avif/)
- [Modern Image Formats (Smashing Magazine)](https://www.smashingmagazine.com/2021/09/modern-image-formats-avif-webp/)
- [2025 Image Format Playbook](https://oneimage.co/en/blogs/image-format-guide-2025)

### 기술 블로그
- [Image Compression Techniques in JavaScript (2025)](https://imagekit.io/blog/image-compression-techniques-in-javascript/)
- [Squoosh와 WebAssembly (Transloadit)](https://transloadit.com/devtips/optimize-images-in-browsers-with-squoosh-and-webassembly/)
- [LibWebP 작동 원리](https://libwebp.com/2025/10/13/libwebp-works-inside-googles-image-engine/)

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2025-12-05 | 초안 작성 (7개 라이브러리 비교) |
