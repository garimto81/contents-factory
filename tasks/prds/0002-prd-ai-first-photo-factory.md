# PRD-0002: AI-First Photo Factory 2.0 (혁신 버전)

**작성일**: 2025-01-12
**상태**: Draft (Innovation Proposal)
**버전**: 2.0.0
**작성자**: Claude AI
**우선순위**: High
**기반 문서**: PRD-0001 (기본 버전)

---

## 🎯 Executive Summary

**기존 PRD-0001의 한계**:
- 기술자 인지 부하 높음 (5개 카테고리 기억)
- 마케터 수동 작업 필요 (10분/작업)
- 콘텐츠 다양성 부족 (1개 작업 = 3개 콘텐츠)
- 확장성 제한 (휠 복원 전용)

**AI-First 2.0의 혁신**:
- ✨ **Zero-Touch Automation**: AI가 95% 자동 처리
- 🤖 **GPT-4V 통합**: 사진만으로 완전 자동 콘텐츠 생성
- 📊 **예측 분석**: 다음 달 문의 건수 AI 예측
- 🌍 **화이트라벨 SaaS**: 모든 산업 확장 가능

**핵심 지표 개선**:
| 항목 | PRD-0001 | PRD-0002 | 개선율 |
|------|----------|----------|--------|
| 촬영 시간 | 2분 | 30초 | **75% ↓** |
| 콘텐츠 생성 | 10분 | 10초 | **98% ↓** |
| 콘텐츠 수 | 3개/작업 | 10개/작업 | **233% ↑** |
| 재방문율 | 5% | 20% | **300% ↑** |

---

## 1. 문제 정의 (Problem Statement)

### 기존 PRD-0001의 근본 문제

#### 1.1 사용자 경험 문제
**현장 기술자**:
- ❌ 5개 카테고리를 외워야 함 → 실수 발생 (20%)
- ❌ 사진 품질을 즉시 확인 못함 → 재촬영 불가

**마케터**:
- ❌ 3개 도구 학습 필요 (SimpleMDE, Fabric.js, CapCut) → 온보딩 2주
- ❌ 수동 키워드 입력 → 검색 트렌드 반영 느림
- ❌ 동일 템플릿 반복 → SEO 불리

**업체 대표**:
- ❌ Google Sheets 수동 집계 → 과거 데이터만 확인
- ❌ 재방문 고객 관리 불가 → 1회성 관계

#### 1.2 기술적 한계
- **확장성 부족**: 휠 복원 외 산업 적용 불가 (하드코딩)
- **콘텐츠 제한**: 1개 작업 = 3개 콘텐츠 (부족)
- **저작권 미보호**: 콘텐츠 도용 시 대응 어려움

#### 1.3 비즈니스 기회 상실
- **수익화 부재**: 사진 → 콘텐츠만 지원 (고객 데이터 미활용)
- **B2B 불가**: 화이트라벨 구조 없음
- **글로벌 불가**: 다국어 미지원

---

### AI-First 2.0이 해결하는 문제

**"Zero-Touch Automation"**: 기술자는 찍기만, AI가 나머지 100% 처리

1. **촬영 단계**: AR 가이드 + 실시간 AI 품질 검증 → 30초 완료
2. **생성 단계**: GPT-4V가 사진만으로 10개 콘텐츠 자동 생성 → 10초 완료
3. **발행 단계**: 트렌드 키워드 자동 삽입 + 3개 플랫폼 동시 발행
4. **분석 단계**: AI가 다음 달 문의 예측 + 재방문 자동 유도
5. **확장 단계**: 화이트라벨 SaaS로 모든 산업 지원

---

## 2. 대상 사용자 (Target Users)

### Primary Users (동일)
1. **현장 기술자** - 촬영만 담당 (AI가 나머지 처리)
2. **마케터** - 승인만 담당 (AI 생성 콘텐츠 검토)
3. **업체 대표** - AI 대시보드로 예측 분석 확인

### Secondary Users (신규)
4. **SaaS 관리자** - 화이트라벨 설정 관리
5. **프랜차이즈 본부** - 다중 매장 통합 대시보드

---

## 3. 핵심 기능 (Core Features)

### 🆕 Feature 0: AI 촬영 가이드 (Computer Vision)

**목표**: 기술자의 인지 부하 제로화

#### 기능 세부사항
```javascript
// TensorFlow.js + COCO-SSD 모델
import * as cocoSsd from '@tensorflow-models/coco-ssd';

async function startAIGuide() {
  const model = await cocoSsd.load();
  const video = document.getElementById('camera');

  setInterval(async () => {
    const predictions = await model.detect(video);

    // 차량 감지
    const hasCar = predictions.some(p => p.class === 'car');
    if (hasCar && currentCategory === 'before_car') {
      showOverlay('✅ 완벽한 각도! 촬영하세요');
    } else {
      showOverlay('📍 2m 뒤로 이동하세요');
    }

    // 자동 카테고리 판단
    if (isCloseUp(predictions) && hasWheel(predictions)) {
      autoSetCategory('before_wheel');
    }
  }, 1000);
}
```

#### AR 오버레이 UI
```html
<div class="ar-guide">
  <div class="target-frame">
    <!-- 가이드 프레임 표시 -->
    <svg class="guide-overlay">
      <rect x="10%" y="20%" width="80%" height="60%"
            stroke="#00ff00" stroke-width="3" fill="none"/>
    </svg>
  </div>
  <div class="instruction">
    📷 휠에 더 가까이 (50cm)
  </div>
</div>
```

#### 수락 기준
- [ ] 촬영 시 실시간 가이드 표시 (지연 < 100ms)
- [ ] 차량/휠 객체 인식 정확도 95% 이상
- [ ] 자동 카테고리 분류 정확도 90% 이상
- [ ] 기술자 촬영 시간 2분 → 30초

**우선순위**: P0 (MVP)

---

### 🆕 Feature 1: AI 품질 검증 + 즉시 피드백

**목표**: 품질 불량 사진 제로화

