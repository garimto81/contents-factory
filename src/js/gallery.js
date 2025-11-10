// Photo Factory - Gallery Module
// Supabase data fetching and display

import { supabase, getCurrentUser } from './auth.js';
import { APP_CONFIG } from './config.js';

/**
 * 전체 작업 목록 조회
 * @param {Object} filters - 필터 옵션
 * @returns {Promise<Array>}
 */
export async function fetchJobs(filters = {}) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        photos (
          id,
          category,
          cloudinary_url,
          thumbnail_url,
          sequence
        )
      `)
      .eq('technician_id', user.id)
      .order('created_at', { ascending: false });

    // 필터 적용
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.startDate) {
      query = query.gte('work_date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('work_date', filters.endDate);
    }

    if (filters.carModel) {
      query = query.ilike('car_model', `%${filters.carModel}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    console.log(`✅ ${data.length}개 작업 조회 완료`);

    return data;
  } catch (error) {
    console.error('❌ 작업 목록 조회 오류:', error);
    throw error;
  }
}

/**
 * 특정 작업 상세 조회
 * @param {string} jobId - 작업 ID
 */
export async function fetchJobById(jobId) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        photos (
          id,
          category,
          cloudinary_url,
          thumbnail_url,
          file_size,
          uploaded_at,
          sequence
        )
      `)
      .eq('id', jobId)
      .single();

    if (error) throw error;

    console.log('✅ 작업 상세 조회:', data.job_number);

    return data;
  } catch (error) {
    console.error('❌ 작업 상세 조회 오류:', error);
    throw error;
  }
}

// Alias for backward compatibility
export const fetchJobDetails = fetchJobById;

/**
 * 작업 목록 UI 렌더링
 * @param {Array} jobs - 작업 목록
 * @param {string} containerId - 렌더링할 컨테이너 ID
 */
export function renderJobList(jobs, containerId = 'jobList') {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container #${containerId} not found`);
    return;
  }

  if (jobs.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <p class="text-muted">아직 작업이 없습니다.</p>
        <a href="/upload.html" class="btn btn-primary">
          첫 작업 등록하기
        </a>
      </div>
    `;
    return;
  }

  const jobCards = jobs.map(job => {
    // 대표 썸네일 선택 (before_car 첫 번째 또는 첫 번째 사진)
    const thumbnail = job.photos.find(p => p.category === 'before_car')?.thumbnail_url
                   || job.photos[0]?.thumbnail_url
                   || '/assets/no-image.png';

    // 사진 개수
    const photoCount = job.photos.length;

    // 카테고리별 사진 개수
    const categoryCounts = {};
    APP_CONFIG.categories.forEach(cat => {
      categoryCounts[cat.id] = job.photos.filter(p => p.category === cat.id).length;
    });

    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 job-card" onclick="viewJobDetails('${job.id}')">
          <img src="${thumbnail}" class="card-img-top" alt="${job.job_number}">
          <div class="card-body">
            <h5 class="card-title">${job.job_number}</h5>
            <p class="card-text">
              <strong>${job.car_model}</strong>
              ${job.location ? `<br><small class="text-muted">📍 ${job.location}</small>` : ''}
            </p>
            <div class="category-badges mb-2">
              ${APP_CONFIG.categories.map(cat => `
                <span class="badge ${categoryCounts[cat.id] > 0 ? 'bg-success' : 'bg-secondary'}">
                  ${cat.icon} ${cat.label} (${categoryCounts[cat.id]})
                </span>
              `).join('')}
            </div>
            <small class="text-muted">
              📅 ${new Date(job.work_date).toLocaleDateString('ko-KR')}
              • 📸 ${photoCount}장
            </small>
          </div>
          <div class="card-footer">
            <span class="badge bg-${getStatusColor(job.status)}">${getStatusLabel(job.status)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `<div class="row">${jobCards}</div>`;
}

/**
 * 작업 상세 UI 렌더링
 * @param {Object} job - 작업 데이터
 * @param {string} containerId - 렌더링할 컨테이너 ID
 */
export function renderJobDetails(job, containerId = 'jobDetails') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // 카테고리별로 사진 그룹화
  const photosByCategory = {};
  APP_CONFIG.categories.forEach(cat => {
    photosByCategory[cat.id] = job.photos
      .filter(p => p.category === cat.id)
      .sort((a, b) => a.sequence - b.sequence);
  });

  const categoryTabs = APP_CONFIG.categories.map((cat, index) => {
    const photos = photosByCategory[cat.id] || [];
    return {
      nav: `
        <li class="nav-item">
          <button class="nav-link ${index === 0 ? 'active' : ''}"
                  id="${cat.id}-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#${cat.id}"
                  type="button">
            ${cat.icon} ${cat.label}
            <span class="badge bg-secondary ms-2">${photos.length}</span>
          </button>
        </li>
      `,
      content: `
        <div class="tab-pane fade ${index === 0 ? 'show active' : ''}"
             id="${cat.id}">
          <h5>${cat.description}</h5>
          <div class="row g-3">
            ${photos.length > 0 ? photos.map((photo, idx) => `
              <div class="col-md-4">
                <a href="${photo.cloudinary_url}" data-lightbox="${cat.id}" data-title="${cat.label} ${idx + 1}">
                  <img src="${photo.thumbnail_url}"
                       class="img-thumbnail"
                       alt="${cat.label} ${idx + 1}">
                </a>
                <small class="text-muted d-block mt-1">
                  ${(photo.file_size / 1024).toFixed(1)} KB
                </small>
              </div>
            `).join('') : `
              <div class="col-12">
                <p class="text-muted">이 카테고리에 사진이 없습니다.</p>
              </div>
            `}
          </div>
        </div>
      `
    };
  });

  container.innerHTML = `
    <div class="job-details">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>${job.job_number}</h2>
          <p class="text-muted mb-0">
            ${job.car_model} • ${new Date(job.work_date).toLocaleDateString('ko-KR')}
            ${job.location ? `• 📍 ${job.location}` : ''}
          </p>
        </div>
        <div>
          <span class="badge bg-${getStatusColor(job.status)} fs-6">
            ${getStatusLabel(job.status)}
          </span>
        </div>
      </div>

      <ul class="nav nav-tabs mb-3">
        ${categoryTabs.map(t => t.nav).join('')}
      </ul>

      <div class="tab-content">
        ${categoryTabs.map(t => t.content).join('')}
      </div>

      <div class="mt-4">
        <button onclick="downloadAllPhotos('${job.id}')" class="btn btn-primary">
          📥 전체 사진 다운로드
        </button>
        <button onclick="window.history.back()" class="btn btn-secondary">
          ← 목록으로
        </button>
      </div>
    </div>
  `;
}

/**
 * 상태 색상 반환
 */
function getStatusColor(status) {
  const colors = {
    'uploaded': 'primary',
    'processing': 'warning',
    'published': 'success'
  };
  return colors[status] || 'secondary';
}

/**
 * 상태 라벨 반환
 */
function getStatusLabel(status) {
  const labels = {
    'uploaded': '업로드 완료',
    'processing': '처리 중',
    'published': '발행 완료'
  };
  return labels[status] || status;
}

/**
 * 전체 사진 다운로드 (ZIP)
 */
window.downloadAllPhotos = async function(jobId) {
  // 간단 구현: 브라우저의 다운로드 기능 사용
  // 프로덕션에서는 JSZip 라이브러리 사용 권장
  alert('전체 사진 다운로드 기능은 추후 구현 예정입니다.\n현재는 개별 사진을 클릭하여 다운로드하세요.');
};

/**
 * 작업 상세 페이지로 이동
 */
window.viewJobDetails = function(jobId) {
  window.location.href = `/public/job-detail.html?id=${jobId}`;
};

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  if (jobId) {
    // 상세 페이지
    try {
      const job = await fetchJobDetails(jobId);
      renderJobDetails(job);
    } catch (error) {
      alert('작업 정보를 불러오는데 실패했습니다.');
      window.history.back();
    }
  } else if (document.getElementById('jobList')) {
    // 목록 페이지
    try {
      const jobs = await fetchJobs();
      renderJobList(jobs);
    } catch (error) {
      console.error(error);
      document.getElementById('jobList').innerHTML = `
        <div class="alert alert-danger">
          작업 목록을 불러오는데 실패했습니다.
        </div>
      `;
    }
  }
});

console.log('🖼️ Gallery module loaded');
