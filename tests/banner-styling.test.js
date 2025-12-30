/**
 * Tests for content.css banner styling
 * Validates banner matches onlinepicketline.com styling
 */

const fs = require('fs');
const path = require('path');

describe('Banner Styling', () => {
  let contentCSS;

  beforeAll(() => {
    // Read content.css file
    const contentPath = path.join(__dirname, '..', 'content.css');
    contentCSS = fs.readFileSync(contentPath, 'utf-8');
  });

  describe('Banner Base Styles', () => {
    it('should define opl-banner class', () => {
      expect(contentCSS).toContain('.opl-banner');
    });

    it('should position banner at bottom', () => {
      expect(contentCSS).toMatch(/\.opl-banner[\s\S]*position:\s*fixed/);
      expect(contentCSS).toMatch(/\.opl-banner[\s\S]*bottom:\s*0/);
    });

    it('should use destructive color matching website', () => {
      // Banner should use destructive color: oklch(45% .22 15)
      expect(contentCSS).toMatch(/\.opl-banner[\s\S]*background:\s*oklch\(45%\s*\.22\s*15\)/);
    });

    it('should use correct text color', () => {
      // Text should be light: oklch(99% .005 140)
      expect(contentCSS).toMatch(/\.opl-banner[\s\S]*color:\s*oklch\(99%\s*\.005\s*140\)/);
    });

    it('should use IBM Plex Sans font', () => {
      expect(contentCSS).toMatch(/\.opl-banner[\s\S]*font-family:.*IBM Plex Sans/);
    });

    it('should have high z-index for visibility', () => {
      expect(contentCSS).toMatch(/\.opl-banner[\s\S]*z-index:\s*2147483647/);
    });
  });

  describe('Banner Animation', () => {
    it('should have transform for slide-in effect', () => {
      expect(contentCSS).toMatch(/\.opl-banner[\s\S]*transform:\s*translateY\(100%\)/);
    });

    it('should define visible state', () => {
      expect(contentCSS).toContain('.opl-banner-visible');
      expect(contentCSS).toMatch(/\.opl-banner-visible[\s\S]*transform:\s*translateY\(0\)/);
    });

    it('should have transition for smooth animation', () => {
      expect(contentCSS).toMatch(/\.opl-banner[\s\S]*transition:.*transform/);
    });
  });

  describe('Banner Content Layout', () => {
    it('should define content container', () => {
      expect(contentCSS).toContain('.opl-banner-content');
    });

    it('should use flexbox for layout', () => {
      expect(contentCSS).toMatch(/\.opl-banner-content[\s\S]*display:\s*flex/);
    });

    it('should define icon styling', () => {
      expect(contentCSS).toContain('.opl-banner-icon');
    });

    it('should define logo styling', () => {
      expect(contentCSS).toContain('.opl-banner-logo');
    });

    it('should define text container', () => {
      expect(contentCSS).toContain('.opl-banner-text');
    });
  });

  describe('Banner Logo', () => {
    it('should have max-width constraint', () => {
      expect(contentCSS).toMatch(/\.opl-banner-logo[\s\S]*max-width:\s*64px/);
    });

    it('should have max-height constraint', () => {
      expect(contentCSS).toMatch(/\.opl-banner-logo[\s\S]*max-height:\s*64px/);
    });

    it('should use object-fit contain', () => {
      expect(contentCSS).toMatch(/\.opl-banner-logo[\s\S]*object-fit:\s*contain/);
    });

    it('should have border-radius', () => {
      expect(contentCSS).toMatch(/\.opl-banner-logo[\s\S]*border-radius:\s*4px/);
    });
  });

  describe('Banner Typography', () => {
    it('should define title styling', () => {
      expect(contentCSS).toContain('.opl-banner-title');
      expect(contentCSS).toMatch(/\.opl-banner-title[\s\S]*font-weight:\s*600/);
    });

    it('should define description styling', () => {
      expect(contentCSS).toContain('.opl-banner-description');
    });

    it('should define link styling', () => {
      expect(contentCSS).toContain('.opl-banner-link');
    });

    it('should define link hover state', () => {
      expect(contentCSS).toMatch(/\.opl-banner-link:hover/);
    });
  });

  describe('Banner Close Button', () => {
    it('should define close button', () => {
      expect(contentCSS).toContain('.opl-banner-close');
    });

    it('should be circular', () => {
      expect(contentCSS).toMatch(/\.opl-banner-close[\s\S]*border-radius:\s*50%/);
    });

    it('should have hover effect', () => {
      expect(contentCSS).toMatch(/\.opl-banner-close:hover/);
    });

    it('should have pointer cursor', () => {
      expect(contentCSS).toMatch(/\.opl-banner-close[\s\S]*cursor:\s*pointer/);
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile breakpoint', () => {
      expect(contentCSS).toMatch(/@media.*max-width:\s*768px/);
    });

    it('should adjust logo size on mobile', () => {
      expect(contentCSS).toMatch(/@media.*768px[\s\S]*\.opl-banner-logo[\s\S]*max-width:\s*48px/);
      expect(contentCSS).toMatch(/@media.*768px[\s\S]*\.opl-banner-logo[\s\S]*max-height:\s*48px/);
    });

    it('should adjust icon size on mobile', () => {
      expect(contentCSS).toMatch(/@media.*768px[\s\S]*\.opl-banner-icon[\s\S]*font-size:\s*24px/);
    });
  });
});
