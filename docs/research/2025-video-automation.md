# 오픈소스 비디오 생성/편집 자동화 솔루션 조사 보고서

**작성일**: 2025-12-05
**목적**: PC(커맨드 센터)에서 이미지들을 받아 자동으로 마케팅 영상(쇼츠/릴스)을 생성하는 오픈소스 솔루션 조사

---

## 요약 및 추천

### Top 3 추천 솔루션

| 순위 | 솔루션 | 추천 이유 | 배포 난이도 |
|------|--------|-----------|-------------|
| **1** | **Editly** | MIT, 간단한 CLI/API, BGM/자막/전환 모두 지원, 5.2k stars | ⭐⭐ 중간 |
| **2** | **FFCreator** | MIT, Node.js 기반, 100개 전환 효과, 자막 지원, 3.1k stars | ⭐⭐⭐ 중간-높음 |
| **3** | **MoviePy** | MIT, Python 생태계, 유연성 최고, 14.1k stars | ⭐⭐ 중간 |

### 의사결정 가이드

```
빠른 프로토타입 + 간단한 요구사항
    → Editly (Node.js CLI)

Node.js 환경 + 화려한 전환 효과
    → FFCreator

Python 환경 + 세밀한 제어 필요
    → MoviePy

React 개발팀 + 복잡한 커스터마이징
    → Remotion (라이선스 주의)
```

---

## 상세 조사 결과

### 1. Editly ⭐ 최우수 추천

