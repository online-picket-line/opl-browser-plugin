/**
 * Tests for theme.css
 * Validates color scheme and typography match the onlinepicketline.com website
 */

const fs = require('fs');
const path = require('path');

describe('Theme Configuration', () => {
  let themeCSS;
  
  beforeAll(() => {
    // Read theme.css file
    const themePath = path.join(__dirname, '..', 'theme.css');
    themeCSS = fs.readFileSync(themePath, 'utf-8');
  });

  describe('Color Scheme', () => {
    it('should define all required color variables', () => {
      const requiredColors = [
        '--background',
        '--foreground',
        '--card',
        '--card-foreground',
        '--primary',
        '--primary-foreground',
        '--secondary',
        '--secondary-foreground',
        '--muted',
        '--muted-foreground',
        '--accent',
        '--accent-foreground',
        '--destructive',
        '--destructive-foreground',
        '--border',
        '--input',
        '--ring'
      ];

      requiredColors.forEach(color => {
        expect(themeCSS).toContain(color);
      });
    });

    it('should use oklch color format matching onlinepicketline.com', () => {
      // Verify oklch format is used
      expect(themeCSS).toMatch(/oklch\(\d+%\s+[\d.]+\s+\d+\)/);
    });

    it('should define primary color matching website', () => {
      // Primary color should be dark green: oklch(28% .2 140)
      expect(themeCSS).toContain('oklch(28% .2 140)');
    });

    it('should define destructive color matching website', () => {
      // Destructive color should be warm red: oklch(45% .22 15)
      expect(themeCSS).toContain('oklch(45% .22 15)');
    });

    it('should define background color matching website', () => {
      // Background should be very light: oklch(98% .005 140)
      expect(themeCSS).toContain('oklch(98% .005 140)');
    });
  });

  describe('Typography', () => {
    it('should import IBM Plex Sans', () => {
      expect(themeCSS).toContain('IBM+Plex+Sans');
    });

    it('should import IBM Plex Serif', () => {
      expect(themeCSS).toContain('IBM+Plex+Serif');
    });

    it('should import Fira Code for monospace', () => {
      expect(themeCSS).toContain('Fira+Code');
    });

    it('should define font-sans variable', () => {
      expect(themeCSS).toContain('--font-sans');
      expect(themeCSS).toMatch(/--font-sans:.*IBM Plex Sans/);
    });

    it('should define font-serif variable', () => {
      expect(themeCSS).toContain('--font-serif');
      expect(themeCSS).toMatch(/--font-serif:.*IBM Plex Serif/);
    });

    it('should define font-mono variable', () => {
      expect(themeCSS).toContain('--font-mono');
      expect(themeCSS).toMatch(/--font-mono:.*Fira Code/);
    });

    it('should use font-serif for headings', () => {
      expect(themeCSS).toMatch(/h1.*h6[\s\S]*font-family:\s*var\(--font-serif\)/);
    });

    it('should use font-sans for body', () => {
      expect(themeCSS).toMatch(/body[\s\S]*font-family:\s*var\(--font-sans\)/);
    });
  });

  describe('Shadow System', () => {
    it('should define shadow variables matching website', () => {
      expect(themeCSS).toContain('--shadow-color');
      expect(themeCSS).toContain('--shadow-opacity');
      expect(themeCSS).toContain('--shadow-blur');
      expect(themeCSS).toContain('--shadow-spread');
      expect(themeCSS).toContain('--shadow-offset-x');
      expect(themeCSS).toContain('--shadow-offset-y');
    });

    it('should define hard shadow helper', () => {
      expect(themeCSS).toContain('--shadow-hard');
      expect(themeCSS).toMatch(/--shadow-hard:.*2px 2px 0px 0px/);
    });
  });

  describe('Button Styles', () => {
    it('should define primary button with shadow', () => {
      expect(themeCSS).toContain('.btn-primary');
      expect(themeCSS).toMatch(/\.btn-primary[\s\S]*box-shadow.*--shadow-hard/);
    });

    it('should define button hover effects', () => {
      expect(themeCSS).toMatch(/\.btn-primary:hover[\s\S]*transform/);
      expect(themeCSS).toMatch(/\.btn-primary:hover[\s\S]*box-shadow.*4px 4px/);
    });

    it('should define secondary button', () => {
      expect(themeCSS).toContain('.btn-secondary');
    });
  });

  describe('Card Component', () => {
    it('should define card styles', () => {
      expect(themeCSS).toContain('.card');
      expect(themeCSS).toMatch(/\.card[\s\S]*background-color:\s*var\(--card\)/);
    });

    it('should use card border', () => {
      expect(themeCSS).toMatch(/\.card[\s\S]*border:.*var\(--border\)/);
    });
  });

  describe('Input Styles', () => {
    it('should define input styling', () => {
      expect(themeCSS).toMatch(/input\[type="text"\]/);
      expect(themeCSS).toMatch(/input\[type="password"\]/);
    });

    it('should define focus states', () => {
      expect(themeCSS).toMatch(/input.*:focus/);
      expect(themeCSS).toMatch(/:focus[\s\S]*border-color:\s*var\(--ring\)/);
    });
  });

  describe('Status Messages', () => {
    it('should define status styles', () => {
      expect(themeCSS).toContain('.status');
    });

    it('should define success status', () => {
      expect(themeCSS).toContain('.status.success');
    });

    it('should define error status', () => {
      expect(themeCSS).toContain('.status.error');
      expect(themeCSS).toMatch(/\.status\.error[\s\S]*background-color:\s*var\(--destructive\)/);
    });

    it('should define warning status', () => {
      expect(themeCSS).toContain('.status.warning');
      expect(themeCSS).toMatch(/\.status\.warning[\s\S]*background-color:\s*var\(--accent\)/);
    });
  });
});