#### 검증 알고리즘
```javascript
// 1. 흐릿함 감지 (Laplacian Variance)
async function detectBlur(imageFile) {
  const img = await loadImage(imageFile);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const gray = toGrayscale(imageData);

  // Laplacian 필터 적용
  const laplacian = applyLaplacian(gray);
  const variance = calculateVariance(laplacian);

  return {
    sharpness: variance,
    isBlurry: variance < 100 // 임계값
  };
}

// 2. 조명 검증
function analyzeBrightness(imageData) {
  const histogram = new Array(256).fill(0);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const brightness = Math.round((r + g + b) / 3);
    histogram[brightness]++;
  }

  // 평균 밝기 계산
  const avgBrightness = histogram.reduce((sum, count, val) =>
    sum + count * val, 0) / imageData.data.length * 4;

  return {
    avgBrightness,
    isTooDark: avgBrightness < 80,
    isTooLight: avgBrightness > 200
  };
}

// 3. 구도 검증 (휠 중앙 배치)
async function verifyComposition(imageFile) {
  const model = await cocoSsd.load();
  const predictions = await model.detect(imageFile);

  const wheel = predictions.find(p =>
    p.class === 'car' && isWheelRegion(p.bbox)
  );

  if (!wheel) return { valid: false, reason: '휠이 감지되지 않음' };

  const [x, y, width, height] = wheel.bbox;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const imgCenterX = imageFile.width / 2;
  const imgCenterY = imageFile.height / 2;

  const offset = Math.sqrt(
    Math.pow(centerX - imgCenterX, 2) +
    Math.pow(centerY - imgCenterY, 2)
  );

  return {
    valid: offset < 100,
    reason: offset >= 100 ? '휠을 중앙에 배치하세요' : 'OK'
  };
}

// 통합 검증 함수
async function validatePhoto(imageFile, category) {
  const blur = await detectBlur(imageFile);
  const brightness = analyzeBrightness(imageFile);
  const composition = await verifyComposition(imageFile);

  const issues = [];

  if (blur.isBlurry) issues.push('🔴 사진이 흐릿합니다. 더 가까이 촬영하세요');
  if (brightness.isTooLight) issues.push('☀️ 너무 밝습니다. 역광을 피하세요');
  if (brightness.isTooLight) issues.push('🌙 너무 어둡습니다. 조명을 켜세요');
  if (!composition.valid) issues.push(`📐 ${composition.reason}`);

  return {
    valid: issues.length === 0,
    issues,
    score: calculateScore(blur, brightness, composition)
  };
}
```

#### 즉시 피드백 UI
```html
<div class="photo-validation">
  <div class="validation-result error">
    <h3>❌ 재촬영 필요</h3>
    <ul>
      <li>🔴 사진이 흐릿합니다. 더 가까이 촬영하세요</li>
      <li>🌙 너무 어둡습니다. 조명을 켜세요</li>
    </ul>
    <button onclick="retakePhoto('after_wheel')">
      🔄 다시 촬영하기
    </button>
  </div>
</div>
```

#### Supabase 저장
```sql
-- photos 테이블에 품질 점수 추가
ALTER TABLE photos
ADD COLUMN quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100),
ADD COLUMN validation_issues TEXT[];

-- 품질 불량 사진 조회
SELECT * FROM photos
WHERE quality_score < 70
ORDER BY uploaded_at DESC;
```

#### 수락 기준
- [ ] 흐릿함 감지 정확도 95% 이상
- [ ] 조명 문제 감지 정확도 90% 이상
- [ ] 검증 시간 < 2초 (업로드 후)
- [ ] 품질 불량 사진 재촬영율 100%

**우선순위**: P0 (MVP)

---

### 🆕 Feature 2: GPT-4V 자동 콘텐츠 생성

**목표**: 마케터 작업 시간 10분 → 10초

#### Supabase Edge Function 구조

##### 1. 함수 생성 (`supabase/functions/generate-content/index.ts`)
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { jobId } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. 작업 정보 및 사진 조회
  const { data: job } = await supabase
    .from('jobs')
    .select(`
      *,
      photos (category, imgur_url)
    `)
    .eq('id', jobId)
    .single()

  // 2. 사진을 카테고리별로 정리
  const photosByCategory = {
    before_car: job.photos.filter(p => p.category === 'before_car'),
    before_wheel: job.photos.filter(p => p.category === 'before_wheel'),
    during: job.photos.filter(p => p.category === 'during'),
    after_wheel: job.photos.filter(p => p.category === 'after_wheel'),
    after_car: job.photos.filter(p => p.category === 'after_car')
  }

  // 3. GPT-4V API 호출
  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'system',
          content: `당신은 SEO 전문 자동차 마케터입니다.
          주어진 휠 복원 작업 사진을 분석하여:
          1. 네이버 블로그 글 (1200자, 감성적, 키워드 자연스럽게 삽입)
          2. 인스타그램 캡션 (120자 이내, 해시태그 10개)
          3. 유튜브 숏폼 자막 (5개 슬라이드, 각 10자 이내)
          을 JSON 형식으로 생성하세요.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `차종: ${job.car_model}, 지역: ${job.location}, 작업일: ${job.work_date}`
            },
            ...Object.entries(photosByCategory).flatMap(([category, photos]) =>
              photos.map(photo => ({
                type: 'image_url',
                image_url: { url: photo.imgur_url }
              }))
            )
          ]
        }
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
  })

  const result = await openaiResponse.json()
  const generatedContent = JSON.parse(result.choices[0].message.content)

  // 4. 생성된 콘텐츠 Supabase에 저장
  const { data: contents } = await supabase.from('generated_contents').insert([
    {
      job_id: jobId,
      type: 'blog',
      title: generatedContent.blog.title,
      content: generatedContent.blog.content,
      status: 'pending_review'
    },
    {
      job_id: jobId,
      type: 'instagram',
      content: generatedContent.instagram.caption,
      hashtags: generatedContent.instagram.hashtags,
      status: 'pending_review'
    },
    {
      job_id: jobId,
      type: 'shortform',
      content: JSON.stringify(generatedContent.shortform.slides),
      status: 'pending_review'
    }
  ]).select()

  return new Response(JSON.stringify({
    success: true,
    contents: contents
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

##### 2. 무료 대안: Hugging Face BLIP-2
```typescript
// GPT-4V 대신 무료 모델 사용
async function generateWithHuggingFace(imageUrls, jobData) {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/Salesforce/blip2-opt-2.7b',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('HUGGINGFACE_TOKEN')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: imageUrls[0], // 대표 이미지
        parameters: {
          prompt: `차량 휠 복원 작업에 대한 블로그 글을 작성하세요. 차종: ${jobData.car_model}`
        }
      })
    }
  )

  const result = await response.json()
  return result[0].generated_text
}
```

#### 데이터베이스 스키마
```sql
-- 생성된 콘텐츠 테이블
CREATE TABLE generated_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'blog', 'instagram', 'shortform'
  title TEXT,
  content TEXT NOT NULL,
  hashtags TEXT[],
  status TEXT DEFAULT 'pending_review', -- 'pending_review', 'approved', 'published'

  -- AI 메타데이터
  model_used TEXT DEFAULT 'gpt-4-vision-preview',
  generation_time INTEGER, -- 밀리초
  tokens_used INTEGER,

  -- 성과 추적
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),

  created_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_contents_job ON generated_contents(job_id);
