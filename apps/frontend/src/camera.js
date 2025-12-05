/**
 * Camera API wrapper for mobile photo capture
 */

export async function capturePhoto() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        resolve(file);
      } else {
        reject(new Error('No file selected'));
      }
    };

    input.onerror = () => {
      reject(new Error('Camera access failed'));
    };

    input.click();
  });
}
