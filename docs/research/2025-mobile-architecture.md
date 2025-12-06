# 모바일-PC 연동 워크플로우 아키텍처 패턴 조사 보고서

**작성일**: 2025-12-05
**조사 범위**: 현장 작업자(스마트폰 PWA) → 커맨드 센터(PC) 아키텍처

---

## 1. 자체 호스팅 BaaS (Backend as a Service)

### 1.1 Supabase (Self-hosted)

| 항목 | 내용 |
|------|------|
| **GitHub** | [github.com/supabase/supabase](https://github.com/supabase/supabase) |
| **Stars** | 94,100+ |
| **License** | Apache-2.0 |
| **언어** | TypeScript (66.3%) |
| **최신 버전** | Developer Update - April 2025 (May 7, 2025) |

#### 핵심 기능
- **Real-time**: PostgreSQL의 Write-Ahead Log (WAL) 기반 실시간 구독
  - Broadcast: 저지연 클라이언트 간 메시징 (채팅, 커서 추적, 게임 이벤트)
  - Presence: 사용자 상태 동기화 (온라인 상태, 타이핑 인디케이터)
  - Postgres Changes: DB 변경사항 실시간 수신 (WebSocket)
- **File Storage**: S3 호환 객체 스토리지
- **Authentication**: JWT 기반, RLS (Row Level Security) 정책
- **Edge Functions**: Deno 기반 서버리스 함수

#### PWA Push 알림 지원
- **네이티브 미지원**: Firebase Cloud Messaging (FCM) 연동 필요
- **구현 방법**: Edge Functions로 DB 변경 감지 → FCM HTTP v1 API 호출
- **제한사항**: Android/iOS 모두 FCM/APNs 의존

#### 리소스 요구사항
- **DB 연결**: Realtime 서버당 2개 연결 (WAL 소비)
- **확장성**: Realtime 서버 수평 확장 가능
- **저장소**: WAL 누적 방지 위해 `max_slot_wal_keep_size` 설정 필수
- **제한사항**: NOTIFY 페이로드 8KB 제한

#### Docker 배포
- ✅ 완전 지원 (공식 Docker Compose 제공)
- PostgreSQL, PostgREST, GoTrue, Realtime, Storage 전체 스택

#### 추천 사용 사례
- 복잡한 쿼리가 필요한 데이터 중심 앱
- PostgreSQL 익숙한 팀
- RLS 정책 기반 보안이 중요한 경우
- **대규모 파일 업로드 처리** (S3 호환 스토리지)

---

### 1.2 Appwrite

| 항목 | 내용 |
|------|------|
| **GitHub** | [github.com/appwrite/appwrite](https://github.com/appwrite/appwrite) |
| **Stars** | 53,800+ |
| **License** | BSD 3-Clause |
| **언어** | PHP (TypeScript SDK 포함) |
| **최신 버전** | 1.8.0 (October 2025) |

#### 핵심 기능 (v1.8.0)
- **Real-time**: Bulk API 작업 실시간 이벤트 지원
- **Database**: TablesDB 서비스, 공간 데이터 타입 (Point, Line, Polygon)
- **Functions**: Flutter 3.32, Dart 3.8, React Native 런타임 지원
- **File Storage**: 내장 파일 관리 + CSV 임포트
- **Authentication**: MFA, RBAC, SSO

#### PWA Push 알림 지원
- **네이티브 지원**: 문서에 명시되지 않음
- **가능성**: Functions를 통한 FCM/APNs 연동 가능

#### 리소스 요구사항
- **최소 사양**: 문서에 명시되지 않음 (VPS $5/월부터 가능)
- **Docker 필수**: 컨테이너 기반 아키텍처
- **확장성**: 수평 확장 가능 (Cloud 옵션 또는 self-hosted 클러스터)

#### Docker 배포
- ✅ 완전 지원 (Docker Compose 기반 설계)
- 설치 명령어: `docker run -it --rm --name appwrite -p 80:80 ...`

#### 추천 사용 사례
- **모바일 앱 우선 개발** (Flutter, React Native)
- 다국어 지원 필요 (다양한 런타임)
- GDPR/HIPAA 준수 필요 (Enterprise 옵션)
- **지리 공간 데이터 처리** (1.8.0 신규 기능)

---

### 1.3 PocketBase

| 항목 | 내용 |
|------|------|
| **GitHub** | [github.com/pocketbase/pocketbase](https://github.com/pocketbase/pocketbase) |
| **Stars** | 54,000+ |
| **License** | MIT |
| **언어** | Go (71.5%) |
| **최신 버전** | v0.34.2 (December 4, 2025) |

#### 핵심 기능
- **단일 바이너리**: 실행 파일 1개로 전체 백엔드 구성
- **Real-time**: SQLite WAL 모드 + 실시간 구독 (WebSocket)
- **Database**: 내장 SQLite (pb_data/storage 디렉토리)
- **File Storage**: 로컬 파일시스템 또는 S3 호환 스토리지
- **Admin UI**: 내장 대시보드

#### PWA Push 알림 지원
- **네이티브 미지원**: 외부 서비스 연동 필요
- **구현 방법**: Webhooks → FCM/APNs 호출

#### 리소스 요구사항
- **극도로 경량**: Go 1.23+ 빌드 환경만 필요
- **메모리**: 소규모 앱 시 수십 MB (SQLite 인메모리 캐시)
- **확장성 제한**: 수평 확장 불가 (SQLite 파일 기반)
- **적합 규모**: 중소형 워크로드 (동시 연결 수백~수천)

#### Docker 배포
- ✅ 지원 (커뮤니티 이미지 사용)
- 네이티브 바이너리 배포 권장 (`./pocketbase serve`)

#### 추천 사용 사례
- **MVP 및 사이드 프로젝트** (빠른 프로토타이핑)
- 단일 서버 배포 환경
- PostgreSQL/MySQL 인프라 불필요
- **즉각적인 배포 필요** (설정 파일 없이 실행)
- ⚠️ 프로덕션 사용 주의: v1.0.0 전까지 Breaking Changes 가능

---

### 1.4 Parse Server

| 항목 | 내용 |
|------|------|
| **GitHub** | [github.com/parse-community/parse-server](https://github.com/parse-community/parse-server) |
| **Stars** | 정확한 수치 미확인 (커뮤니티 활성) |
| **License** | BSD License |
| **언어** | JavaScript (Node.js) |
| **최신 버전** | 정보 미확인 |

#### 핵심 기능
- **Database**: MongoDB (필수)
- **Real-time**: LiveQuery 기능 (실시간 데이터 동기화)
- **Push Notifications**: 네이티브 지원 (FCM, APNs)
- **File Storage**: GridFS, S3, GCS 지원
- **GraphQL API**: REST API 외 GraphQL 지원

#### PWA Push 알림 지원
- ✅ **네이티브 지원**: FCM/APNs 직접 통합
- SDK 레벨에서 Push 알림 API 제공

#### 리소스 요구사항
- **MongoDB 필수**: 별도 DB 서버 필요
- **Node.js**: 서버 실행 환경
- **확장성**: 수평 확장 가능 (MongoDB 샤딩)

#### Docker 배포
- ✅ 지원 (공식 및 커뮤니티 이미지)

#### 추천 사용 사례
- **레거시 Parse 앱 마이그레이션**
- MongoDB 기반 인프라 보유
- iOS/Android 네이티브 앱 (SDK 성숙도)
- **Push 알림이 핵심 요구사항**

---

## 2. 실시간 통신 전문 백엔드

### 2.1 Centrifugo

| 항목 | 내용 |
|------|------|
| **GitHub** | [github.com/centrifugal/centrifugo](https://github.com/centrifugal/centrifugo) |
| **Stars** | 9,600+ |
| **License** | Apache-2.0 |
| **언어** | Go (95.9%) |
| **최신 버전** | v6.5.1 (November 13, 2025) |

#### 핵심 기능
- **Transport**: WebSocket, SSE, HTTP-streaming, gRPC, WebTransport
- **Scalability**: Redis/Nats 기반 수평 확장
- **Channel Features**: 멀티플렉싱, History, Presence, Delta Compression (Fossil)
- **Backend API**: HTTP/gRPC로 메시지 발행

#### PWA Push 알림 지원
- ✅ **PRO 버전**: FCM, APNs, HMS 네이티브 지원
- Secure Topics 기반 타겟팅

#### 리소스 요구사항
- **고효율**: Go 기반 저지연 설계
- **확장성**: 단일 서버 수천~수백만 WebSocket 연결 처리
- **Kubernetes**: 1백만 연결 테스트 사례 존재
- **메모리**: 연결당 수 KB (효율적인 리소스 관리)

#### Docker 배포
- ✅ 완전 지원 (공식 이미지)

#### 추천 사용 사례
- **순수 실시간 메시징 전문**: 채팅, 라이브 대시보드, 멀티플레이어 게임
- 언어 중립적 백엔드 통합 (Python, Node.js, Go 등)
- **대규모 동시 연결** (수십만 이상)
- BaaS 대신 메시징 레이어만 필요한 경우

---

### 2.2 Mercure

| 항목 | 내용 |
|------|------|
| **GitHub** | [github.com/dunglas/mercure](https://github.com/dunglas/mercure) |
| **Stars** | 5,100+ |
| **License** | AGPL-3.0 |
| **언어** | Go (87.4%) |
| **최신 버전** | v0.21.2 (November 14, 2025) |

#### 핵심 기능
- **Protocol**: IETF Internet-Draft (표준화 진행 중)
- **Transport**: Server-Sent Events (SSE) 기반
- **Authorization**: JWT 기반 토픽 구독 제어
- **Reconnection**: 브라우저 네이티브 재연결 지원

#### PWA Push 알림 지원
- ❌ **미지원**: SSE는 브라우저 열려있을 때만 작동
- Push 알림은 별도 솔루션 필요 (Service Worker 미지원)

#### 리소스 요구사항
- **경량**: SSE는 WebSocket보다 단순
- **HTTP/2 최적화**: 멀티플렉싱 자동 활용
- **서버리스 호환**: 지속 연결 불필요 (FastCGI, PHP 백엔드 가능)

#### Docker 배포
- ✅ 지원 (공식 이미지: `dunglas/mercure`)
- Kubernetes Helm 차트 제공

#### 추천 사용 사례
- **Symfony/API Platform 프로젝트** (원 개발 목적)
- 서버리스 아키텍처 (AWS Lambda, Google Cloud Functions)
- **브라우저 네이티브 SSE 활용** (라이브러리 불필요)
- IETF 표준 준수 중요한 경우

---

### 2.3 Socket.io vs ws (Node.js)

| 항목 | Socket.io | ws |
|------|-----------|-----|
| **GitHub** | [github.com/socketio/socket.io](https://github.com/socketio/socket.io) | [github.com/websockets/ws](https://github.com/websockets/ws) |
| **License** | MIT | MIT |
| **성능** | 메타데이터 오버헤드 존재 | 순수 WebSocket (최고 성능) |
| **자동 재연결** | ✅ | ❌ (수동 구현) |
| **Fallback** | HTTP long-polling | ❌ |
| **Broadcasting** | Rooms, Namespaces | 수동 구현 |
| **확장성** | Redis Adapter로 수평 확장 | 커스텀 구현 필요 |

#### 추천 사용 사례

**Socket.io**:
- 채팅 앱, 협업 도구 (Rooms 기능)
- 구형 브라우저/프록시 환경
- **신속한 개발** (기능 내장)

**ws**:
- 극저지연 요구 (라이브 스코어, 주식 시세)
- **순수 WebSocket 프로토콜** 준수
- 리소스 최적화 중요 (IoT, 임베디드)

---

## 3. 메시지 큐/이벤트 시스템

### 3.1 Redis Pub/Sub

| 항목 | 내용 |
|------|------|
| **공식 사이트** | [redis.io](https://redis.io/) |
| **License** | BSD (Redis 7.4부터 RSALv2/SSPLv1 듀얼) |
| **언어** | C |

#### 핵심 기능
- **At-most-once**: 메시지 전달 보장 없음 (구독자 오프라인 시 손실)
- **초저지연**: 인메모리, 50ms 이하 브로드캐스트
- **Pattern Subscribe**: 와일드카드 채널 구독 (`news.*`)
- **확장**: 샤딩 또는 Redis Cluster

#### 리소스 요구사항
- **메모리 중심**: Pub/Sub는 메시지 저장 안함 (휘발성)
- **CPU**: 단일 스레드 (멀티코어 활용 제한)
- **확장성**: 단일 인스턴스 수백만 ops/sec

#### 추천 사용 사례
- **실시간 알림** (메시지 손실 허용)
- 캐시 무효화 이벤트
- **마이크로서비스 간 이벤트 버스** (간단한 경우)

#### vs Redis Streams
- **Streams**: 메시지 영속성, Consumer Groups, 재처리 가능
- **Pub/Sub**: 휘발성, 저지연 우선

---

### 3.2 RabbitMQ

| 항목 | 내용 |
|------|------|
| **공식 사이트** | [rabbitmq.com](https://www.rabbitmq.com/) |
| **License** | MPL 2.0 |
| **언어** | Erlang |

#### 핵심 기능
- **AMQP 0-9-1**: 메시지 라우팅, 트랜잭션
- **Protocols**: AMQP, STOMP, MQTT
- **Persistence**: 디스크 저장, 메시지 재처리
- **Management UI**: 웹 대시보드 (포트 15672)

#### 리소스 요구사항
- **메모리**: 메시지 큐 크기에 비례
- **디스크**: 영속 메시지 저장
- **확장성**: Clustering, Shovel, Federation

#### Docker 배포
- ✅ 공식 이미지 (관리 UI 포함)
- `docker run -p 5672:5672 -p 15672:15672 rabbitmq:4-management`

#### 추천 사용 사례
- **마이크로서비스 아키텍처** (서비스 격리)
- IoT 디바이스 메시징 (MQTT)
- **트랜잭션 보장 필요** (금융, 주문 처리)
- 메시지 재시도, Dead Letter Queue 필요

---

### 3.3 BullMQ

| 항목 | 내용 |
|------|------|
| **GitHub** | [github.com/taskforcesh/bullmq](https://github.com/taskforcesh/bullmq) |
| **License** | MIT |
| **언어** | TypeScript (Node.js) |

#### 핵심 기능
- **Redis 기반**: Job Queue + Scheduler
- **Exactly-once**: 메시지 중복 방지 (최소 1회 보장)
- **Job Types**: FIFO, LIFO, Priority, Delayed, Repeating
- **Flow Producer**: Parent-Child Job 체이닝
- **Rate Limiting**: API 호출 속도 제한

#### 리소스 요구사항
- **Redis 의존**: 별도 Redis 서버 필요
- **Worker 확장**: 수평 확장 용이 (Round-robin)
- **성능**: Lua 스크립트 + Pipelining 최적화

#### 추천 사용 사례
- **백그라운드 작업**: 이미지/영상 처리, 이메일 전송
- 스케줄링 (cron 대체)
- **비동기 API 호출** (Rate Limit 적용)
- Node.js 프로젝트 (TypeScript 퍼스트 클래스)

---

## 4. 종합 비교 및 추천

### 4.1 기능 매트릭스

| 솔루션 | Real-time | File Storage | Auth | PWA Push | Docker | 리소스 |
|--------|-----------|--------------|------|----------|--------|--------|
| **Supabase** | ✅ WAL | ✅ S3 | ✅ RLS | ⚠️ FCM 연동 | ✅ | 중간 |
| **Appwrite** | ✅ Events | ✅ 내장 | ✅ MFA | ⚠️ 미확인 | ✅ | 중간 |
| **PocketBase** | ✅ SQLite | ✅ 로컬/S3 | ✅ | ❌ | ✅ | 매우 낮음 |
| **Parse Server** | ✅ LiveQuery | ✅ GridFS | ✅ | ✅ 네이티브 | ✅ | 중간 |
| **Centrifugo** | ✅✅ 전문 | ❌ | ❌ | ✅ PRO | ✅ | 낮음 |
| **Mercure** | ✅ SSE | ❌ | JWT | ❌ | ✅ | 매우 낮음 |
| **Socket.io** | ✅ | ❌ | 수동 | 수동 | ✅ | 낮음 |
| **ws** | ✅ 순수 | ❌ | 수동 | 수동 | ✅ | 매우 낮음 |
| **Redis Pub/Sub** | ✅ 휘발 | ❌ | ❌ | ❌ | ✅ | 낮음 |
| **RabbitMQ** | ⚠️ 비동기 | ❌ | ❌ | ❌ | ✅ | 중간 |
| **BullMQ** | ⚠️ Queue | ❌ | ❌ | ❌ | Redis | 낮음 |

---

### 4.2 현장 작업자 → PC 아키텍처 추천

#### 시나리오: 휠 복원 작업 사진 업로드 → 실시간 PC 대시보드

**요구사항**:
1. 스마트폰 PWA에서 사진 업로드 (5~10MB)
2. PC에 실시간 알림 + 자동 갤러리 업데이트
3. 자체 호스팅 (NAS 또는 클라우드 VPS)
4. 낮은 운영 복잡도

---

#### 추천 1: **PocketBase + Mercure** (MVP 단계)

**아키텍처**:
```
스마트폰 PWA
    ↓ (HTTP POST: 사진 업로드)
PocketBase (SQLite + File Storage)
    ↓ (Webhook → Mercure Hub)
Mercure (SSE Broadcast)
    ↓
PC 대시보드 (EventSource 수신)
```

**장점**:
- 초경량 (PocketBase 단일 바이너리 + Mercure 단일 바이너리)
- NAS에서 쉽게 실행 (`./pocketbase serve && ./mercure run`)
- 파일 저장 로컬 또는 S3 선택 가능
- MIT 라이선스 (상용 무료)

**단점**:
- PWA Push 알림 미지원 (PC 브라우저 열려있을 때만)
- 수평 확장 불가 (SQLite 한계)

**비용**: $0 (오픈소스) + VPS $5~10/월

---

#### 추천 2: **Supabase + Centrifugo PRO** (프로덕션)

**아키텍처**:
```
스마트폰 PWA
    ↓ (Supabase Client SDK: 사진 업로드 → Storage)
Supabase (PostgreSQL + Storage + Edge Functions)
    ↓ (DB Trigger → Edge Function → Centrifugo Publish API)
Centrifugo PRO
    ↓ (WebSocket + FCM/APNs Push)
PC 대시보드 + 모바일 백그라운드 알림
```

**장점**:
- **PWA Push 알림** 완전 지원 (Centrifugo PRO)
- 대규모 확장 가능 (PostgreSQL + Redis)
- 파일 스토리지 S3 호환
- 복잡한 쿼리 지원 (PostgreSQL)

**단점**:
- 설정 복잡도 높음
- Centrifugo PRO 라이선스 비용
- 리소스 소비 큰 편 (PostgreSQL + Redis + Centrifugo)

**비용**: Centrifugo PRO 라이선스 + VPS $20~50/월

---

#### 추천 3: **Appwrite + Socket.io** (균형)

**아키텍처**:
```
스마트폰 PWA
    ↓ (Appwrite SDK: 사진 업로드)
Appwrite (Database + Storage + Functions)
    ↓ (Realtime Events → Function)
Socket.io Server (Node.js Function)
    ↓ (WebSocket Rooms)
PC 대시보드 (Socket.io Client)
```

**장점**:
- Appwrite 내장 Real-time Events 활용
- Socket.io Rooms로 작업자별 채널 분리
- Docker Compose 원클릭 배포
- BSD 라이선스 (상용 무료)

**단점**:
- PWA Push 알림 수동 구현 (FCM 연동)
- Socket.io 오버헤드 (WebSocket 순수 대비)

**비용**: $0 (오픈소스) + VPS $10~20/월

---

### 4.3 최종 권장사항

| 단계 | 추천 조합 | 이유 |
|------|----------|------|
| **MVP** | PocketBase + ws (Node.js) | 최소 인프라, 빠른 검증 |
| **베타** | Appwrite + Socket.io | 기능 확장 용이, Docker 배포 |
| **프로덕션** | Supabase + Centrifugo PRO | 엔터프라이즈급 확장성, Push 알림 |
| **서버리스** | Supabase + Mercure | PostgreSQL + SSE 표준 |

---

## 5. 구현 체크리스트

### 5.1 PWA Push 알림 구현 (Web Push API)

**필수 요소**:
1. **Service Worker** 등록 (`sw.js`)
2. **VAPID Keys** 생성 (서버 인증)
3. **구독 API**:
   ```javascript
   navigator.serviceWorker.ready.then(registration => {
     registration.pushManager.subscribe({
       userVisibleOnly: true,
       applicationServerKey: vapidPublicKey
     });
   });
   ```
4. **서버 푸시**:
   - Node.js: `web-push` 라이브러리
   - Python: `pywebpush`
   - Go: `github.com/SherClockHolmes/webpush-go`

**iOS 제약사항** (iOS 16.4+):
- PWA 홈 화면 설치 필수
- Safari만 지원 (Chrome iOS 불가)

---

### 5.2 자체 호스팅 준비사항

1. **HTTPS 필수**:
   - Let's Encrypt (무료 SSL)
   - Cloudflare SSL (무료 tier)

2. **도메인**:
   - 서브도메인 설정 (api.example.com)
   - DNS A/CNAME 레코드

3. **방화벽**:
   - HTTP/HTTPS (80, 443)
   - WebSocket (커스텀 포트 또는 443 공유)

4. **백업**:
   - DB 스냅샷 (PostgreSQL: pg_dump, SQLite: .db 파일 복사)
   - 파일 스토리지 (S3 버킷 또는 rsync)

---

## 6. 참고 자료

### Supabase
- [Sending Push Notifications | Supabase Docs](https://supabase.com/docs/guides/functions/examples/push-notifications)
- [Self-Hosting | Supabase Docs](https://supabase.com/docs/reference/self-hosting-realtime/introduction)
- [Realtime | Supabase Docs](https://supabase.com/docs/guides/realtime)

### Appwrite
- [Choosing the right backend as a service tool in 2025 - Appwrite](https://appwrite.io/blog/post/choosing-the-right-baas-in-2025)
- [Appwrite 1.8.0: The most powerful self-hosted release yet](https://appwrite.io/blog/post/appwrite-1-8-0-self-hosted-release)

### PocketBase
- [PocketBase - Open Source backend in 1 file](https://pocketbase.io/)
- [GitHub - pocketbase/pocketbase](https://github.com/pocketbase/pocketbase)
- [What is PocketBase? Features, Limitations, and Use Cases](https://betterstack.com/community/guides/database-platforms/pocketbase-backend/)

### Centrifugo
- [GitHub - centrifugal/centrifugo](https://github.com/centrifugal/centrifugo)
- [Centrifugo – scalable real-time messaging server](https://centrifugal.dev/pro)
- [Real time messaging with Centrifugo | zen8labs](https://www.zen8labs.com/insights/development/real-time-messaging-with-centrifugo/)

### Mercure
- [Mercure.rocks: Real-time APIs Made Easy](https://mercure.rocks/)
- [GitHub - dunglas/mercure](https://github.com/dunglas/mercure)
- [Pushing Data to Clients Using the Mercure Protocol (Symfony Docs)](https://symfony.com/doc/current/mercure.html)

### Redis & Message Queues
- [Redis Pub/Sub](https://redis.io/glossary/pub-sub/)
- [Redis Pub/Sub vs Streams Choosing the Right Messaging Pattern](https://binaryscripts.com/redis/2025/05/30/redis-pubsub-vs-streams-choosing-the-right-messaging-pattern-for-real-time-applications.html)
- [RabbitMQ - Official Image | Docker Hub](https://hub.docker.com/_/rabbitmq)
- [BullMQ - Background Jobs processing](https://bullmq.io/)

### WebSocket & Real-time
- [WebSockets vs Socket.IO: Complete Real-Time Guide 2025](https://www.mergesociety.com/code-report/websocets-explained)
- [Node.js + WebSockets: When to Use ws vs socket.io](https://dev.to/alex_aslam/nodejs-websockets-when-to-use-ws-vs-socketio-and-why-we-switched-di9)

### PWA Push Notifications
- [js13kGames: Make PWAs re-engageable using Notifications and Push APIs - MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Re-engageable_Notifications_Push)
- [Using Push Notifications in PWAs: The Complete Guide](https://www.magicbell.com/blog/using-push-notifications-in-pwas)
- [# Self-Hosted Push Notifications Part-1 - DEV Community](https://dev.to/bunty9/-self-hosted-push-notifications-12g5)

---

**작성**: Claude Code (Anthropic)
**모델**: claude-sonnet-4-5-20250929
**검색 엔진**: WebSearch + WebFetch