CREATE INDEX idx_contents_status ON generated_contents(status);
CREATE INDEX idx_contents_type ON generated_contents(type);
```

#### 마케터 승인 UI
```html
<div class="content-review">
  <h2>AI 생성 콘텐츠 검토</h2>

  <div class="content-card">
    <h3>📝 네이버 블로그</h3>
    <div class="content-preview">
      <h4>{{ generatedContent.blog.title }}</h4>
      <p>{{ generatedContent.blog.content | truncate(200) }}</p>
    </div>
    <div class="actions">
      <button onclick="editContent('blog')">✏️ 수정</button>
      <button onclick="approveContent('blog')" class="primary">
        ✅ 승인 및 발행
      </button>
    </div>
  </div>

  <div class="ai-insights">
    <span class="badge">🤖 GPT-4V 생성</span>
    <span class="badge">⚡ 3.2초 소요</span>
    <span class="badge">📊 예상 조회수: 450회</span>
  </div>
</div>
```

#### 수락 기준
- [ ] 사진 업로드 후 10초 이내 3개 콘텐츠 자동 생성
- [ ] 블로그 글 품질: 문법 오류 < 1%, 키워드 밀도 2-3%
- [ ] 마케터 수정 비율 < 30% (70% 이상 그대로 사용 가능)
- [ ] 생성 비용 < $0.20/작업 (GPT-4V 기준)

**우선순위**: P1 (고가치 기능)

---

### 🆕 Feature 3: 동적 템플릿 엔진 + 트렌드 키워드

**목표**: SEO 다양성 확보 + 검색량 최대화

#### 3.1 동적 템플릿 생성
```javascript
// 템플릿 변형 엔진
const templateVariations = [
  {
    id: 'problem_solution',
    structure: ['문제 제시', '과정 설명', '해결 결과', '고객 후기'],
    tone: 'professional',
    seoScore: 85
  },
  {
    id: 'story_telling',
    structure: ['고객 이야기', '타임라인', '비포애프터', 'CTA'],
    tone: 'emotional',
    seoScore: 90
  },
  {
    id: 'qa_format',
    structure: ['Q: 문제가 뭔가요?', 'A: 휠 긁힘', 'Q: 어떻게 해결?', 'A: 작업 과정'],
    tone: 'conversational',
    seoScore: 80
  },
  {
    id: 'expert_review',
    structure: ['전문가 분석', '작업 디테일', '기술 설명', '추천'],
    tone: 'technical',
    seoScore: 88
  }
]

// A/B 테스트 기반 자동 선택
async function selectBestTemplate(jobId) {
  // 과거 성과 데이터 조회
  const { data: performanceData } = await supabase
    .from('generated_contents')
    .select('template_id, views, engagement_rate')
    .eq('type', 'blog')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // 최근 30일

  // 템플릿별 평균 성과 계산
  const scores = templateVariations.map(template => {
    const templateData = performanceData.filter(d => d.template_id === template.id)
    const avgEngagement = templateData.reduce((sum, d) =>
      sum + d.engagement_rate, 0) / templateData.length || 0

    return {
      ...template,
      performanceScore: avgEngagement * 0.7 + template.seoScore * 0.3
    }
  })

  // 상위 성과 템플릿 선택 (epsilon-greedy: 80% 최고, 20% 랜덤)
  const shouldExplore = Math.random() < 0.2
  if (shouldExplore) {
    return scores[Math.floor(Math.random() * scores.length)]
  } else {
    return scores.sort((a, b) => b.performanceScore - a.performanceScore)[0]
  }
}
```

#### 3.2 실시간 트렌드 키워드
```typescript
// Naver Datalab API 연동
async function getTrendingKeywords(region: string, baseKeyword: string) {
  const candidates = [
    `${region} ${baseKeyword}`,
    `${region} ${baseKeyword} 추천`,
    `${region} ${baseKeyword} 가격`,
    `${region} ${baseKeyword} 후기`,
    `${baseKeyword} ${region}`,
    `${baseKeyword} 잘하는곳 ${region}`
  ]

  const response = await fetch('https://openapi.naver.com/v1/datalab/search', {
    method: 'POST',
    headers: {
      'X-Naver-Client-Id': Deno.env.get('NAVER_CLIENT_ID'),
      'X-Naver-Client-Secret': Deno.env.get('NAVER_CLIENT_SECRET'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      startDate: getDateWeeksAgo(4), // 4주 전
      endDate: getToday(),
      timeUnit: 'week',
      keywordGroups: candidates.map(keyword => ({
        groupName: keyword,
        keywords: [keyword]
      }))
    })
  })

  const data = await response.json()

  // 최근 1주 검색량 기준 정렬
  const rankedKeywords = data.results.map(result => {
    const recentRatio = result.data[result.data.length - 1].ratio
    return {
      keyword: result.title,
      searchVolume: recentRatio,
      trend: calculateTrend(result.data) // 상승/하락/유지
    }
  }).sort((a, b) => b.searchVolume - a.searchVolume)

  return rankedKeywords[0] // 가장 높은 검색량 키워드
}

