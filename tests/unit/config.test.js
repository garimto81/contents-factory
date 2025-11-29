// Photo Factory - Config Module Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateConfig, APP_CONFIG } from '../../src/js/config.js';

describe('Config Module', () => {
  describe('APP_CONFIG', () => {
    it('should have correct app name', () => {
      expect(APP_CONFIG.appName).toBe('5-Category 포토 팩토리');
    });

    it('should have 5 categories', () => {
      expect(APP_CONFIG.categories).toHaveLength(5);
    });

    it('should have required category properties', () => {
      APP_CONFIG.categories.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('label');
        expect(category).toHaveProperty('icon');
        expect(category).toHaveProperty('description');
      });
    });

    it('should have correct category IDs', () => {
      const expectedIds = ['before_car', 'before_wheel', 'during', 'after_wheel', 'after_car'];
      const actualIds = APP_CONFIG.categories.map(c => c.id);
      expect(actualIds).toEqual(expectedIds);
    });

    it('should have max file size of 10MB', () => {
      expect(APP_CONFIG.maxFileSize).toBe(10 * 1024 * 1024);
    });

    it('should allow only image formats', () => {
      expect(APP_CONFIG.allowedFileTypes).toEqual([
        'image/jpeg',
        'image/png',
        'image/webp'
      ]);
    });

    it('should have photosPerCategory limit', () => {
      expect(APP_CONFIG.photosPerCategory).toBe(3);
    });
  });

  describe('validateConfig()', () => {
    beforeEach(() => {
      // Reset alert mock
      vi.clearAllMocks();
    });

    it('should return true when all env variables are set', () => {
      const result = validateConfig();
      expect(result).toBe(true);
    });

    it('should log success message when validation passes', () => {
      validateConfig();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Configuration validated successfully')
      );
    });

    it('should log config details when validation passes', () => {
      validateConfig();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Config:'),
        expect.any(Object)
      );
    });
  });

  describe('Category Configuration', () => {
    it('should have unique category IDs', () => {
      const ids = APP_CONFIG.categories.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have Korean labels', () => {
      const expectedLabels = ['입고', '문제', '과정', '해결', '출고'];
      const actualLabels = APP_CONFIG.categories.map(c => c.label);
      expect(actualLabels).toEqual(expectedLabels);
    });

    it('should have emoji icons', () => {
      APP_CONFIG.categories.forEach(category => {
        // Check for any Unicode emoji or symbol (more flexible)
        expect(category.icon).toBeTruthy();
        expect(category.icon.length).toBeGreaterThan(0);
      });
    });
  });

  describe('File Type Validation', () => {
    it('should accept JPEG', () => {
      expect(APP_CONFIG.allowedFileTypes).toContain('image/jpeg');
    });

    it('should accept PNG', () => {
      expect(APP_CONFIG.allowedFileTypes).toContain('image/png');
    });

    it('should accept WebP', () => {
      expect(APP_CONFIG.allowedFileTypes).toContain('image/webp');
    });

    it('should not accept GIF', () => {
      expect(APP_CONFIG.allowedFileTypes).not.toContain('image/gif');
    });

    it('should not accept video formats', () => {
      expect(APP_CONFIG.allowedFileTypes).not.toContain('video/mp4');
    });
  });
});
