# PRD-0016: 모노레포 → 독립 서브레포 분리

**Version**: 1.1
**Date**: 2025-12-07
**Author**: Claude Code
**Status**: Approved

---

## 1. 목적

contents-factory 모노레포의 `apps/frontend`와 `apps/backend`를 **완전히 독립된 프로젝트**로 분리:
- 환경, 사용자, 구조, 용도가 완전히 다른 두 앱의 독립성 확보
- 각 프로젝트별 독립적인 Claude Code 세션으로 개발
- 프로젝트별 릴리스/배포 주기 완전 독립화

---

## 2. 분리 당위성 분석

### 2.1 환경 차이 (완전 분리 근거)

| 항목 | Field Uploader | Shorts Generator |
|------|----------------|------------------|
| **실행 환경** | 브라우저 (Mobile PWA) | Node.js (PC CLI) |
| **플랫폼** | 스마트폰 | 데스크톱 PC |
| **런타임** | Browser APIs | Node.js fs, child_process |
| **빌드 도구** | Vite + PWA plugin | 없음 (직접 실행) |
| **배포** | GitHub Pages / Vercel | npm publish / 로컬 |

### 2.2 사용자 차이

| 항목 | Field Uploader | Shorts Generator |
|------|----------------|------------------|
| **사용자** | 현장 기술자 (비개발자) | 마케팅 담당자 |
| **사용 장소** | 작업 현장 (모바일) | 사무실 (데스크톱) |
| **기술 수준** | 앱 터치만 가능 | CLI 명령어 사용 가능 |

### 2.3 구조 차이

| 항목 | Field Uploader | Shorts Generator |
|------|----------------|------------------|
| **아키텍처** | SPA + Service Worker | CLI + FFmpeg |
| **데이터 흐름** | 촬영 → 압축 → 업로드 | 다운로드 → 영상 생성 |
| **오프라인** | ✅ IndexedDB 큐 | ❌ 온라인 필수 |
| **UI** | 터치 친화적 HTML | 터미널 TUI |

### 2.4 의존성 분석

```
Field Uploader (브라우저)     Shorts Generator (Node.js)
├── browser-image-compression  ├── editly (FFmpeg)
├── dexie (IndexedDB)          ├── commander (CLI)
├── vite + vite-plugin-pwa     ├── chalk, ora, inquirer

        공통 의존성: 0개 (PocketBase API만 공유)
```

### 2.5 결론

| 기준 | 분리 필요? |
|------|-----------|
| 환경 | ✅ 완전히 다름 |
| 사용자 | ✅ 완전히 다름 |
| 구조 | ✅ 완전히 다름 |
| 의존성 | ✅ 공유 없음 |
| 릴리스 | ✅ 독립 필요 |

**→ 완전 분리 타당**

---

## 3. 현재 구조

```
contents-factory/           # 모노레포
├── src/                    # 메인 PWA (Photo Factory)
├── apps/frontend/          # Field Uploader (스마트폰) → 분리
├── apps/backend/           # Shorts Generator (PC CLI) → 분리
└── server/                 # PocketBase (Docker)
```

---

## 4. 분리 대상

| 서브레포 | 소스 경로 | 용도 | 기술 스택 |
|----------|----------|------|----------|
| **field-uploader** | `apps/frontend/` | 스마트폰 사진 촬영 PWA | Vite + PWA |
| **shorts-generator** | `apps/backend/` | PC 영상 생성 CLI | Node.js + FFmpeg |

### 원본 레포 유지
- `contents-factory`: 메인 PWA (Photo Factory) + PocketBase 서버
- `src/`, `server/`, `tests/`, `docs/` 유지

---

## 5. 기술 요구사항

### 5.1 분리 도구
- **git filter-repo** (권장)
  - Python 3.5+ 필요
  - Git 2.22.0+ 필요
  - 히스토리 완벽 보존
  - 빠른 처리 속도 (20초 vs 12분)

### 5.2 분리 절차

```powershell
# 1. git filter-repo 설치
pip install git-filter-repo

# 2. Field Uploader 분리
git clone https://github.com/garimto81/contents-factory field-uploader
cd field-uploader
git filter-repo --subdirectory-filter apps/frontend
git remote remove origin
git remote add origin https://github.com/garimto81/field-uploader
git push -u origin main

# 3. Shorts Generator 분리
cd ..
git clone https://github.com/garimto81/contents-factory shorts-generator
cd shorts-generator
git filter-repo --subdirectory-filter apps/backend
git remote remove origin
git remote add origin https://github.com/garimto81/shorts-generator
git push -u origin main

# 4. 원본 레포 정리 (선택)
cd ../contents-factory
git rm -rf apps/
git commit -m "chore: extract apps to separate repos"
git push
```

### 5.3 새 레포 구조

#### field-uploader
```
field-uploader/
├── CLAUDE.md              # 독립 Claude Code 설정
├── package.json
├── vite.config.js
├── src/
│   ├── components/
│   ├── services/
│   └── main.js
├── tests/
└── .github/workflows/     # CI/CD
```