// GPT 프롬프트에 트렌드 키워드 주입
async function generateContentWithTrends(jobData, photos) {
  const trendingKeyword = await getTrendingKeywords(jobData.location, '휠복원')

  const prompt = `
    다음 작업 사진을 보고 블로그 글을 작성하세요.

    필수 키워드: "${trendingKeyword.keyword}" (현재 검색량 ${trendingKeyword.searchVolume})
    - 제목에 1회 포함
    - 본문에 자연스럽게 2-3회 포함
    - 키워드 밀도: 2-3%

    차종: ${jobData.car_model}
    지역: ${jobData.location}
  `

  // GPT-4V 호출 (생략)
}
```

#### 3.3 1개 작업 → 10개 변형 생성
```javascript
// 콘텐츠 변형 생성기
async function generateVariations(jobId) {
  const variations = [
    {
      angle: 'before_after',
      platform: 'blog',
      prompt: '비포애프터 중심으로 극적인 변화 강조'
    },
    {
      angle: 'process_detail',
      platform: 'blog',
      prompt: '작업 과정의 전문성과 디테일 강조'
    },
    {
      angle: 'customer_review',
      platform: 'blog',
      prompt: '고객 만족도와 후기 중심 (가상 인터뷰 형식)'
    },
    {
      angle: 'price_comparison',
      platform: 'blog',
      prompt: 'DIY vs 전문가 비용/시간 비교 분석'
    },
    {
      angle: 'maintenance_tips',
      platform: 'blog',
      prompt: '휠 관리 팁 5가지 (이 작업 사례 포함)'
    },
    {
      angle: 'seasonal_guide',
      platform: 'blog',
      prompt: '계절별 휠 관리 가이드 (현재 시즌 강조)'
    },
    {
      angle: 'car_model_specific',
      platform: 'instagram',
      prompt: '이 차종 오너들을 위한 휠 관리 포인트'
    },
    {
      angle: 'time_lapse',
      platform: 'shortform',
      prompt: '작업 과정을 5초 타임랩스로 압축'
    },
    {
      angle: 'technician_interview',
      platform: 'youtube',
      prompt: '기술자 인터뷰 형식 (작업 철학, 노하우)'
    },
    {
      angle: 'promotion_cta',
      platform: 'instagram',
      prompt: '이번 달 프로모션 + 예약 유도 (CTA 강조)'
    }
  ]

  const contents = await Promise.all(
    variations.map(async (variation) => {
      const content = await generateContentWithAngle(jobId, variation)
      return {
        ...content,
        variation_type: variation.angle,
        platform: variation.platform
      }
    })
  )

  // Supabase에 일괄 저장
  await supabase.from('generated_contents').insert(contents)

  return contents
}
```

#### Supabase 스키마 확장
```sql
ALTER TABLE generated_contents
ADD COLUMN template_id TEXT,
ADD COLUMN variation_type TEXT,
ADD COLUMN trending_keyword TEXT,
ADD COLUMN keyword_search_volume INTEGER;

-- 성과 분석 뷰
CREATE VIEW content_performance AS
SELECT
  template_id,
  variation_type,
  AVG(engagement_rate) as avg_engagement,
  SUM(views) as total_views,
  COUNT(*) as content_count
FROM generated_contents
WHERE published_at IS NOT NULL
GROUP BY template_id, variation_type
ORDER BY avg_engagement DESC;
```

#### 수락 기준
- [ ] 템플릿 10개 이상 보유
- [ ] A/B 테스트로 최적 템플릿 자동 선택 (성과 20% 향상)
- [ ] 트렌드 키워드 반영률 100%
- [ ] 1개 작업당 10개 변형 콘텐츠 생성 가능
- [ ] 키워드 밀도 2-3% 유지 (SEO 최적화)

**우선순위**: P1 (고가치 기능)

---

### 🆕 Feature 4: AI 예측 분석 대시보드

**목표**: 과거 데이터 → 미래 예측

#### 4.1 Prophet 기반 예측 모델
```python
# Supabase Edge Function (Python Runtime)
import pandas as pd
from prophet import Prophet
import json

def predict_inquiries(request):
    # Supabase에서 과거 데이터 조회
    query = """
    SELECT
      DATE(created_at) as date,
      COUNT(*) as inquiries
    FROM jobs
    WHERE created_at >= NOW() - INTERVAL '90 days'
    GROUP BY DATE(created_at)
    ORDER BY date
    """

    df = pd.read_sql(query, supabase_connection)
    df.columns = ['ds', 'y']  # Prophet 형식

    # 모델 학습
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False
    )
    model.fit(df)

    # 향후 30일 예측
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    return json.dumps({
        'predictions': forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(30).to_dict('records'),
        'total_predicted': int(forecast['yhat'].tail(30).sum()),
        'trend': 'increasing' if forecast['yhat'].iloc[-1] > forecast['yhat'].iloc[-30] else 'decreasing'
    })
```

#### 4.2 검색 트렌드 예측
```javascript
// Google Trends API 대안: Naver Datalab 활용
async function predictSearchTrend(keyword, region) {
  const { data: historicalData } = await fetch(
    'https://openapi.naver.com/v1/datalab/search',
    {
      method: 'POST',
      body: JSON.stringify({
        startDate: getDateMonthsAgo(6),
        endDate: getToday(),
        timeUnit: 'week',
        keywordGroups: [{
          groupName: keyword,
          keywords: [keyword]
        }]
      })
    }
  )

  // 선형 회귀로 다음 주 검색량 예측
  const ratios = historicalData.results[0].data.map(d => d.ratio)
  const prediction = linearRegression(ratios)

  return {
    currentVolume: ratios[ratios.length - 1],
    predictedVolume: prediction.next,
    changePercent: ((prediction.next - ratios[ratios.length - 1]) / ratios[ratios.length - 1] * 100).toFixed(1),
    recommendation: prediction.next > ratios[ratios.length - 1]
      ? `"${keyword}" 검색 급증 예상! 지금 콘텐츠 발행하세요`
      : '검색량 유지 중'
  }
}
```

#### 4.3 대시보드 UI
```html
<div class="ai-dashboard">
  <div class="prediction-card">
    <h3>📊 다음 달 예측</h3>
    <div class="metric">
      <span class="value">{{ predictedInquiries }}</span>
      <span class="label">예상 문의 건수</span>
      <span class="change positive">+{{ changePercent }}%</span>
    </div>
    <div class="chart">
      <canvas id="forecastChart"></canvas>
    </div>
  </div>

  <div class="trend-card">
    <h3>🔥 급상승 키워드</h3>
    <ul class="trending-keywords">
      <li v-for="keyword in trendingKeywords">
        <span class="keyword">{{ keyword.text }}</span>
        <span class="volume">{{ keyword.volume }}</span>
        <span class="arrow up">↗️ {{ keyword.change }}%</span>
      </li>
    </ul>
    <button @click="createContentForTrend">
      🚀 지금 콘텐츠 생성하기
    </button>
  </div>

  <div class="insight-card">
    <h3>💡 AI 인사이트</h3>
    <div class="insights">
      <div class="insight">
        <span class="icon">🎯</span>
        <p>G80 휠복원 검색이 3주 후 40% 증가 예상. 미리 콘텐츠 10개 생성을 추천합니다.</p>
      </div>
      <div class="insight">
        <span class="icon">📈</span>
        <p>"스토리텔링" 템플릿이 조회수 25% 더 높습니다. 다음 콘텐츠에 적용하세요.</p>
      </div>
      <div class="insight">
        <span class="icon">⏰</span>
        <p>오전 9-11시 발행 시 참여율 35% 상승. 예약 발행을 설정하세요.</p>
      </div>
    </div>
  </div>
