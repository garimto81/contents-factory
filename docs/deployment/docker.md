# Docker Deployment (PocketBase)

## Overview

PocketBase는 contents-factory의 백엔드 API 서버입니다.
`server/` 폴더에서 Docker로 실행합니다.

## Quick Start

```bash
cd server
docker-compose up -d
# → http://localhost:8090
```

## docker-compose.yml

```yaml
version: '3.8'

services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    container_name: pocketbase
    restart: unless-stopped
    ports:
      - "8090:8090"
    volumes:
      - ./pb_data:/pb/pb_data
      - ./pb_migrations:/pb/pb_migrations
      - ./pb_hooks:/pb/pb_hooks
    healthcheck:
      test: wget --no-verbose --tries=1 --spider http://localhost:8090/api/health || exit 1
      interval: 10s
      timeout: 5s
      retries: 3
```

## Directory Structure

```
server/
├── docker-compose.yml
├── pb_data/              # 데이터베이스 (gitignored)
├── pb_migrations/        # 스키마 마이그레이션
│   └── 1733400000_create_photos.js
└── pb_hooks/             # 서버 훅 (CORS 등)
    └── cors.pb.js
```

## Database Schema

### photos Collection

```javascript
// pb_migrations/1733400000_create_photos.js
migrate((db) => {
  const collection = new Collection({
    name: 'photos',
    type: 'base',
    schema: [
      { name: 'title', type: 'text', required: true },
      { name: 'image', type: 'file', required: true },
      { name: 'thumbnail', type: 'file' },
      { name: 'device_id', type: 'text', required: true },
      { name: 'created_at', type: 'date', required: true }
    ]
  });

  return Dao(db).saveCollection(collection);
});
```

## CORS Configuration

`pb_hooks/cors.pb.js`:

```javascript
routerAdd("*", (c) => {
  c.response().header().set("Access-Control-Allow-Origin", "*");
  c.response().header().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.response().header().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (c.request().method == "OPTIONS") {
    return c.noContent(204);
  }

  return c.next();
});
```

## Commands

```bash
# 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down

# 데이터 포함 삭제
docker-compose down -v

# 재시작
docker-compose restart
```

## Admin Dashboard

```
URL: http://localhost:8090/_/
초기 설정:
1. 이메일/비밀번호 입력
2. 관리자 계정 생성
3. Collections 메뉴에서 스키마 관리
```

## API Endpoints

```bash
# 사진 목록
GET http://localhost:8090/api/collections/photos/records

# 사진 업로드
POST http://localhost:8090/api/collections/photos/records
Content-Type: multipart/form-data

# 사진 삭제
DELETE http://localhost:8090/api/collections/photos/records/:id

# 파일 다운로드
GET http://localhost:8090/api/files/photos/:id/:filename
```

## Production Deployment

### Environment Variables

```bash
# .env
PB_ADMIN_EMAIL=admin@example.com
PB_ADMIN_PASSWORD=secure_password
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Data Backup

```bash
# 백업
docker-compose exec pocketbase /bin/sh -c "cd /pb && tar -czf /pb/pb_data/backup.tar.gz pb_data"

# 복원
docker-compose exec pocketbase /bin/sh -c "cd /pb && tar -xzf /pb/pb_data/backup.tar.gz"
```

## Troubleshooting

### Port Already in Use

```bash
# 포트 확인
netstat -ano | findstr :8090

# 프로세스 종료
taskkill /PID <PID> /F
```

### Permission Denied

```bash
# 볼륨 권한 설정
sudo chown -R 1000:1000 pb_data
```

### Migration Failed

```bash
# 마이그레이션 수동 실행
docker-compose exec pocketbase /pb/pocketbase migrate up
```

## Next Steps

- [GitHub Pages](github-pages.md) - 프론트엔드 배포
- [Security Guide](security.md) - 보안 설정