#### shorts-generator
```
shorts-generator/
├── CLAUDE.md              # 독립 Claude Code 설정
├── package.json
├── src/
│   ├── index.js           # CLI entry
│   ├── commands/
│   └── services/
├── tests/
└── .github/workflows/     # CI/CD
```

---

## 6. CLAUDE.md 템플릿

### field-uploader/CLAUDE.md
```markdown
# CLAUDE.md - Field Uploader

스마트폰용 사진 촬영 PWA

## Commands
npm install && npm run dev  # http://localhost:5173
npm test                    # Playwright E2E
npm run build              # Production build

## Architecture
- Vite + PWA (vite-plugin-pwa)
- PocketBase SDK로 서버 연동
- 카메라 API + IndexedDB 오프라인 저장

## Related Repos
- contents-factory: 메인 PWA + 서버
- shorts-generator: PC 영상 생성
```

### shorts-generator/CLAUDE.md
```markdown
# CLAUDE.md - Shorts Generator

PC용 쇼츠 영상 생성 CLI

## Commands
npm install
node src/index.js list     # 사진 목록
node src/index.js create   # 영상 생성
npm link                   # 전역 CLI 등록

## Requirements
- Node.js 18+
- FFmpeg (winget install FFmpeg)

## Architecture
- Commander.js CLI 프레임워크
- PocketBase SDK로 사진 다운로드
- FFmpeg로 영상 생성

## Related Repos
- contents-factory: 메인 PWA + 서버
- field-uploader: 스마트폰 촬영
```

---

## 7. Claude Code 워크플로우

### 독립 세션 (권장)
```powershell
# 터미널 1: Field Uploader
cd D:\AI\claude01\field-uploader
claude

# 터미널 2: Shorts Generator
cd D:\AI\claude01\shorts-generator
claude

# 터미널 3: Contents Factory (메인)
cd D:\AI\claude01\contents-factory
claude
```

### 멀티레포 협업 (필요시)
```bash
# 여러 레포 동시 참조
claude --add-dir ../field-uploader --add-dir ../shorts-generator
```

---

## 8. GitHub 설정

### 8.1 새 레포 생성
```bash
gh repo create garimto81/field-uploader --public --description "스마트폰 사진 촬영 PWA"
gh repo create garimto81/shorts-generator --public --description "쇼츠 영상 생성 CLI"
```

### 8.2 GitHub Actions (CI/CD)
각 레포에 독립 워크플로우:
- `field-uploader`: Vite build + Playwright test + Vercel/Netlify 배포
- `shorts-generator`: npm test + npm publish (optional)

### 8.3 Cross-repo 참조
```markdown
<!-- README.md에 추가 -->
## Related Projects
- [contents-factory](https://github.com/garimto81/contents-factory) - 메인 PWA
- [field-uploader](https://github.com/garimto81/field-uploader) - 스마트폰 앱
- [shorts-generator](https://github.com/garimto81/shorts-generator) - PC CLI
```

---

## 9. 마이그레이션 체크리스트

### Phase 1: 준비
- [ ] git filter-repo 설치 확인
- [ ] 원본 레포 백업 (git clone --mirror)
- [ ] GitHub 새 레포 2개 생성

### Phase 2: 분리 실행
- [ ] field-uploader 분리 및 push
- [ ] shorts-generator 분리 및 push
- [ ] 히스토리 보존 확인

### Phase 3: 독립 환경 구성
- [ ] 각 레포 CLAUDE.md 생성
- [ ] package.json 의존성 정리
- [ ] GitHub Actions 설정

### Phase 4: 원본 정리
- [ ] apps/ 디렉토리 제거
- [ ] CLAUDE.md 업데이트 (Sub-Projects 섹션)
- [ ] README.md 업데이트 (Related Projects 링크)

### Phase 5: 검증
- [ ] 각 레포 독립 빌드/테스트
- [ ] Claude Code 독립 세션 테스트
- [ ] Cross-repo 참조 문서 확인

---

## 10. 롤백 계획

분리 실패 시:
```bash
# 원본 레포는 변경 없음 (apps/ 제거 전까지)
# 새 레포만 삭제하면 됨
gh repo delete garimto81/field-uploader --yes
gh repo delete garimto81/shorts-generator --yes
```

---

## 11. 성공 지표

| 지표 | 목표 |
|------|------|
| 히스토리 보존 | 100% 커밋 유지 |
| 빌드 성공 | 각 레포 독립 빌드 통과 |
| 테스트 통과 | 기존 테스트 100% 통과 |
| Claude Code | 독립 세션에서 정상 동작 |

---

## Sources

- [GitHub Docs - Splitting a subfolder](https://docs.github.com/en/get-started/using-git/splitting-a-subfolder-out-into-a-new-repository)
- [ClaudeLog - --add-dir Guide](https://claudelog.com/faqs/--add-dir/)
- [Anthropic - Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

---

**Next Steps**:
1. PRD 검토 및 승인
2. `/todo`로 태스크 생성
3. Phase 1 실행
