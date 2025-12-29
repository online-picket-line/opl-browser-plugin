const { mockTransformedActions } = require('./fixtures.js');

// Mock the background script functions
const originalMatchUrlToAction = global.matchUrlToAction;

// Mock implementation of matchUrlToAction for testing
global.matchUrlToAction = (url, actions) => {
  if (!url || !actions || actions.length === 0) {
    return null;
  }

  try {
    const urlToTest = url.toLowerCase();
    
    for (const action of actions) {
      if (action.status && action.status !== 'active') {
        continue;
      }

      // Use extension format data if available
      if (action._extensionData && action._extensionData.matchingUrlRegexes) {
        for (const pattern of action._extensionData.matchingUrlRegexes) {
          try {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(urlToTest)) {
              return action;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error matching URL:', error);
  }

  return null;
};

describe('URL Matching (Background Script)', () => {
  afterAll(() => {
    global.matchUrlToAction = originalMatchUrlToAction;
  });

  describe('matchUrlToAction', () => {
    const testActions = mockTransformedActions;

    it('should match exact domain patterns', () => {
      const result = matchUrlToAction('https://wirecutter.com/article', testActions);
      
      expect(result).toBeTruthy();
      expect(result.company).toBe('Wirecutter');
      expect(result.type).toBe('strike');
    });

    it('should match subdomain patterns', () => {
      const result = matchUrlToAction('https://www.example.com/page', testActions);
      
      expect(result).toBeTruthy();
      expect(result.company).toBe('Example Corp');
      expect(result.type).toBe('boycott');
    });

    it('should match social media patterns', () => {
      const result = matchUrlToAction('https://facebook.com/thewirecutter/posts/123', testActions);
      
      expect(result).toBeTruthy();
      expect(result.company).toBe('Wirecutter');
    });

    it('should be case insensitive', () => {
      const result = matchUrlToAction('HTTPS://WIRECUTTER.COM/TEST', testActions);
      
      expect(result).toBeTruthy();
      expect(result.company).toBe('Wirecutter');
    });

    it('should not match unrelated URLs', () => {
      const result = matchUrlToAction('https://google.com', testActions);
      
      expect(result).toBeNull();
    });

    it('should handle invalid URLs gracefully', () => {
      const result = matchUrlToAction('not-a-url', testActions);
      
      expect(result).toBeNull();
    });

    it('should return null for empty inputs', () => {
      expect(matchUrlToAction('', testActions)).toBeNull();
      expect(matchUrlToAction('https://wirecutter.com', [])).toBeNull();
      expect(matchUrlToAction('https://wirecutter.com', null)).toBeNull();
    });

    it('should skip inactive actions', () => {
      const actionsWithInactive = [
        ...testActions,
        {
          ...testActions[0],
          id: 'inactive-action',
          company: 'Inactive Corp',
          status: 'completed',
          _extensionData: {
            matchingUrlRegexes: ['inactive.com']
          }
        }
      ];

      const result = matchUrlToAction('https://inactive.com', actionsWithInactive);
      expect(result).toBeNull();
    });

    it('should handle regex errors gracefully', () => {
      const actionsWithBadRegex = [{
        ...testActions[0],
        _extensionData: {
          matchingUrlRegexes: ['[invalid-regex'] // Invalid regex
        }
      }];

      const result = matchUrlToAction('https://wirecutter.com', actionsWithBadRegex);
      expect(result).toBeNull();
    });

    it('should match complex path patterns', () => {
      const actionWithComplexPattern = {
        ...testActions[0],
        _extensionData: {
          matchingUrlRegexes: ['nytimes\\.com/wirecutter']
        }
      };

      const result = matchUrlToAction('https://nytimes.com/wirecutter/reviews/best-headphones', [actionWithComplexPattern]);
      expect(result).toBeTruthy();
    });

    it('should handle actions without extension data', () => {
      const actionWithoutExtensionData = {
        ...testActions[0],
        _extensionData: null
      };

      const result = matchUrlToAction('https://wirecutter.com', [actionWithoutExtensionData]);
      expect(result).toBeNull();
    });
  });

  describe('URL pattern edge cases', () => {
    const testAction = mockTransformedActions[0];

    it('should handle protocol variations', () => {
      const urls = [
        'https://wirecutter.com',
        'http://wirecutter.com',
        'ftp://wirecutter.com' // Should still match domain
      ];

      urls.forEach(url => {
        const result = matchUrlToAction(url, [testAction]);
        expect(result).toBeTruthy();
      });
    });

    it('should handle query parameters and fragments', () => {
      const urls = [
        'https://wirecutter.com?param=value',
        'https://wirecutter.com#section',
        'https://wirecutter.com/path?param=value#section'
      ];

      urls.forEach(url => {
        const result = matchUrlToAction(url, [testAction]);
        expect(result).toBeTruthy();
      });
    });

    it('should handle special characters in URLs', () => {
      const urls = [
        'https://wirecutter.com/path-with-dashes',
        'https://wirecutter.com/path_with_underscores',
        'https://wirecutter.com/path.with.dots'
      ];

      urls.forEach(url => {
        const result = matchUrlToAction(url, [testAction]);
        expect(result).toBeTruthy();
      });
    });
  });

  describe('Performance considerations', () => {
    it('should handle large numbers of actions efficiently', () => {
      // Create 100 test actions
      const manyActions = Array.from({ length: 100 }, (_, i) => ({
        ...mockTransformedActions[0],
        id: `action-${i}`,
        company: `Company ${i}`,
        _extensionData: {
          matchingUrlRegexes: [`company${i}\\.com`]
        }
      }));

      const startTime = performance.now();
      const result = matchUrlToAction('https://company50.com', manyActions);
      const endTime = performance.now();

      expect(result).toBeTruthy();
      expect(result.company).toBe('Company 50');
      expect(endTime - startTime).toBeLessThan(50); // Should complete within 50ms
    });

    it('should handle many regex patterns per action', () => {
      const actionWithManyPatterns = {
        ...mockTransformedActions[0],
        _extensionData: {
          matchingUrlRegexes: Array.from({ length: 50 }, (_, i) => `domain${i}\\.com`)
        }
      };

      const result = matchUrlToAction('https://domain25.com', [actionWithManyPatterns]);
      expect(result).toBeTruthy();
    });
  });
});