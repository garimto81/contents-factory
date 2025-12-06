# Quick Start - 5분 안에 시작하기

## Prerequisites

- Node.js >= 18
- npm >= 9

## Installation

```bash
# Clone & Install
git clone https://github.com/garimtoi/content-factory.git
cd contents-factory
npm install
```

## Start Development

```bash
npm run dev
# → http://localhost:6010
```

브라우저에서 `http://localhost:6010` 접속하면 Photo Factory PWA가 실행됩니다.

## Basic Usage

1. **새 작업 생성**: 메인 화면에서 "새 작업" 버튼 클릭
2. **사진 촬영/업로드**: 5개 카테고리별 사진 추가
   - 입고 (before_car)
   - 문제 (before_wheel)
   - 과정 (during)
   - 해결 (after_wheel)
   - 출고 (after_car)
3. **영상 생성**: 작업 상세에서 "영상 생성" 클릭
4. **다운로드**: 생성된 WebM 파일 다운로드

## Mobile Access (PWA)

같은 네트워크에서 모바일 접속:

```bash
npm run dev
# 콘솔에 표시된 Network URL 확인
# → http://192.168.x.x:6010
```

모바일 브라우저에서 위 URL 접속 → "홈 화면에 추가" → PWA 설치 완료

## Next Steps

- [Installation Guide](installation.md) - 상세 설치 가이드
- [Configuration](configuration.md) - 환경 설정
- [Architecture](../development/architecture.md) - 시스템 구조 이해
