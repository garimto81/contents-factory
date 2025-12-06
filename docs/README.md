# Contents Factory Documentation

## Quick Links

- [Quick Start](getting-started/quick-start.md) - 5분 안에 시작하기
- [Installation](getting-started/installation.md) - 상세 설치 가이드
- [Architecture](development/architecture.md) - 시스템 아키텍처

---

## Documentation Index

### Getting Started

| 문서 | 설명 | 대상 |
|------|------|------|
| [Quick Start](getting-started/quick-start.md) | 빠른 시작 가이드 | 모든 사용자 |
| [Installation](getting-started/installation.md) | 상세 설치 가이드 | 개발자 |
| [Configuration](getting-started/configuration.md) | 환경 설정 가이드 | 개발자 |

### Development

| 문서 | 설명 | 대상 |
|------|------|------|
| [Architecture](development/architecture.md) | 시스템 아키텍처 | 개발자 |
| [Testing](development/testing.md) | 테스트 가이드 | 개발자 |
| [Debugging](development/debugging.md) | 디버깅 가이드 | 개발자 |

### Deployment

| 문서 | 설명 | 대상 |
|------|------|------|
| [GitHub Pages](deployment/github-pages.md) | GitHub Pages 배포 | DevOps |
| [Docker](deployment/docker.md) | PocketBase Docker 배포 | DevOps |
| [Security](deployment/security.md) | 보안 가이드라인 | 전체 |

### Research (Historical)

2025년 기술 조사 문서:

| 문서 | 날짜 | 주제 |
|------|------|------|
| [E2E Testing Tools](research/2025-e2e-testing.md) | 2025-12 | Playwright vs Cypress 비교 |
| [Image Compression](research/2025-image-compression.md) | 2025-12 | 이미지 압축 라이브러리 비교 |
| [Video Automation](research/2025-video-automation.md) | 2025-12 | 영상 생성 솔루션 비교 |
| [Mobile Architecture](research/2025-mobile-architecture.md) | 2025-12 | 분산 아키텍처 설계 |

### Archive (Legacy)

레거시 문서 (참조용):

| 문서 | 설명 | 상태 |
|------|------|------|
| [Security Setup Complete](archive/SECURITY_SETUP_COMPLETE.md) | 보안 설정 완료 보고서 | Archived |
| [Bugfixes](archive/BUGFIXES.md) | 버그 수정 내역 | Archived |
| [Next Steps](archive/NEXT_STEPS.md) | 초기 계획 | Archived |
| [Completion Report](archive/COMPLETION_REPORT.md) | 완료 보고서 | Archived |
| [Mobile Testing](archive/MOBILE_TESTING.md) | 모바일 테스트 가이드 | Archived |

---

## Related Files

- [CLAUDE.md](../CLAUDE.md) - 프로젝트 핵심 가이드
- [SECURITY.md](SECURITY.md) - 보안 가이드라인 (활성)
- [SHORTS_SOLUTION_RESEARCH.md](SHORTS_SOLUTION_RESEARCH.md) - 쇼츠 솔루션 리서치
- [supabase_rls_policies.sql](supabase_rls_policies.sql) - Supabase RLS 정책

---

## Sub-Projects

| 프로젝트 | 위치 | 설명 |
|----------|------|------|
| Field Uploader | [apps/frontend/](../apps/frontend/README.md) | 스마트폰 사진 업로드 PWA |
| Shorts Generator | [apps/backend/](../apps/backend/README.md) | PC 영상 생성 CLI |
| PocketBase Server | [server/](../server/README.md) | 클라우드 스토리지 |

---

## PRD Documents

| PRD | 제목 | 상태 |
|-----|------|------|
| [PRD-0001](../tasks/prds/0001-prd-security-bugfix.md) | 보안 버그 수정 | 완료 |
| [PRD-0003](../tasks/prds/0003-prd-upload-ui-fix.md) | 업로드 UI 수정 | 완료 |
| [PRD-0010](../tasks/prds/0010-prd-photo-factory-final.md) | Photo Factory 최종 | 완료 |
| [PRD-0011](../tasks/prds/0011-prd-shorts-enhancement.md) | 쇼츠 품질 향상 | 계획됨 |
| [PRD-0012](../tasks/prds/0012-prd-distributed-architecture.md) | 분산 아키텍처 | 계획됨 |
| [PRD-0013](../tasks/prds/0013-prd-field-uploader.md) | Field Uploader | MVP 완료 |
| [PRD-0014](../tasks/prds/0014-prd-shorts-generator.md) | Shorts Generator | 진행 중 |
| [PRD-0015](../tasks/prds/0015-prd-documentation-refactoring.md) | 문서 리팩토링 | 진행 중 |
