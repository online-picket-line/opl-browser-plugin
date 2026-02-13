/**
 * Tests for strike-card.js module
 */
const {
  renderStrikeCard,
  renderSmallCard,
  renderMediumCard,
  renderLargeCard,
  resolveLogoUrl,
  getActionLogoUrl,
  getActionMoreInfoUrl,
  getActionTypeLabel,
  truncateText,
  STRIKE_CARD_API_BASE
} = require('../strike-card.js');

// jsdom provides real DOM APIs; no mock needed

const mockAction = {
  id: 'action-1',
  title: 'UAW Strike at Amazon',
  description: 'Workers striking for fair wages and better working conditions',
  company: 'Amazon',
  type: 'strike',
  status: 'active',
  more_info: 'https://example.com/strike-info',
  target_urls: ['amazon.com'],
  locations: ['Detroit, MI'],
  demands: 'Fair wages, healthcare, union recognition',
  logoUrl: 'https://example.com/logos/uaw.png',
  _extensionData: {
    moreInfoUrl: 'https://example.com/strike-info',
    logoUrl: 'https://example.com/logos/uaw.png'
  }
};

describe('Strike Card Module', () => {
  describe('resolveLogoUrl', () => {
    test('should return empty string for falsy input', () => {
      expect(resolveLogoUrl('')).toBe('');
      expect(resolveLogoUrl(null)).toBe('');
      expect(resolveLogoUrl(undefined)).toBe('');
    });

    test('should prepend API base URL for relative paths', () => {
      expect(resolveLogoUrl('/union_logos/uaw.png')).toBe(STRIKE_CARD_API_BASE + '/union_logos/uaw.png');
    });

    test('should return absolute URLs unchanged', () => {
      expect(resolveLogoUrl('https://example.com/logo.png')).toBe('https://example.com/logo.png');
    });
  });

  describe('getActionLogoUrl', () => {
    test('should find logo from action.logoUrl', () => {
      expect(getActionLogoUrl({ logoUrl: 'https://logo.com/test.png' })).toBe('https://logo.com/test.png');
    });

    test('should find logo from _extensionData.logoUrl', () => {
      expect(getActionLogoUrl({ _extensionData: { logoUrl: '/union_logos/test.png' } })).toBe(
        STRIKE_CARD_API_BASE + '/union_logos/test.png'
      );
    });

    test('should find logo from nested actionDetails', () => {
      expect(getActionLogoUrl({
        _extensionData: { actionDetails: { unionLogoUrl: '/union_logos/deep.png' } }
      })).toBe(STRIKE_CARD_API_BASE + '/union_logos/deep.png');
    });

    test('should return empty string when no logo available', () => {
      expect(getActionLogoUrl({})).toBe('');
    });
  });

  describe('getActionMoreInfoUrl', () => {
    test('should use more_info field', () => {
      expect(getActionMoreInfoUrl({ more_info: 'https://learn.com' })).toBe('https://learn.com');
    });

    test('should fall back to _extensionData.moreInfoUrl', () => {
      expect(getActionMoreInfoUrl({ _extensionData: { moreInfoUrl: 'https://ext.com' } })).toBe('https://ext.com');
    });

    test('should return empty string when no URL available', () => {
      expect(getActionMoreInfoUrl({})).toBe('');
    });
  });

  describe('getActionTypeLabel', () => {
    test('should capitalize action type', () => {
      expect(getActionTypeLabel({ type: 'strike' })).toBe('Strike');
      expect(getActionTypeLabel({ type: 'boycott' })).toBe('Boycott');
    });

    test('should default to "Action" when no type', () => {
      expect(getActionTypeLabel({})).toBe('Action');
    });
  });

  describe('truncateText', () => {
    test('should return text unchanged if within limit', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    test('should truncate with ellipsis when over limit', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello W…');
    });

    test('should handle null/empty input', () => {
      expect(truncateText(null, 10)).toBe('');
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('renderSmallCard', () => {
    test('should create a small card with correct class', () => {
      const card = renderSmallCard(mockAction, 160, 60);
      expect(card.className).toContain('opl-strike-card--small');
    });

    test('should set card dimensions', () => {
      const card = renderSmallCard(mockAction, 160, 60);
      expect(card.style.width).toBe('160px');
      expect(card.style.height).toBe('60px');
    });

    test('should contain fist emoji icon', () => {
      const card = renderSmallCard(mockAction, 160, 60);
      const inner = card.children[0];
      expect(inner.children.length).toBeGreaterThanOrEqual(2);
      expect(inner.children[0].textContent).toBe('✊');
    });

    test('should contain employer name in headline', () => {
      const card = renderSmallCard(mockAction, 160, 60);
      const inner = card.children[0];
      const headline = inner.children[1];
      expect(headline.textContent).toContain('Amazon');
    });

    test('should contain Learn More link when URL available', () => {
      const card = renderSmallCard(mockAction, 160, 60);
      const inner = card.children[0];
      const link = inner.children[2];
      expect(link.href).toBe('https://example.com/strike-info');
      expect(link.textContent).toBe('Learn More →');
    });
  });

  describe('renderMediumCard', () => {
    test('should create a medium card with correct class', () => {
      const card = renderMediumCard(mockAction, 300, 150);
      expect(card.className).toContain('opl-strike-card--medium');
    });

    test('should include logo image when available', () => {
      const card = renderMediumCard(mockAction, 300, 150);
      const inner = card.children[0];
      const topRow = inner.children[0];
      const logo = topRow.children[0];
      expect(logo.tagName).toBe('IMG');
      expect(logo.src).toBe('https://example.com/logos/uaw.png');
    });

    test('should use fist icon when no logo', () => {
      const actionNoLogo = { ...mockAction, logoUrl: '', _extensionData: {} };
      const card = renderMediumCard(actionNoLogo, 300, 150);
      const inner = card.children[0];
      const topRow = inner.children[0];
      const icon = topRow.children[0];
      expect(icon.textContent).toBe('✊');
    });

    test('should include action type badge', () => {
      const card = renderMediumCard(mockAction, 300, 150);
      const inner = card.children[0];
      const topRow = inner.children[0];
      const textCol = topRow.children[1];
      const badge = textCol.children[0];
      expect(badge.textContent).toContain('Strike');
    });

    test('should include footer text', () => {
      const card = renderMediumCard(mockAction, 300, 150);
      const inner = card.children[0];
      const footer = inner.children[inner.children.length - 1];
      expect(footer.textContent).toContain('Online Picket Line');
    });
  });

  describe('renderLargeCard', () => {
    test('should create a large card with correct class', () => {
      const card = renderLargeCard(mockAction, 400, 300);
      expect(card.className).toContain('opl-strike-card--large');
    });

    test('should include demands section', () => {
      const card = renderLargeCard(mockAction, 400, 300);
      const demandsEl = card.querySelector('[class*="demands"]');
      expect(demandsEl).not.toBeNull();
    });

    test('should include description section', () => {
      const card = renderLargeCard(mockAction, 400, 300);
      const descEl = card.querySelector('[class*="description"]');
      expect(descEl).not.toBeNull();
    });

    test('should include Learn More button', () => {
      const card = renderLargeCard(mockAction, 400, 300);
      const inner = card.children[0];
      const bottomRow = inner.children[inner.children.length - 1];
      const btn = bottomRow.children[0];
      expect(btn.href).toBe('https://example.com/strike-info');
      expect(btn.textContent).toBe('Learn More');
    });

    test('should use title when available', () => {
      const card = renderLargeCard(mockAction, 400, 300);
      const titleEl = card.querySelector('[class*="title"]');
      expect(titleEl).not.toBeNull();
      expect(titleEl.textContent).toContain('UAW Strike');
    });
  });

  describe('renderStrikeCard', () => {
    test('should delegate to renderSmallCard for small size', () => {
      const card = renderStrikeCard(mockAction, 'small', { width: 150, height: 50 });
      expect(card.className).toContain('opl-strike-card--small');
      expect(card.getAttribute('data-opl-injected')).toBe('true');
    });

    test('should delegate to renderMediumCard for medium size', () => {
      const card = renderStrikeCard(mockAction, 'medium', { width: 300, height: 150 });
      expect(card.className).toContain('opl-strike-card--medium');
    });

    test('should delegate to renderLargeCard for large size', () => {
      const card = renderStrikeCard(mockAction, 'large', { width: 400, height: 300 });
      expect(card.className).toContain('opl-strike-card--large');
    });

    test('should set data-opl-injected attribute', () => {
      const card = renderStrikeCard(mockAction, 'medium', { width: 300, height: 150 });
      expect(card.getAttribute('data-opl-injected')).toBe('true');
    });
  });
});
