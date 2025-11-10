// Photo Factory - Configuration
// API Keys and Environment Variables

// Supabase Configuration
export const SUPABASE_URL = 'https://nuecesgtciziaotdmfhp.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZWNlc2d0Y2l6aWFvdGRtZmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0ODM5MjEsImV4cCI6MjA3ODA1OTkyMX0.1BK_8McSgrE7T0vrjBL2zT_uWFmfkq-z7w05RqxzkDQ';

// Cloudinary API Configuration
export const CLOUDINARY_CLOUD_NAME = 'dzjp22inj';
export const CLOUDINARY_UPLOAD_PRESET = 'photo-factory'; // unsigned preset

// App Configuration
export const APP_CONFIG = {
  appName: '5-Category 포토 팩토리',
  version: '1.0.0',
  categories: [
    { id: 'before_car', label: '입고', icon: '🚗', description: '작업 전 차량 전체' },
    { id: 'before_wheel', label: '문제', icon: '🔍', description: '손상된 휠 클로즈업' },
    { id: 'during', label: '과정', icon: '🔧', description: '작업 중 모습' },
    { id: 'after_wheel', label: '해결', icon: '✨', description: '복원 완료 휠' },
    { id: 'after_car', label: '출고', icon: '🚗', description: '작업 후 차량 전체' }
  ],
  photosPerCategory: 3, // 카테고리당 최대 사진 수
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

// Helper function to validate config
export function validateConfig() {
  const errors = [];

  if (!SUPABASE_URL || SUPABASE_URL.includes('your-project')) {
    errors.push('Supabase URL이 설정되지 않았습니다. config.js를 확인하세요.');
  }

  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('your_anon')) {
    errors.push('Supabase ANON KEY가 설정되지 않았습니다.');
  }

  if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME.includes('your_cloud')) {
    errors.push('Cloudinary Cloud Name이 설정되지 않았습니다.');
  }

  if (!CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_UPLOAD_PRESET.includes('your_upload')) {
    errors.push('Cloudinary Upload Preset이 설정되지 않았습니다.');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration Errors:', errors);
    alert('설정 오류:\n\n' + errors.join('\n'));
    return false;
  }

  console.log('✅ Configuration validated successfully');
  return true;
}
