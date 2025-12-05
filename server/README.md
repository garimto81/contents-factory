# Photo Factory - PocketBase Server

## 실행 방법

### Docker (권장)
```bash
docker-compose up -d
```

### 직접 실행 (Windows)
1. https://github.com/pocketbase/pocketbase/releases 에서 다운로드
2. `pocketbase.exe serve --http="0.0.0.0:8090"`

## 관리자 UI
http://localhost:8090/_/

## API 엔드포인트
- GET /api/collections/photos/records - 사진 목록
- POST /api/collections/photos/records - 사진 업로드
- GET /api/files/photos/{id}/{filename} - 이미지 다운로드

## 환경 변수
없음 (로컬 개발용)
