// Photo Factory - Authentication Module
// Supabase Auth integration

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Supabase 클라이언트 초기화
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Google OAuth 로그인
 * @param {string} redirectTo - 로그인 후 리다이렉트할 URL
 */
export async function signInWithGoogle(redirectTo = '/public/upload.html') {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) throw error;

    console.log('✅ Google 로그인 시작:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ 로그인 오류:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 로그아웃
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    console.log('✅ 로그아웃 성공');
    window.location.href = '/public/index.html';
    return { success: true };
  } catch (error) {
    console.error('❌ 로그아웃 오류:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 현재 로그인한 사용자 정보 가져오기
 * @returns {Promise<User|null>}
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;

    if (user) {
      console.log('✅ 현재 사용자:', user.email);
    }

    return user;
  } catch (error) {
    console.error('❌ 사용자 정보 조회 오류:', error);
    return null;
  }
}

/**
 * 로그인 상태 확인 및 리다이렉트
 * @param {string} redirectIfNotAuth - 미로그인 시 리다이렉트할 URL
 */
export async function requireAuth(redirectIfNotAuth = '/index.html') {
  const user = await getCurrentUser();

  if (!user) {
    console.warn('⚠️ 로그인 필요, 리다이렉트:', redirectIfNotAuth);
    window.location.href = redirectIfNotAuth;
    return null;
  }

  return user;
}

/**
 * 로그인 상태 변경 감지
 * @param {Function} callback - 상태 변경 시 실행할 콜백
 */
export function onAuthStateChange(callback) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth state changed:', event, session?.user?.email);
    callback(event, session);
  });
}

/**
 * 사용자 프로필 표시 UI 헬퍼
 * @param {string} elementId - 프로필을 표시할 엘리먼트 ID
 */
export async function displayUserProfile(elementId = 'userProfile') {
  const user = await getCurrentUser();
  const element = document.getElementById(elementId);

  if (!element) return;

  if (user) {
    element.innerHTML = `
      <div class="user-profile">
        <img src="${user.user_metadata?.avatar_url || '/assets/default-avatar.png'}"
             alt="Profile"
             class="rounded-circle me-2"
             width="32" height="32">
        <span class="me-3">${user.email}</span>
        <button onclick="handleSignOut()" class="btn btn-sm btn-outline-secondary">
          로그아웃
        </button>
      </div>
    `;
  } else {
    element.innerHTML = `
      <button onclick="handleSignIn()" class="btn btn-primary">
        로그인
      </button>
    `;
  }
}

// 전역 헬퍼 함수 (HTML에서 직접 호출 가능)
window.handleSignIn = () => signInWithGoogle();
window.handleSignOut = () => signOut();

// 초기화 로그
console.log('🔐 Auth module loaded');
