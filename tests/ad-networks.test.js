/**
 * Tests for ad-networks.js module
 */
const { AD_NETWORK_DOMAINS, AD_BLOCK_RESOURCE_TYPES, getAdNetworkDomainList } = require('../ad-networks.js');

describe('Ad Networks Module', () => {
  describe('AD_NETWORK_DOMAINS', () => {
    test('should be a non-empty array', () => {
      expect(Array.isArray(AD_NETWORK_DOMAINS)).toBe(true);
      expect(AD_NETWORK_DOMAINS.length).toBeGreaterThan(0);
    });

    test('each entry should have domain, urlFilter, and provider', () => {
      AD_NETWORK_DOMAINS.forEach((entry) => {
        expect(entry).toHaveProperty('domain');
        expect(entry).toHaveProperty('urlFilter');
        expect(entry).toHaveProperty('provider');
        expect(typeof entry.domain).toBe('string');
        expect(typeof entry.urlFilter).toBe('string');
        expect(typeof entry.provider).toBe('string');
      });
    });

    test('urlFilter should use DNR domain anchor format', () => {
      AD_NETWORK_DOMAINS.forEach((entry) => {
        expect(entry.urlFilter).toMatch(/^\|\|.+\^$/);
      });
    });

    test('should include Google ad network domains', () => {
      const googleDomains = AD_NETWORK_DOMAINS.filter(e => e.provider === 'Google');
      expect(googleDomains.length).toBeGreaterThanOrEqual(3);
      expect(googleDomains.some(e => e.domain === 'googlesyndication.com')).toBe(true);
      expect(googleDomains.some(e => e.domain === 'doubleclick.net')).toBe(true);
    });

    test('should include Amazon ad network domains', () => {
      const amazonDomains = AD_NETWORK_DOMAINS.filter(e => e.provider === 'Amazon');
      expect(amazonDomains.length).toBeGreaterThanOrEqual(1);
      expect(amazonDomains.some(e => e.domain === 'amazon-adsystem.com')).toBe(true);
    });

    test('should include Taboola domains', () => {
      const taboolaDomains = AD_NETWORK_DOMAINS.filter(e => e.provider === 'Taboola');
      expect(taboolaDomains.length).toBeGreaterThanOrEqual(1);
    });

    test('should include Outbrain domains', () => {
      const outbrainDomains = AD_NETWORK_DOMAINS.filter(e => e.provider === 'Outbrain');
      expect(outbrainDomains.length).toBeGreaterThanOrEqual(1);
    });

    test('should include Media.net domains', () => {
      const mediaNetDomains = AD_NETWORK_DOMAINS.filter(e => e.provider === 'Media.net');
      expect(mediaNetDomains.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('AD_BLOCK_RESOURCE_TYPES', () => {
    test('should be a non-empty array', () => {
      expect(Array.isArray(AD_BLOCK_RESOURCE_TYPES)).toBe(true);
      expect(AD_BLOCK_RESOURCE_TYPES.length).toBeGreaterThan(0);
    });

    test('should include script, image, and sub_frame', () => {
      expect(AD_BLOCK_RESOURCE_TYPES).toContain('script');
      expect(AD_BLOCK_RESOURCE_TYPES).toContain('image');
      expect(AD_BLOCK_RESOURCE_TYPES).toContain('sub_frame');
    });

    test('should NOT include main_frame', () => {
      expect(AD_BLOCK_RESOURCE_TYPES).not.toContain('main_frame');
    });
  });

  describe('getAdNetworkDomainList', () => {
    test('should return array of domain strings', () => {
      const list = getAdNetworkDomainList();
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBe(AD_NETWORK_DOMAINS.length);
      list.forEach(domain => {
        expect(typeof domain).toBe('string');
      });
    });

    test('should contain googlesyndication.com', () => {
      const list = getAdNetworkDomainList();
      expect(list).toContain('googlesyndication.com');
    });
  });
});