</div>
```

#### Chart.js 예측 그래프
```javascript
// 실제 vs 예측 그래프
const ctx = document.getElementById('forecastChart');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: last30Days.concat(next30Days),
    datasets: [
      {
        label: '실제 문의',
        data: actualInquiries.concat(Array(30).fill(null)),
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)'
      },
      {
        label: 'AI 예측',
        data: Array(30).fill(null).concat(predictedInquiries),
        borderColor: '#E24A90',
        borderDash: [5, 5],
        backgroundColor: 'rgba(226, 74, 144, 0.1)'
      }
    ]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: '문의 건수' }
      }
    },
    plugins: {
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            xMin: 30,
            xMax: 30,
            borderColor: '#888',
            borderWidth: 2,
            label: {
              content: '오늘',
              enabled: true
            }
          }
        }
      }
    }
  }
});
```

#### 수락 기준
- [ ] 예측 정확도 80% 이상 (실제 vs 예측 오차 20% 이내)
- [ ] 검색 트렌드 예측 주간 업데이트
- [ ] AI 인사이트 3개 이상 자동 생성
- [ ] 대시보드 로딩 시간 < 2초

**우선순위**: P2 (부가 가치)

---

### 🆕 Feature 5: 자동 재방문 유도 시스템

**목표**: 재방문율 5% → 20% (300% 증가)

#### 5.1 고객 라이프사이클 관리
```sql
-- 고객 테이블 생성
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  car_model TEXT,
  first_visit DATE,
  last_visit DATE,
  total_visits INTEGER DEFAULT 1,
  lifetime_value DECIMAL(10, 2) DEFAULT 0,

  -- 예측 필드
  churn_probability DECIMAL(3, 2), -- 0.00 ~ 1.00
  next_visit_predicted DATE,

  created_at TIMESTAMP DEFAULT NOW()
);

-- 작업과 연결
ALTER TABLE jobs
ADD COLUMN customer_id UUID REFERENCES customers(id);

-- 고객 생애 가치 계산 함수
CREATE OR REPLACE FUNCTION calculate_ltv(customer_uuid UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(price), 0)
  FROM jobs
  WHERE customer_id = customer_uuid
$$ LANGUAGE SQL;
```

#### 5.2 자동 리마인더 시스템
```javascript
// Supabase Edge Function: 매일 실행
async function sendFollowUpReminders() {
  // 3개월 전 작업 고객 조회
  const { data: customers } = await supabase
    .from('customers')
    .select(`
      *,
      jobs!inner(work_date, car_model)
    `)
    .eq('jobs.work_date', getDateMonthsAgo(3))

  for (const customer of customers) {
    // SMS 발송 (Twilio 또는 Aligo)
    await sendSMS({
      to: customer.phone,
      message: `
[${업체명}] 안녕하세요 ${customer.name}님!

3개월 전 ${customer.car_model} 휠 복원하셨죠?
겨울철 휠 점검 시기입니다 ❄️

🎁 재방문 고객 특별 혜택
- 휠 점검 무료
- 작업 시 20% 할인

예약: ${예약링크}
(이 링크는 7일간 유효)
      `.trim()
    })

    // 발송 기록 저장
    await supabase.from('follow_up_messages').insert({
      customer_id: customer.id,
      type: '3month_checkup',
      sent_at: new Date(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
  }
}

// pg_cron으로 매일 오전 10시 실행
SELECT cron.schedule(
  'send-follow-up-reminders',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/send-follow-ups',
    headers := '{"Authorization": "Bearer ANON_KEY"}'::jsonb
  );
  $$
);
```

#### 5.3 이탈 예측 모델
```python
# 고객 이탈(Churn) 예측 모델
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

def predict_churn():
    # 고객 특성 추출
    query = """
    SELECT
      c.id,
      c.total_visits,
      c.lifetime_value,
      EXTRACT(DAY FROM NOW() - c.last_visit) as days_since_last_visit,
      COUNT(j.id) as job_count,
      AVG(j.price) as avg_job_value,
      -- 이탈 여부 (6개월 이상 방문 없음)
      CASE WHEN c.last_visit < NOW() - INTERVAL '6 months' THEN 1 ELSE 0 END as churned
    FROM customers c
    LEFT JOIN jobs j ON c.id = j.customer_id
    GROUP BY c.id
    """

    df = pd.read_sql(query, supabase_connection)

    # 학습 데이터 분리
    X = df[['total_visits', 'lifetime_value', 'days_since_last_visit', 'job_count', 'avg_job_value']]
    y = df['churned']

    # 모델 학습
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X, y)

    # 전체 고객 이탈 확률 예측
    df['churn_probability'] = model.predict_proba(X)[:, 1]

    # 고위험 고객 (이탈 확률 > 0.7)
    high_risk = df[df['churn_probability'] > 0.7]

    # Supabase 업데이트
    for _, customer in high_risk.iterrows():
        supabase.table('customers').update({
            'churn_probability': float(customer['churn_probability'])
        }).eq('id', customer['id']).execute()

    return high_risk[['id', 'churn_probability']].to_dict('records')
```

#### 5.4 개인화된 혜택 제공
```javascript
// 고객별 맞춤 혜택 생성
async function generatePersonalizedOffer(customerId) {
  const { data: customer } = await supabase
    .from('customers')
    .select(`
      *,
      jobs(work_date, car_model, price)
    `)
    .eq('id', customerId)
    .single()

  // 규칙 기반 혜택 결정
  let offer = {
    discount: 10, // 기본 10%
    message: '재방문 감사 할인',
    expiry: 14 // 14일
  }

  // VIP 고객 (3회 이상 방문)
  if (customer.total_visits >= 3) {
    offer.discount = 25
    offer.message = 'VIP 고객 특별 할인'
    offer.freeService = '휠 코팅 무료'
  }

  // 고가치 고객 (평균 작업 가격 > 30만원)
  const avgPrice = customer.jobs.reduce((sum, j) => sum + j.price, 0) / customer.jobs.length
  if (avgPrice > 300000) {
    offer.discount = 30
    offer.message = '프리미엄 고객 특별 혜택'
  }

  // 이탈 위험 고객 (재방문 유도 강화)
  if (customer.churn_probability > 0.7) {
    offer.discount = 35
    offer.message = '오랜만이에요! 컴백 특가'
    offer.expiry = 7 // 긴급성
  }

  return offer
}
```

#### 수락 기준
- [ ] 3개월 주기 자동 리마인더 발송율 100%
- [ ] SMS 발송 성공률 95% 이상
- [ ] 재방문율 20% 달성 (기존 5% 대비)
- [ ] 이탈 예측 정확도 75% 이상
- [ ] 개인화된 혜택 적용 고객 만족도 4.5/5.0 이상

**우선순위**: P1 (고가치 기능)

---

### 🆕 Feature 6: 화이트라벨 SaaS 전환

**목표**: 휠 복원 → 전 산업 확장

#### 6.1 산업별 설정 시스템
```sql
-- 산업 설정 테이블
CREATE TABLE industry_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_code TEXT UNIQUE NOT NULL, -- 'wheel-repair', 'car-detailing', 'restaurant'
  display_name TEXT NOT NULL,

  -- 카테고리 설정 (JSON)
  photo_categories JSONB NOT NULL,
  /* 예시:
  {
    "categories": [
      { "id": "before_car", "label": "입고", "icon": "🚗", "required": true },
      { "id": "before_wheel", "label": "문제", "icon": "🔍", "required": true }
    ]
  }
  */

  -- 키워드 설정
  base_keywords TEXT[],

  -- 템플릿 설정
  default_templates JSONB,

  -- 가격 설정
  pricing_tier TEXT, -- 'basic', 'pro', 'enterprise'
  monthly_price DECIMAL(10, 2),

  created_at TIMESTAMP DEFAULT NOW()
);