| 항목 | 내용 |
|------|------|
| **GitHub URL** | [mifi/editly](https://github.com/mifi/editly) |
| **Stars** | 5.2k |
| **라이선스** | MIT |
| **언어** | JavaScript (Node.js) |
| **BGM 지원** | ✅ 오디오 믹싱, 크로스페이드, 볼륨 조절 |
| **자막 지원** | ✅ 전용 subtitle 레이어 |
| **전환 효과** | ✅ gl-transitions, 방향 전환 (left/right/up/down), random |
| **1080x1920 지원** | ✅ "any dimensions and aspect ratio" - 커스텀 width/height 파라미터로 가능 |

**장점**:
- FFmpeg 기반이지만 streaming 방식으로 매우 빠름 (스토리지 효율적)
- CLI와 JavaScript API 모두 제공
- 선언적(declarative) 인터페이스로 간단함
- Canvas/Fabric.js 커스텀 오버레이 지원
- GL shader 렌더링 가능

**단점**:
- Node.js + FFmpeg 설치 필요
- 복잡한 애니메이션은 제한적

**배포 복잡도**: ⭐⭐ (중간)
- Docker로 패키징 가능
- npm + FFmpeg 의존성 관리 필요

**사용 예시**:
```javascript
const editly = require('editly');

await editly({
  outPath: './output.mp4',
  width: 1080,
  height: 1920, // 세로 영상
  clips: [
    { duration: 2, layers: [{ type: 'image', path: 'before.jpg' }] },
    { duration: 2, layers: [{ type: 'image', path: 'after.jpg' }] },
  ],
  audioTracks: [{ path: 'bgm.mp3', mixVolume: 0.5 }],
  defaults: { transition: { name: 'directionalwipe', params: { direction: [1, 0] } } }
});
```

---

### 2. FFCreator ⭐ Node.js 최고 품질

| 항목 | 내용 |
|------|------|
| **GitHub URL** | [tnfe/FFCreator](https://github.com/tnfe/FFCreator) |
| **Stars** | 3.1k |
| **라이선스** | MIT |
| **언어** | JavaScript (Node.js) |
| **BGM 지원** | ✅ 전역/씬별 오디오, 루프, 시작 시간 제어 |
| **자막 지원** | ✅ 자막 컴포넌트, TTS 결합 가능 |
| **전환 효과** | ✅ 100개 이상 (animate.css 기반), GridFlip, zoomIn 등 |
| **1080x1920 지원** | ⚠️ 명시되지 않음 (표준 dimensions만 문서화) |

**장점**:
- OpenGL 기반 렌더링으로 고품질 출력
- 5분 영상을 1-2분에 처리 (매우 빠름)
- 90% animate.css 효과 재현 가능
- 이미지/비디오/텍스트/차트 지원
- VTuber 스타일 애니메이션 가능

**단점**:
- 세팅이 복잡 (OpenGL, FFmpeg 의존성)
- 세로 영상 지원 명시 부족
- FFCreatorLite (더 빠른 대안)도 고려 필요

**배포 복잡도**: ⭐⭐⭐ (중간-높음)
- OpenGL, FFmpeg, Node.js 환경 구축 필요
- Docker 권장

---

### 3. MoviePy ⭐ Python 최고 유연성

| 항목 | 내용 |
|------|------|
| **GitHub URL** | [Zulko/moviepy](https://github.com/Zulko/moviepy) |
| **Stars** | 14.1k |
| **라이선스** | MIT |
| **언어** | Python (99.9%) |
| **BGM 지원** | ✅ (문서에 명시 안되었으나 기본 지원) |
| **자막 지원** | ✅ (TextClip으로 가능) |
| **전환 효과** | ✅ (programmatic transitions) |
| **1080x1920 지원** | ✅ 임의 dimensions 지원 |

**장점**:
- Python 생태계에서 가장 인기 (14.1k stars)
- Numpy 기반으로 모든 픽셀 접근 가능
- 세밀한 커스터마이징 가능
- Windows/Mac/Linux 모두 지원
- Python 3.9+ 호환

**단점**:
- FFmpeg 직접 사용보다 느림 (numpy 변환 오버헤드)
- v2.0 breaking changes로 기존 코드 호환성 문제
- 러닝 커브 존재

**배포 복잡도**: ⭐⭐ (중간)
- pip install + FFmpeg 설치
- Python 환경만 있으면 OK

**사용 예시**:
```python
from moviepy.editor import ImageClip, concatenate_videoclips, AudioFileClip

clips = [
    ImageClip("before.jpg").set_duration(2),
    ImageClip("after.jpg").set_duration(2)
]
video = concatenate_videoclips(clips, method="compose")
audio = AudioFileClip("bgm.mp3")
final = video.set_audio(audio)
final.write_videofile("output.mp4", fps=30, codec='libx264')
```

---

### 4. Remotion ⚠️ 라이선스 주의

| 항목 | 내용 |
|------|------|
| **GitHub URL** | [remotion-dev/remotion](https://github.com/remotion-dev/remotion) |
| **Stars** | 24.9k |
| **라이선스** | ⚠️ **특수 라이선스** (기업 사용 시 라이선스 구매 필요) |
| **언어** | TypeScript (77.4%) |
| **BGM 지원** | ✅ React 컴포넌트로 제어 |
| **자막 지원** | ✅ React 컴포넌트로 제어 |
| **전환 효과** | ✅ CSS/WebGL 기반 커스텀 가능 |
| **1080x1920 지원** | ✅ 임의 dimensions 지원 |

**장점**:
- React 개발자에게 최적
- CSS, Canvas, SVG, WebGL 모두 사용 가능
- 가장 많은 stars (24.9k)
- 매우 강력한 커스터마이징

**단점**:
- **⚠️ 기업 사용 시 유료 라이선스 필요** (LICENSE.md 확인 필수)
- React/TypeScript 필수
- 러닝 커브 높음
- 배포 시 Node.js + Chrome/Puppeteer 필요

**배포 복잡도**: ⭐⭐⭐⭐ (높음)
- React 빌드 환경 + Puppeteer headless 렌더링
- 서버 리소스 많이 필요

**라이선스 경고**:
> "requires obtaining a company license in some cases"
> 상업적 사용 전에 반드시 LICENSE.md 검토 필수!

---

### 5. ShortGPT ⭐ AI 자동화

| 항목 | 내용 |
|------|------|
| **GitHub URL** | [RayVentura/ShortGPT](https://github.com/RayVentura/ShortGPT) |
| **Stars** | 6.9k |
| **라이선스** | MIT |
| **언어** | Python (99.7%) |
| **BGM 지원** | ⚠️ 명시 안됨 |
| **자막 지원** | ✅ 자동 캡션 생성 |
| **전환 효과** | ⚠️ 명시 안됨 |
| **1080x1920 지원** | ⚠️ 명시 안됨 |

**장점**:
- **AI 기반 자동화** (GPT-4, ElevenLabs TTS)
- 30개 이상 언어 지원
- Pexels/Bing 이미지 자동 소싱
- LLM 기반 편집 언어 (Editing Markup Language)
- 쇼츠/TikTok 자동화 특화

**단점**:
- OpenAI API 키 필요 (비용 발생)
- BGM/전환 효과 지원 불명확
- 실험적(experimental) 프레임워크

**배포 복잡도**: ⭐⭐⭐ (중간-높음)
- Docker 또는 Google Colab
- OpenAI/ElevenLabs API 키 필요

---

### 6. ffmpeg-concat

| 항목 | 내용 |
|------|------|
| **GitHub URL** | [transitive-bullshit/ffmpeg-concat](https://github.com/transitive-bullshit/ffmpeg-concat) |
| **Stars** | 969 |
| **라이선스** | MIT |
| **언어** | JavaScript (100%) |
| **BGM 지원** | ✅ audio 파라미터 또는 소스 오디오 concat |
| **자막 지원** | ❌ |
| **전환 효과** | ✅ gl-transitions (fade, circleopen, directionalwipe 등) |
| **1080x1920 지원** | ⚠️ 첫 번째 입력 비디오 dimensions 기준 |

**장점**:
- OpenGL 전환 효과가 매우 섹시함
- FFmpeg filter graph보다 간단한 인터페이스
- Node.js + FFmpeg

**단점**:
- 자막 미지원
- 첫 영상 dimensions에 의존 (세로 영상 제어 제한적)
- Editly에 비해 기능 부족

**배포 복잡도**: ⭐⭐ (중간)

---

### 7. Auto-Editor

| 항목 | 내용 |
|------|------|
| **GitHub URL** | [WyattBlue/auto-editor](https://github.com/WyattBlue/auto-editor) |
| **Stars** | 3.8k |
| **라이선스** | Unlicense (Public Domain) |
| **언어** | Nim (90.1%) |
| **BGM 지원** | ❌ |
| **자막 지원** | ❌ |
| **전환 효과** | ❌ |
| **1080x1920 지원** | ⚠️ 명시 안됨 |

**용도**:
- 비디오에서 무음 구간 자동 제거
- 모션 감지 기반 편집
- Premiere Pro/DaVinci Resolve XML 생성

**평가**: ⚠️ 이미지 → 비디오 생성 용도에는 부적합 (편집 전용)

---

### 8. MLT Framework

| 항목 | 내용 |
|------|------|
| **GitHub URL** | [mltframework/mlt](https://github.com/mltframework/mlt) |
| **Stars** | 1.7k |
| **라이선스** | LGPL-2.1 |
| **언어** | C (69.5%), C++ (28.0%) |
| **BGM 지원** | ✅ (프레임워크 수준) |
| **자막 지원** | ✅ (프레임워크 수준) |
| **전환 효과** | ✅ (프레임워크 수준) |
| **1080x1920 지원** | ✅ (FFmpeg 통합) |

**장점**:
- Kdenlive, Shotcut의 백엔드
- 멀티트랙 오디오/비디오 편집
- FFmpeg 8 지원 (최신)
- 10-bit 비디오 처리

**단점**:
- C/C++ 라이브러리 (Python/Node.js 바인딩 필요)
- 직접 사용은 복잡
- XML 스크립팅 필요

**배포 복잡도**: ⭐⭐⭐⭐ (높음)
- C/C++ 컴파일 환경
- Python wrapper 구축 필요

**평가**: ⚠️ 직접 사용보다는 Kdenlive/Shotcut CLI 사용 권장

---

### 9. ShotTower (Shotstack OSS 대체)

| 항목 | 내용 |
|------|------|
| **GitHub URL** | [DblK/shottower](https://github.com/DblK/shottower) |
| **Stars** | 46 |
| **라이선스** | AGPL-3.0 |
| **언어** | Go (99.9%) |
| **BGM 지원** | ⚠️ Not yet (개발 중) |
| **자막 지원** | ✅ 비디오에 burn-in 가능 |
| **전환 효과** | ⚠️ Not yet (개발 중) |
| **1080x1920 지원** | ⚠️ 360/480/540/720 문서화, 1080 미확인 |

**장점**:
- Shotstack API 호환 (JSON → FFmpeg)
- Go 단일 바이너리 배포

**단점**:
- 매우 초기 단계 (46 stars)
- BGM/전환 미구현
- "narrower scope, not for heavy transcode"

**배포 복잡도**: ⭐⭐ (중간)
- Go 바이너리 + FFmpeg

**평가**: ⚠️ 아직 프로덕션 사용 비추천 (기능 미완성)

---

### 10. slideshow-video (TikTok 슬라이드쇼 특화)

| 항목 | 내용 |
|------|------|
| **GitHub URL** | [0x464e/slideshow-video](https://github.com/0x464e/slideshow-video) |
| **Stars** | 17 |
| **라이선스** | LGPL-3.0 |
| **언어** | TypeScript |
| **BGM 지원** | ✅ |
| **자막 지원** | ❌ (비교표에 명시) |
| **전환 효과** | ✅ 50개 |
| **1080x1920 지원** | ⚠️ TikTok 슬라이드쇼용 (지원 추정) |

**장점**:
- 자동 이미지/오디오 루프 감지
- 혼합 이미지 크기 자동 처리
- FFmpeg 번들 (크로스 플랫폼)
- "one config fits all"

**단점**:
- Stars 적음 (17)
- 자막 미지원
- 문서 부족

**배포 복잡도**: ⭐⭐ (중간)
- npm + 번들된 FFmpeg

**평가**: ⚠️ 니치 용도 (TikTok 슬라이드쇼), 범용성 낮음

---

## 추가 조사한 라이브러리 (래퍼/유틸리티)

### ffmpeg-python
- **Stars**: 10.9k
- **라이선스**: Apache-2.0
- **용도**: Python FFmpeg 래퍼 (직접 비디오 생성 아님)
- **평가**: MoviePy와 함께 사용 권장

### Manim (3Blue1Brown)
- **Stars**: 35.9k
- **라이선스**: MIT
- **용도**: 수학 교육 애니메이션 (이미지 → 비디오 아님)
- **평가**: 용도 불일치 (교육용 프로그래밍 애니메이션)

### Videoflow
- **Stars**: 1.0k
- **라이선스**: MIT
- **용도**: 비디오 스트림 분석 (Computer Vision)
- **평가**: 용도 불일치 (분석 전용, 생성 아님)

---

## 비교표

| 솔루션 | Stars | 라이선스 | 언어 | BGM | 자막 | 전환 | 1080x1920 | 배포 난이도 |
|--------|-------|----------|------|-----|------|------|-----------|-------------|
| **Editly** | 5.2k | MIT | Node.js | ✅ | ✅ | ✅ | ✅ | ⭐⭐ |
| **FFCreator** | 3.1k | MIT | Node.js | ✅ | ✅ | ✅ | ⚠️ | ⭐⭐⭐ |
| **MoviePy** | 14.1k | MIT | Python | ✅ | ✅ | ✅ | ✅ | ⭐⭐ |
| **Remotion** | 24.9k | 특수⚠️ | TypeScript | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ |
| **ShortGPT** | 6.9k | MIT | Python | ⚠️ | ✅ | ⚠️ | ⚠️ | ⭐⭐⭐ |
| **ffmpeg-concat** | 969 | MIT | Node.js | ✅ | ❌ | ✅ | ⚠️ | ⭐⭐ |
| **Auto-Editor** | 3.8k | Public | Nim | ❌ | ❌ | ❌ | ⚠️ | ⭐⭐ |
| **MLT** | 1.7k | LGPL-2.1 | C/C++ | ✅ | ✅ | ✅ | ✅ | ⭐⭐⭐⭐ |
| **ShotTower** | 46 | AGPL-3.0 | Go | 개발중 | ✅ | 개발중 | ⚠️ | ⭐⭐ |
| **slideshow-video** | 17 | LGPL-3.0 | TypeScript | ✅ | ❌ | ✅ | ⚠️ | ⭐⭐ |

---

## 의사결정 가이드

### 시나리오별 추천

#### 1. 빠른 프로토타입 (1주일 이내)
→ **Editly**
- 이유: CLI 즉시 사용 가능, JSON 설정파일로 제어
- 예상 개발 기간: 2-3일

#### 2. Node.js 환경, 화려한 UI 필요
→ **FFCreator**
- 이유: 100개 전환 효과, OpenGL 렌더링 품질
- 예상 개발 기간: 1-2주

#### 3. Python 백엔드, 세밀한 제어 필요
→ **MoviePy**
- 이유: 픽셀 단위 제어, Python 생태계 통합
- 예상 개발 기간: 1-2주

#### 4. React 개발팀, 커스터마이징 극대화
→ **Remotion** (단, 라이선스 확인)
- 이유: React 컴포넌트로 비디오 제작
- 예상 개발 기간: 2-4주

#### 5. AI 자동화, 콘텐츠 자동 생성
→ **ShortGPT**
- 이유: GPT-4 기반 자동 편집
- 예상 개발 기간: 1-2주 (API 키 필요)

---

## 구현 시 고려사항

### 1. 세로 영상 (1080x1920) 지원 확인
- **명시적 지원**: Editly, MoviePy
- **파라미터 조정 필요**: FFCreator, ffmpeg-concat
- **테스트 필요**: ShotTower, slideshow-video

### 2. 배포 환경
| 솔루션 | Docker | Lambda | Serverless |
|--------|--------|--------|------------|
| Editly | ✅ | ⚠️ (시간 제한) | ⚠️ |
| FFCreator | ✅ | ❌ (OpenGL) | ❌ |
| MoviePy | ✅ | ⚠️ (시간 제한) | ⚠️ |
| Remotion | ✅ | ✅ (remotion-lambda) | ✅ |

### 3. 처리 속도
- **빠름** (5분 영상 1-2분): FFCreator, Editly
- **중간** (5분 영상 5-10분): MoviePy
- **느림** (5분 영상 10-20분): Remotion (headless render)

### 4. 러닝 커브
- **쉬움**: Editly (JSON 설정), ffmpeg-concat
- **중간**: FFCreator, MoviePy
- **어려움**: Remotion (React), MLT (C++)

---

## 프로토타입 구현 예시 (Editly)

### 1. 설치
```bash
npm install -g editly
# FFmpeg 필요 (https://ffmpeg.org/download.html)
```

### 2. 설정 파일 (config.json5)
```json5
{
  outPath: './marketing-video.mp4',
  width: 1080,
  height: 1920, // 세로 영상
  fps: 30,

  // 전역 BGM
  audioTracks: [
    { path: './bgm.mp3', mixVolume: 0.3, cutFrom: 0, cutTo: 10 }
  ],

  // 전환 효과 기본값
  defaults: {
    transition: {
      name: 'fade', // fade, directionalwipe, circleopen 등
      duration: 0.5
    },
    layer: {
      fontPath: './NotoSansKR-Regular.ttf' // 한글 폰트
    }
  },

  // 클립 구성
  clips: [
    // 입고 사진 (before_car)
    {
      duration: 2,
      layers: [
        { type: 'image', path: './photos/before_car.jpg' },
        { type: 'title', text: '입고', fontPath: './NotoSansKR-Bold.ttf',
          fontSize: 80, position: 'top' }
      ]
    },

    // 문제 사진 (before_wheel)
    {
      duration: 2,
      layers: [
        { type: 'image', path: './photos/before_wheel.jpg' },
        { type: 'title', text: '문제', fontSize: 80, position: 'top' }
      ]
    },

    // 과정 사진들 (during)
    {
      duration: 3,
      layers: [
        { type: 'image', path: './photos/during_1.jpg' }
      ]
    },

    // 해결 사진 (after_wheel)
    {
      duration: 2,
      layers: [
        { type: 'image', path: './photos/after_wheel.jpg' },
        { type: 'title', text: '해결', fontSize: 80, position: 'top' }
      ]
    },

    // 출고 사진 (after_car)
    {
      duration: 2,
      layers: [
        { type: 'image', path: './photos/after_car.jpg' },
        { type: 'title', text: '출고 완료!', fontSize: 80, position: 'center' }
      ]
    },

    // 마지막 자막 (연락처)
    {
      duration: 2,
      layers: [
        { type: 'fill-color', color: '#000000' },
        { type: 'subtitle', text: '휠 복원 문의\n010-XXXX-XXXX',
          fontSize: 60, position: 'center' }
      ]
    }
  ]
}
```

### 3. 실행
```bash
editly --json config.json5
# 또는
editly \
  --width 1080 --height 1920 \
  --clip1 '{"duration":2,"layers":[{"type":"image","path":"before.jpg"}]}' \
  --clip2 '{"duration":2,"layers":[{"type":"image","path":"after.jpg"}]}' \
  --audio-tracks '[{"path":"bgm.mp3"}]'
```

### 4. JavaScript API
```javascript
const editly = require('editly');

async function generateMarketingVideo(photos, jobData) {
  const clips = [
    {
      duration: 2,
      layers: [
        { type: 'image', path: photos.before_car },
        { type: 'title', text: '입고', fontSize: 80, position: 'top' }
      ]
    },
    {
      duration: 2,
      layers: [
        { type: 'image', path: photos.before_wheel },
        { type: 'title', text: '문제', fontSize: 80, position: 'top' }
      ]
    },
    // ... during photos
    {
      duration: 2,
      layers: [
        { type: 'image', path: photos.after_wheel },
        { type: 'title', text: '해결', fontSize: 80, position: 'top' }
      ]
    },
    {
      duration: 2,
      layers: [
        { type: 'image', path: photos.after_car },
        { type: 'title', text: `${jobData.car_model} 출고!`, fontSize: 80 }
      ]
    }
  ];

  await editly({
    outPath: `./output/${jobData.job_number}.mp4`,
    width: 1080,
    height: 1920,
    fps: 30,
    clips,
    audioTracks: [{ path: './bgm.mp3', mixVolume: 0.3 }],
    defaults: {
      transition: { name: 'directionalwipe', duration: 0.5 }
    }
  });
}

// 사용
await generateMarketingVideo(
  {
    before_car: './photos/WHL250112001_before_car.jpg',
    before_wheel: './photos/WHL250112001_before_wheel.jpg',
    after_wheel: './photos/WHL250112001_after_wheel.jpg',
    after_car: './photos/WHL250112001_after_car.jpg'
  },
  { job_number: 'WHL250112001', car_model: 'BMW 5시리즈' }
);
```

---

## 결론 및 다음 단계

### 최종 추천: **Editly** (1순위)

**선택 근거**:
1. ✅ MIT 라이선스 (상업적 사용 자유)
2. ✅ 모든 필수 기능 지원 (BGM, 자막, 전환)
3. ✅ 세로 영상 (1080x1920) 명시적 지원
4. ✅ CLI + JavaScript API 모두 제공
5. ✅ 5.2k stars로 검증된 안정성
6. ✅ FFmpeg 기반으로 배포 간단
7. ✅ 처리 속도 빠름 (streaming 방식)

### 대안 시나리오
- **Node.js 환경 + 화려한 효과**: FFCreator (2순위)
- **Python 백엔드 통합**: MoviePy (3순위)
- **AI 자동화 + 콘텐츠 자동 생성**: ShortGPT (4순위)

### 다음 단계
1. **Phase 1**: Editly 프로토타입 구현 (2-3일)
   - [ ] 로컬 환경에서 샘플 영상 5개 생성
   - [ ] 한글 폰트 적용 테스트
   - [ ] BGM 믹싱 볼륨 조정
   - [ ] 전환 효과 A/B 테스트

2. **Phase 2**: Docker 환경 구축 (1-2일)
   - [ ] Node.js + FFmpeg Docker 이미지
   - [ ] API 서버 구축 (Express.js)
   - [ ] 파일 업로드 → 영상 생성 파이프라인

3. **Phase 3**: PWA 연동 (1-2일)
   - [ ] IndexedDB 사진 → 서버 전송
   - [ ] 진행 상황 WebSocket 모니터링
   - [ ] 완성 영상 다운로드/공유

4. **Phase 4**: 프로덕션 배포
   - [ ] 성능 테스트 (동시 처리 수)
   - [ ] 에러 핸들링 (FFmpeg 실패 시나리오)
   - [ ] 로깅 및 모니터링

---

## 참고 자료

### Sources

#### Editly
- [GitHub - mifi/editly](https://github.com/mifi/editly)
- [Editly - Slick, declarative command line video editing](https://dev.to/mifi/editly-slick-declarative-command-line-video-editing-1c99)
- [Editly | Devpost](https://devpost.com/software/editly)

#### FFCreator
- [GitHub - tnfe/FFCreator](https://github.com/tnfe/FFCreator)
- [FFCreator is a lightweight and flexible short video processing library](https://dev.to/ihtml5/ffcreator-is-a-lightweight-and-flexible-short-video-processing-library-based-on-node-js-3pbj)

#### MoviePy
- [GitHub - Zulko/moviepy](https://github.com/Zulko/moviepy)
- [MoviePy documentation](https://zulko.github.io/moviepy/)
- [Automate Video Editing with Python | Towards Data Science](https://towardsdatascience.com/automate-video-editing-with-python-4e0c43edef36/)

#### Remotion
- [GitHub - remotion-dev/remotion](https://github.com/remotion-dev/remotion)
- [Remotion | Make videos programmatically](https://www.remotion.dev/)

#### ShortGPT
- [GitHub - RayVentura/ShortGPT](https://github.com/RayVentura/ShortGPT)

#### FFmpeg 기반 솔루션
- [FFmpeg](https://ffmpeg.org/)
- [Best Open Source Video Editor SDKs: 2025 Roundup | IMG.LY Blog](https://img.ly/blog/best-open-source-video-editor-sdks-2025-roundup/)
- [Convert images to video with FFmpeg - Plainly Videos](https://www.plainlyvideos.com/blog/ffmpeg-convert-images-to-video)

#### Auto-Editor
- [GitHub - WyattBlue/auto-editor](https://github.com/WyattBlue/auto-editor)
- [Auto-Editor](https://auto-editor.com/)

#### MLT Framework
- [GitHub - mltframework/mlt](https://github.com/mltframework/mlt)
- [MLT - Home](https://www.mltframework.org/)

#### ShotTower
- [GitHub - DblK/shottower](https://github.com/DblK/shottower)

#### 기타
- [GitHub - transitive-bullshit/ffmpeg-concat](https://github.com/transitive-bullshit/ffmpeg-concat)
- [GitHub - 0x464e/slideshow-video](https://github.com/0x464e/slideshow-video)
- [GitHub - kkroening/ffmpeg-python](https://github.com/kkroening/ffmpeg-python)
- [GitHub - ManimCommunity/manim](https://github.com/ManimCommunity/manim)
- [GitHub - videoflow/videoflow](https://github.com/videoflow/videoflow)

---

**최종 업데이트**: 2025-12-05
**조사자**: Claude (Anthropic)
**프로젝트**: Photo Factory - 휠 복원 마케팅 영상 자동화
