# PRD-0015: 문서 체계 리팩토링

**Version**: 1.0.0
**Date**: 2025-12-06
**Author**: Claude Code
**Status**: Completed
**Priority**: P1 (High)

---

## 1. 배경 및 목적

### 1.1 현재 상황

Contents Factory 프로젝트는 다음과 같은 문서 구조 문제를 가지고 있습니다:

| 문제 | 상세 | 영향 |
|------|------|------|
| **중복 문서** | CLAUDE.md, TODO.md, docs/*.md 간 내용 중복 | 유지보수 부담 증가 |
| **분산된 정보** | 설정 가이드가 여러 파일에 분산 | 신규 개발자 온보딩 어려움 |
| **구버전 문서** | archive/ 폴더의 레거시 문서 혼재 | 혼란 유발 |
| **리서치 문서 과다** | 2025년 리서치 4개 파일 (untracked) | git 상태 오염 |
| **PRD 번호 불연속** | 0001, 0003, 0010-0014 (0002, 0004-0009 누락) | 체계성 부족 |

### 1.2 목표

1. **단일 진입점**: 모든 문서에 대한 명확한 진입점 확립
2. **계층 구조**: 역할별 문서 분류 (개발자/사용자/운영)
3. **중복 제거**: CLAUDE.md 중심의 단일 소스 유지
4. **아카이브 정리**: 불필요한 문서 제거 및 히스토리 보존

---

## 2. 현재 문서 구조 분석

### 2.1 docs/ 폴더 현황

```
docs/
├── SECURITY.md                              # 보안 가이드 (활성)
├── SHORTS_SOLUTION_RESEARCH.md              # 쇼츠 솔루션 리서치 (활성)
├── E2E_TESTING_TOOLS_COMPARISON_2025.md     # 리서치 (untracked)
├── IMAGE_COMPRESSION_LIBRARY_COMPARISON_2025.md  # 리서치 (untracked)
├── IMAGE_TO_VIDEO_AUTOMATION_RESEARCH_2025.md    # 리서치 (untracked)
├── MOBILE_PC_ARCHITECTURE_RESEARCH_2025.md       # 리서치 (untracked)
└── archive/
    ├── SECURITY_SETUP_COMPLETE.md           # 레거시
    ├── BUGFIXES.md                          # 레거시
    ├── NEXT_STEPS.md                        # 레거시
    ├── COMPLETION_REPORT.md                 # 레거시
    └── MOBILE_TESTING.md                    # 레거시
```

### 2.2 루트 문서 현황

```
contents-factory/
├── CLAUDE.md          # 프로젝트 가이드 (369줄, 메인)
├── TODO.md            # 작업 목록 (355줄, CLAUDE.md와 중복)
├── apps/
│   ├── frontend/README.md   # Field Uploader 가이드
│   └── backend/README.md    # Shorts Generator 가이드
└── server/README.md         # PocketBase 가이드
```

### 2.3 PRD 현황

```
tasks/prds/
├── 0001-prd-security-bugfix.md    # 완료
├── 0003-prd-upload-ui-fix.md      # 완료
├── 0010-prd-photo-factory-final.md # 완료
├── 0011-prd-shorts-enhancement.md  # 계획
├── 0012-prd-distributed-architecture.md # 계획
├── 0013-prd-field-uploader.md      # MVP 완료
└── 0014-prd-shorts-generator.md    # 진행 중
```

---

## 3. 목표 문서 구조

### 3.1 제안 구조

```
contents-factory/
├── CLAUDE.md                    # 핵심 가이드 (축약, ~200줄)
├── docs/
│   ├── README.md                # 문서 인덱스 (진입점)
│   ├── getting-started/
│   │   ├── installation.md      # 설치 가이드
│   │   ├── quick-start.md       # 빠른 시작
│   │   └── configuration.md     # 설정 가이드
│   ├── development/
│   │   ├── architecture.md      # 아키텍처 상세
│   │   ├── testing.md           # 테스트 가이드
│   │   └── debugging.md         # 디버깅 가이드
│   ├── deployment/
│   │   ├── github-pages.md      # GitHub Pages 배포
│   │   ├── docker.md            # Docker/PocketBase
│   │   └── security.md          # 보안 가이드 (기존 유지)
│   ├── research/                # 리서치 문서 정리
│   │   └── 2025-*.md            # 날짜별 리서치
│   └── archive/                 # 레거시 (참조용)
│       └── *.md
├── apps/
│   ├── frontend/README.md       # 유지
│   └── backend/README.md        # 유지
└── server/README.md             # 유지
```

### 3.2 CLAUDE.md 축약안

현재 CLAUDE.md(369줄)를 핵심 정보만 유지하고 상세 내용은 docs/로 분리:

| 섹션 | 현재 | 목표 | 이동 위치 |
|------|------|------|-----------|
| Project Overview | 유지 | 유지 | - |
| Development Commands | 유지 | 축약 | docs/getting-started/quick-start.md |
| Architecture | 유지 | 요약만 | docs/development/architecture.md |
| Key Patterns | 상세 | 참조만 | docs/development/architecture.md |
| Photo Categories | 유지 | 유지 | - |
| Video Generation | 유지 | 유지 | - |
| Test Configuration | 상세 | 요약만 | docs/development/testing.md |
| Debug | 상세 | 참조만 | docs/development/debugging.md |
| Sub-Projects | 유지 | 유지 | - |
| Security | 유지 | 참조만 | docs/deployment/security.md |
| Naming Convention | 유지 | 유지 | - |
| Deployment | 유지 | 참조만 | docs/deployment/github-pages.md |

---

## 4. 작업 항목

### Phase 1: 정리 (Day 1-2)

| 작업 | 파일 | 우선순위 |
|------|------|----------|
| docs/README.md 인덱스 생성 | 신규 | High |
| 리서치 문서 정리 (untracked 4개) | docs/research/ | High |
| archive/ 정리 (5개 파일 검토) | docs/archive/ | Medium |
| TODO.md → CLAUDE.md 통합 후 삭제 | 루트 | High |

### Phase 2: 분리 (Day 3-4)

| 작업 | 파일 | 우선순위 |
|------|------|----------|
| getting-started/ 폴더 생성 | 3개 파일 | High |
| development/ 폴더 생성 | 3개 파일 | High |
| deployment/ 폴더 생성 | 3개 파일 | Medium |

### Phase 3: 축약 (Day 5)

| 작업 | 파일 | 우선순위 |
|------|------|----------|
| CLAUDE.md 축약 (369→200줄) | CLAUDE.md | High |
| 상호 참조 링크 추가 | 전체 | Medium |
| 문서 검증 (깨진 링크 확인) | 전체 | Low |

---

## 5. 상세 작업 명세

### 5.1 docs/README.md (신규)

```markdown
# Contents Factory Documentation

## Quick Links

- [Quick Start](getting-started/quick-start.md) - 5분 안에 시작하기
- [Installation](getting-started/installation.md) - 상세 설치 가이드
- [Architecture](development/architecture.md) - 시스템 아키텍처

## Documentation Index

### Getting Started
| 문서 | 설명 | 대상 |
|------|------|------|
| [Quick Start](getting-started/quick-start.md) | 빠른 시작 | 모든 사용자 |
| [Installation](getting-started/installation.md) | 설치 가이드 | 개발자 |
| [Configuration](getting-started/configuration.md) | 설정 가이드 | 개발자 |

### Development
| 문서 | 설명 | 대상 |
|------|------|------|
| [Architecture](development/architecture.md) | 아키텍처 | 개발자 |
| [Testing](development/testing.md) | 테스트 가이드 | 개발자 |
| [Debugging](development/debugging.md) | 디버깅 가이드 | 개발자 |

### Deployment
| 문서 | 설명 | 대상 |
|------|------|------|
| [GitHub Pages](deployment/github-pages.md) | 배포 가이드 | DevOps |
| [Docker](deployment/docker.md) | PocketBase 배포 | DevOps |
| [Security](deployment/security.md) | 보안 가이드 | 전체 |

### Research (Historical)
| 문서 | 날짜 | 주제 |
|------|------|------|
| [E2E Testing Tools](research/2025-e2e-testing.md) | 2025-12 | Playwright vs Cypress |
| [Image Compression](research/2025-image-compression.md) | 2025-12 | 라이브러리 비교 |
| [Video Automation](research/2025-video-automation.md) | 2025-12 | 영상 생성 솔루션 |
| [Mobile Architecture](research/2025-mobile-architecture.md) | 2025-12 | 분산 아키텍처 |
```

### 5.2 TODO.md 통합 계획

TODO.md의 핵심 정보를 다음과 같이 재배치:

| 섹션 | 이동 위치 | 처리 방식 |
|------|-----------|-----------|
| 완료된 항목 (Phase 1-4) | CHANGELOG.md | 히스토리 보존 |
| 남은 작업 (Optional) | GitHub Issues | 이슈 생성 |
| 쇼츠 품질 향상 | PRD-0011 참조 | 중복 제거 |
| 분산 아키텍처 | PRD-0012 참조 | 중복 제거 |
| Field Uploader | PRD-0013 참조 | 중복 제거 |
| Shorts Generator | PRD-0014 참조 | 중복 제거 |

### 5.3 리서치 문서 처리

현재 untracked 상태인 4개 리서치 문서:

| 파일 | 처리 | 이유 |
|------|------|------|
| E2E_TESTING_TOOLS_COMPARISON_2025.md | 이동 → docs/research/ | 유용한 참조 |
| IMAGE_COMPRESSION_LIBRARY_COMPARISON_2025.md | 이동 → docs/research/ | 유용한 참조 |
| IMAGE_TO_VIDEO_AUTOMATION_RESEARCH_2025.md | 이동 → docs/research/ | 유용한 참조 |
| MOBILE_PC_ARCHITECTURE_RESEARCH_2025.md | 이동 → docs/research/ | 유용한 참조 |

### 5.4 archive/ 정리

| 파일 | 처리 | 이유 |
|------|------|------|
| SECURITY_SETUP_COMPLETE.md | 삭제 | SECURITY.md로 대체됨 |
| BUGFIXES.md | 통합 → CHANGELOG.md | 히스토리 보존 |
| NEXT_STEPS.md | 삭제 | TODO.md로 대체됨 |
| COMPLETION_REPORT.md | 통합 → CHANGELOG.md | 히스토리 보존 |
| MOBILE_TESTING.md | 이동 → docs/development/testing.md | 유용한 내용 |

---

## 6. 성공 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| CLAUDE.md 줄 수 | 369줄 | ~200줄 | wc -l |
| docs/ 파일 수 | 11개 | 12개 | 구조화됨 |
| 중복 문서 수 | 3개 | 0개 | 수동 검토 |
| Untracked 문서 | 4개 | 0개 | git status |
| 문서 인덱스 | 없음 | 1개 | docs/README.md |

---

## 7. 타임라인

```
Day 1-2: Phase 1 (정리)
├── docs/README.md 생성
├── 리서치 문서 이동 (4개)
├── TODO.md 분석 및 통합 계획
└── archive/ 검토

Day 3-4: Phase 2 (분리)
├── getting-started/ 생성 (3개)
├── development/ 생성 (3개)
└── deployment/ 생성 (3개)

Day 5: Phase 3 (축약)
├── CLAUDE.md 축약
├── 상호 참조 링크 추가
├── 깨진 링크 확인
└── 최종 검증
```

---

## 8. 리스크 및 대응

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| 기존 링크 깨짐 | 중 | 중 | 리다이렉트 또는 검색 |
| 정보 누락 | 낮 | 높 | 이동 전 체크리스트 확인 |
| 팀원 혼란 | 중 | 중 | 변경사항 공지, README 우선 안내 |

---

## 9. 검증 체크리스트

### Phase 1 완료 조건
- [x] docs/README.md 존재
- [x] docs/research/ 폴더에 4개 파일 이동 완료
- [x] git status에서 untracked 문서 0개
- [x] TODO.md 내용 분석 완료

### Phase 2 완료 조건
- [x] docs/getting-started/ 폴더에 3개 파일 존재
- [x] docs/development/ 폴더에 3개 파일 존재
- [x] docs/deployment/ 폴더에 3개 파일 존재

### Phase 3 완료 조건
- [x] CLAUDE.md 200줄 이하 (189줄)
- [x] 모든 문서 간 링크 정상 동작
- [x] docs/README.md에서 모든 문서 접근 가능

---

## 10. 관련 문서

- CLAUDE.md - 현재 프로젝트 가이드
- TODO.md - 현재 작업 목록 (통합 예정)
- PRD-0010 - Photo Factory 최종 명세
- PRD-0011~0014 - 관련 기능 PRD

---

**Next Steps**:
1. 이 PRD 승인 후 `/todo` 실행하여 태스크 생성
2. Phase 1부터 순차 진행
3. 각 Phase 완료 시 검증 체크리스트 확인