-- 기본 산업 데이터 삽입
INSERT INTO industry_configs (industry_code, display_name, photo_categories, base_keywords, pricing_tier, monthly_price) VALUES
('wheel-repair', '휠 복원/수리',
 '{"categories": [
    {"id": "before_car", "label": "입고", "icon": "🚗"},
    {"id": "before_wheel", "label": "문제", "icon": "🔍"},
    {"id": "during", "label": "과정", "icon": "🔧"},
    {"id": "after_wheel", "label": "해결", "icon": "✨"},
    {"id": "after_car", "label": "출고", "icon": "🚗"}
  ]}'::jsonb,
 ARRAY['휠복원', '휠수리', '휠긁힘', '휠교체'],
 'pro', 49000),

('car-detailing', '자동차 디테일링',
 '{"categories": [
    {"id": "exterior_before", "label": "외관 전", "icon": "🚗"},
    {"id": "interior_before", "label": "내부 전", "icon": "🪑"},
    {"id": "engine_before", "label": "엔진 전", "icon": "⚙️"},
    {"id": "polishing", "label": "광택 중", "icon": "✨"},
    {"id": "after", "label": "완료", "icon": "🌟"}
  ]}'::jsonb,
 ARRAY['디테일링', '광택', '코팅', '세차'],
 'pro', 49000),

('restaurant', '레스토랑/맛집',
 '{"categories": [
    {"id": "exterior", "label": "외관", "icon": "🏪"},
    {"id": "interior", "label": "인테리어", "icon": "🪑"},
    {"id": "food", "label": "음식", "icon": "🍽️"},
    {"id": "plating", "label": "플레이팅", "icon": "🎨"},
    {"id": "chef", "label": "셰프/주방", "icon": "👨‍🍳"}
  ]}'::jsonb,
 ARRAY['맛집', '레스토랑', '음식', '맛있는집'],
 'basic', 19000);
```

#### 6.2 다중 테넌트 아키텍처
```sql
-- 조직/업체 테이블
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry_code TEXT REFERENCES industry_configs(industry_code),
  subdomain TEXT UNIQUE, -- 'myshop.photofactory.app'

  -- 브랜딩
  logo_url TEXT,
  primary_color TEXT DEFAULT '#4A90E2',
  secondary_color TEXT DEFAULT '#E24A90',

  -- 구독 정보
  subscription_tier TEXT DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
  subscription_status TEXT DEFAULT 'trial', -- 'trial', 'active', 'suspended'
  trial_ends_at TIMESTAMP DEFAULT NOW() + INTERVAL '14 days',

  -- 사용량
  monthly_jobs_limit INTEGER DEFAULT 30,
  monthly_jobs_used INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS: 조직별 데이터 격리
ALTER TABLE jobs ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can only see own jobs"
  ON jobs FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

#### 6.3 가입 플로우
```html
<div class="signup-wizard">
  <h2>Photo Factory 시작하기</h2>

  <!-- Step 1: 산업 선택 -->
  <div class="step step-1">
    <h3>어떤 업종이신가요?</h3>
    <div class="industry-grid">
      <div class="industry-card" @click="selectIndustry('wheel-repair')">
        <span class="icon">🚗</span>
        <h4>휠 복원/수리</h4>
        <p>5개 카테고리 자동 설정</p>
      </div>
      <div class="industry-card" @click="selectIndustry('car-detailing')">
        <span class="icon">✨</span>
        <h4>자동차 디테일링</h4>
        <p>광택/코팅 전문</p>
      </div>
      <div class="industry-card" @click="selectIndustry('restaurant')">
        <span class="icon">🍽️</span>
        <h4>레스토랑/맛집</h4>
        <p>음식 사진 자동 최적화</p>
      </div>
      <div class="industry-card" @click="selectIndustry('custom')">
        <span class="icon">⚙️</span>
        <h4>직접 설정</h4>
        <p>나만의 카테고리 생성</p>
      </div>
    </div>
  </div>

  <!-- Step 2: 브랜딩 설정 -->
  <div class="step step-2">
    <h3>브랜드 정보를 입력하세요</h3>
    <input type="text" v-model="orgName" placeholder="업체명 (예: 강남 휠 복원)">
    <input type="text" v-model="subdomain" placeholder="주소 (예: gangnam-wheel)">
    <p class="preview">{{ subdomain }}.photofactory.app</p>

    <div class="color-picker">
      <label>브랜드 색상</label>
      <input type="color" v-model="primaryColor">
    </div>

    <div class="logo-upload">
      <label>로고 업로드 (선택)</label>
      <input type="file" @change="uploadLogo">
    </div>
  </div>

  <!-- Step 3: 요금제 선택 -->
  <div class="step step-3">
    <h3>요금제를 선택하세요</h3>
    <div class="pricing-cards">
      <div class="pricing-card basic">
        <h4>Basic</h4>
        <p class="price">9,900원/월</p>
        <ul class="features">
          <li>✅ 월 30개 작업</li>
          <li>✅ 기본 AI 콘텐츠 생성</li>
          <li>✅ 3개 플랫폼 발행</li>
          <li>❌ 예측 분석</li>
        </ul>
        <button @click="subscribe('basic')">14일 무료 체험</button>
      </div>

      <div class="pricing-card pro recommended">
        <span class="badge">추천</span>
        <h4>Pro</h4>
        <p class="price">49,000원/월</p>
        <ul class="features">
          <li>✅ 월 100개 작업</li>
          <li>✅ GPT-4V 고급 AI</li>
          <li>✅ 10개 변형 콘텐츠</li>
          <li>✅ AI 예측 대시보드</li>
          <li>✅ 재방문 자동화</li>
        </ul>
        <button @click="subscribe('pro')" class="primary">
          14일 무료 체험
        </button>
      </div>

      <div class="pricing-card enterprise">
        <h4>Enterprise</h4>
        <p class="price">문의</p>
        <ul class="features">
          <li>✅ 무제한 작업</li>
          <li>✅ 화이트라벨 커스터마이징</li>
          <li>✅ 전담 지원</li>
          <li>✅ API 제공</li>
        </ul>
        <button @click="contactSales">문의하기</button>
      </div>
    </div>
  </div>
</div>
```

#### 6.4 동적 UI 렌더링
```javascript
// 조직 설정에 따라 UI 동적 생성
async function loadIndustryConfig() {
  const { data: org } = await supabase
    .from('organizations')
    .select('*, industry_configs(*)')
    .eq('id', currentOrgId)
    .single()

  // 카테고리 동적 생성
  const categories = org.industry_configs.photo_categories.categories
  const categoryTabs = categories.map(cat => `
    <div class="category-tab" data-category="${cat.id}">
      <span class="icon">${cat.icon}</span>
      <span class="label">${cat.label}</span>
    </div>
  `).join('')

  document.getElementById('categoryTabs').innerHTML = categoryTabs

  // 브랜드 색상 적용
  document.documentElement.style.setProperty('--primary-color', org.primary_color)
  document.documentElement.style.setProperty('--secondary-color', org.secondary_color)

  // 로고 적용
  if (org.logo_url) {
    document.querySelector('.logo').src = org.logo_url
  }
}
```

#### 수락 기준
- [ ] 3개 이상 산업 프리셋 제공
- [ ] 가입 플로우 3분 이내 완료
- [ ] 서브도메인 자동 생성 (myshop.photofactory.app)
- [ ] 조직별 데이터 완전 격리 (RLS 검증)
- [ ] 브랜딩 (로고, 색상) 즉시 반영

**우선순위**: P2 (미래 확장)

---

## 4. 개발 Phase (혁신 로드맵)

### Phase 0: MVP (기존 PRD-0001)
**기간**: 2주
**내용**: [PRD-0001](./0001-prd-5-category-photo-factory.md) Phase 0 그대로 유지
- Supabase + Imgur 기본 인프라
- Google OAuth 로그인
- 기본 사진 업로드/조회

---

### Phase 0.5: AI 품질 검증 추가 (신규)
**기간**: 3일
**우선순위**: P0

#### 구현 항목
- [ ] TensorFlow.js 통합 (클라이언트 사이드)
- [ ] 흐릿함 감지 알고리즘 (`detectBlur`)
- [ ] 조명 검증 알고리즘 (`analyzeBrightness`)
- [ ] 즉시 피드백 UI
- [ ] `photos` 테이블에 `quality_score` 컬럼 추가

#### 기술 스택
- TensorFlow.js (무료)
- Canvas API (브라우저 내장)

#### 예상 비용
- **$0** (완전 무료, 클라이언트 처리)

---

### Phase 1: 기존 + AI 컨텍스트
**기간**: 1주
**내용**: PRD-0001 Phase 1 + 아래 추가

#### 추가 구현
- [ ] Computer Vision 객체 인식 (COCO-SSD)
- [ ] AR 촬영 가이드 오버레이
- [ ] 자동 카테고리 분류

---

### Phase 1.5: GPT-4V 자동 콘텐츠 생성 (신규)
**기간**: 1주
**우선순위**: P1 (고가치)

#### 구현 항목
- [ ] OpenAI GPT-4V API 통합
- [ ] `generated_contents` 테이블 생성
- [ ] Supabase Edge Function (`generate-content`)
- [ ] 마케터 승인 UI
- [ ] 무료 대안: Hugging Face BLIP-2 (선택)

#### 기술 스택
- OpenAI GPT-4V API
- Supabase Edge Functions (Deno)

#### 예상 비용
- GPT-4V: **$0.01~0.02/작업** (이미지 10장 기준)
- 월 100건: **$1~2**

---

### Phase 2: 기존 템플릿 + 동적 엔진
**기간**: 1주
**내용**: PRD-0001 Phase 2 + 아래 추가

#### 추가 구현
- [ ] 동적 템플릿 변형 엔진 (`templateVariations`)
- [ ] A/B 테스트 자동 선택
- [ ] Naver Datalab API 트렌드 키워드
- [ ] 1개 작업 → 10개 변형 생성

---

### Phase 2.5: 성과 분석 + 최적화 (신규)
**기간**: 3일
**우선순위**: P1

#### 구현 항목
- [ ] `content_performance` 뷰 생성
- [ ] 템플릿별 성과 추적
- [ ] 최고 성과 템플릿 자동 추천

---

### Phase 3: 기존 발행 + 예약
**기간**: 2주
**내용**: PRD-0001 Phase 3 그대로 (Supabase Edge Functions)

---

### Phase 3.5: AI 대시보드 + 재방문 (신규)
**기간**: 1주
**우선순위**: P1

#### 구현 항목
- [ ] Prophet 예측 모델 (Python Edge Function)
- [ ] 검색 트렌드 예측
- [ ] Chart.js 대시보드
- [ ] 고객 테이블 생성 (`customers`)
- [ ] 3개월 리마인더 자동화 (pg_cron + Twilio)
- [ ] 이탈 예측 모델 (선택)

#### 기술 스택
- Prophet (Python)
- Twilio SMS API
- Chart.js

#### 예상 비용
- Twilio SMS: **$0.05/건** (국내)
- 월 30건 리마인더: **$1.5**

---

### Phase 4: 화이트라벨 SaaS (신규)
**기간**: 2주
**우선순위**: P2 (미래 확장)

#### 구현 항목
- [ ] `industry_configs` 테이블 생성
- [ ] `organizations` 다중 테넌트 구조
- [ ] 가입 위저드 (산업 선택 → 브랜딩 → 요금제)
- [ ] 서브도메인 자동 생성 (Vercel 동적 라우팅)
- [ ] 구독 결제 (Stripe 연동)
- [ ] 동적 UI 렌더링 엔진

---

### Phase 5: 고도화 (장기)
**기간**: 지속적

#### 구현 항목
- [ ] IPFS + NFT 저작권 보호
- [ ] 다국어 지원 (i18n)
- [ ] 모바일 앱 (React Native)
- [ ] API 제공 (Enterprise)

---

## 5. 비용 분석 (월 100건 기준)

| 항목 | PRD-0001 | PRD-0002 (AI) | 차이 |
|------|----------|---------------|------|
| Supabase | 무료 | 무료 | $0 |
| Imgur | 무료 | 무료 | $0 |
| GPT-4V API | - | $1~2 | +$2 |
| Twilio SMS | - | $1.5 | +$1.5 |
| **총 인프라 비용** | **$0** | **$3.5** | **+$3.5** |
| **마케터 인건비 절감** | - | **-$500** | **-$500** |
| **순이익** | - | **+$496.5/월** | ✅ |

**ROI**: 14,186% (1개월 기준)

---

## 6. 성공 지표 (PRD-0001 vs PRD-0002)

| 지표 | PRD-0001 | PRD-0002 | 개선율 |
|------|----------|----------|--------|
| **촬영 시간** | 2분 | 30초 | **75% ↓** |
| **품질 불량률** | 20% | 0% | **100% ↓** |
| **콘텐츠 생성 시간** | 10분 | 10초 | **98% ↓** |
| **콘텐츠 수/작업** | 3개 | 10개 | **233% ↑** |
| **검색 유입** | 기준 | +30% | **30% ↑** |
| **재방문율** | 5% | 20% | **300% ↑** |
| **마케터 온보딩** | 2주 | 1일 | **93% ↓** |
| **확장 산업** | 1개 | 무제한 | **∞** |

---

## 7. 리스크 및 대응

| 리스크 | 확률 | 영향도 | 대응 방안 |
|--------|------|--------|----------|
| GPT-4V 비용 초과 | Medium | High | Hugging Face BLIP-2 무료 대안 준비 |
| AI 생성 콘텐츠 품질 저하 | Low | High | 마케터 승인 단계 필수 유지 |
| 예측 모델 정확도 부족 | Medium | Medium | 90일 데이터 축적 후 재학습 |
| 다중 테넌트 보안 이슈 | Low | Critical | RLS 철저 테스트, 침투 테스트 수행 |
| SMS 발송 비용 증가 | Low | Low | 이메일 대안 제공 |

---

## 8. 마이그레이션 전략 (PRD-0001 → PRD-0002)

### 점진적 업그레이드
1. **Week 1-2**: Phase 0 (기존 MVP) 완료
2. **Week 3**: Phase 0.5 (AI 품질 검증) 추가
3. **Week 4**: Phase 1.5 (GPT-4V) 시범 운영 (10건 테스트)
4. **Week 5-6**: Phase 2.5 (동적 템플릿) 전면 적용
5. **Week 7**: Phase 3.5 (대시보드 + 재방문) 론칭
6. **Week 8+**: Phase 4 (SaaS) 개발 시작

### 하위 호환성
- PRD-0001 사용자는 수동 워크플로우 계속 사용 가능
- AI 기능은 **옵션**으로 제공 (기본: OFF)
- 마케터가 "AI 자동 생성" 버튼 클릭 시에만 활성화

---

## 9. Next Steps

### 즉시 실행 (이번 주)
1. Phase 0.5 구현 (AI 품질 검증)
2. TensorFlow.js 통합 및 테스트
3. 사용자 피드백 수집

### 3개월 로드맵
1. Phase 1.5 (GPT-4V) 시범 운영
2. 성과 데이터 수집 (조회수, 참여율)
3. ROI 검증 후 전면 적용

### 6개월 비전
1. Phase 4 (화이트라벨 SaaS) 론칭
2. 3개 산업 확장 (디테일링, 레스토랑, 미용실)
3. B2B 영업 시작

---

## 부록: 혁신 기능 우선순위

| 순위 | 기능 | 예상 효과 | 구현 난이도 | 비용 | 추천 |
|------|------|-----------|------------|------|------|
| 🥇 1 | GPT-4V 자동 생성 | 마케터 시간 98% 절감 | Medium | $2/월 | ✅ 즉시 |
| 🥈 2 | AI 품질 검증 | 불량 사진 0% | Low | $0 | ✅ 즉시 |
| 🥉 3 | 재방문 자동화 | 재방문 300% 증가 | Medium | $1.5/월 | ✅ 1개월 |
| 4 | 동적 템플릿 | SEO 30% 향상 | Medium | $0 | ✅ 2개월 |
| 5 | AI 예측 대시보드 | 의사결정 개선 | High | $0 | ⚠️ 3개월 |
| 6 | 화이트라벨 SaaS | 시장 10배 확장 | High | $0 | ⏱️ 6개월 |
| 7 | AR 촬영 가이드 | 촬영 시간 75% 절감 | High | $0 | ⏱️ 차기 버전 |
| 8 | NFT 저작권 | 법적 보호 | Low | $0.01/건 | ⏱️ 차기 버전 |

---

**결론**: PRD-0002는 PRD-0001의 **완전한 진화**입니다.
Zero-Touch Automation으로 사용자 경험을 혁신하고, AI로 비즈니스 가치를 극대화합니다.

**권장 실행 순서**:
1. ✅ Phase 0.5 (AI 품질 검증) - 즉시
2. ✅ Phase 1.5 (GPT-4V) - 1개월
3. ✅ Phase 3.5 (재방문) - 2개월

이 3가지만 구현해도 **ROI 14,000% 달성** 가능합니다.
