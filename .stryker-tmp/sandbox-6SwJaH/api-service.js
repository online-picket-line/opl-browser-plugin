// @ts-nocheck
// API service to fetch labor actions from Online Picketline External API (v3.0)
// Requires API key authentication (public or private)
// Note: Advanced obfuscation protects API key from static analysis
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
const DEFAULT_API_BASE_URL = stryMutAct_9fa48("0") ? "" : (stryCov_9fa48("0"), 'https://onlinepicketline.com');

// Advanced obfuscation: Split key across multiple encoded parts and functions
const _p1 = stryMutAct_9fa48("1") ? "" : (stryCov_9fa48("1"), 'b3Bs'); // Base64 for 'opl'
const _p2 = stryMutAct_9fa48("2") ? () => undefined : (stryCov_9fa48("2"), (() => {
  const _p2 = () => String.fromCharCode(95);
  return _p2;
})()); // '_'
const _p3 = (stryMutAct_9fa48("3") ? [] : (stryCov_9fa48("3"), [48, 50])).map(stryMutAct_9fa48("4") ? () => undefined : (stryCov_9fa48("4"), x => String.fromCharCode(x))).join(stryMutAct_9fa48("5") ? "Stryker was here!" : (stryCov_9fa48("5"), '')); // '02'
const _p4 = new Function(stryMutAct_9fa48("6") ? "" : (stryCov_9fa48("6"), 'return "Y2FmZWNj"'))(); // Base64 for 'cafecc'
const _p5 = (() => {
  if (stryMutAct_9fa48("7")) {
    {}
  } else {
    stryCov_9fa48("7");
    const x = stryMutAct_9fa48("8") ? [] : (stryCov_9fa48("8"), [51, 51, 54, 49]);
    return btoa(String.fromCharCode(...x));
  }
})(); // Base64 for '3361'
const _p6 = (stryMutAct_9fa48("9") ? () => undefined : (stryCov_9fa48("9"), (a, b) => btoa(stryMutAct_9fa48("10") ? a - b : (stryCov_9fa48("10"), a + b))))(stryMutAct_9fa48("11") ? "" : (stryCov_9fa48("11"), 'fb5e'), stryMutAct_9fa48("12") ? "" : (stryCov_9fa48("12"), 'e303')); // Base64 for 'fb5ee303'
const _p7 = btoa; // Base64 encoding function
const _p8 = stryMutAct_9fa48("13") ? "" : (stryCov_9fa48("13"), 'ODMyZGRlMjZlM2M2N2Y0N2I5NDQ3NmI1NWYxMGI0NjRiYTIwYmZlYzRmMWM='); // Final part

// Runtime key assembly with anti-tampering
function _assembleKey() {
  if (stryMutAct_9fa48("14")) {
    {}
  } else {
    stryCov_9fa48("14");
    const timestamp = Date.now();
    const checksum = stryMutAct_9fa48("15") ? timestamp.toString(16) : (stryCov_9fa48("15"), timestamp.toString(16).slice(stryMutAct_9fa48("16") ? +4 : (stryCov_9fa48("16"), -4)));

    // Decode and combine parts
    const parts = stryMutAct_9fa48("17") ? [] : (stryCov_9fa48("17"), [atob(_p1), _p2(), _p3, atob(_p4), atob(_p5), atob(_p6), atob(_p8)]);

    // Add runtime verification
    const assembled = parts.join(stryMutAct_9fa48("18") ? "Stryker was here!" : (stryCov_9fa48("18"), ''));
    const expected_length = 68; // Expected API key length

    if (stryMutAct_9fa48("21") ? assembled.length === expected_length : stryMutAct_9fa48("20") ? false : stryMutAct_9fa48("19") ? true : (stryCov_9fa48("19", "20", "21"), assembled.length !== expected_length)) {
      if (stryMutAct_9fa48("22")) {
        {}
      } else {
        stryCov_9fa48("22");
        throw new Error(stryMutAct_9fa48("23") ? "" : (stryCov_9fa48("23"), 'Key assembly verification failed'));
      }
    }

    // Encode the final key
    return btoa(assembled);
  }
}

// Dynamic key getter with multiple fallback layers
const _getObfuscatedKey = (() => {
  if (stryMutAct_9fa48("24")) {
    {}
  } else {
    stryCov_9fa48("24");
    let _cachedKey = null;
    let _lastCheck = 0;
    return function () {
      if (stryMutAct_9fa48("25")) {
        {}
      } else {
        stryCov_9fa48("25");
        const now = Date.now();

        // Cache key for 5 minutes to avoid repeated computation
        if (stryMutAct_9fa48("28") ? _cachedKey || now - _lastCheck < 300000 : stryMutAct_9fa48("27") ? false : stryMutAct_9fa48("26") ? true : (stryCov_9fa48("26", "27", "28"), _cachedKey && (stryMutAct_9fa48("31") ? now - _lastCheck >= 300000 : stryMutAct_9fa48("30") ? now - _lastCheck <= 300000 : stryMutAct_9fa48("29") ? true : (stryCov_9fa48("29", "30", "31"), (stryMutAct_9fa48("32") ? now + _lastCheck : (stryCov_9fa48("32"), now - _lastCheck)) < 300000)))) {
          if (stryMutAct_9fa48("33")) {
            {}
          } else {
            stryCov_9fa48("33");
            return _cachedKey;
          }
        }
        try {
          if (stryMutAct_9fa48("34")) {
            {}
          } else {
            stryCov_9fa48("34");
            _cachedKey = _assembleKey();
            _lastCheck = now;
            return _cachedKey;
          }
        } catch (e) {
          if (stryMutAct_9fa48("35")) {
            {}
          } else {
            stryCov_9fa48("35");
            // Fallback to simpler obfuscation if assembly fails
            const fallback = stryMutAct_9fa48("36") ? "" : (stryCov_9fa48("36"), 'b3BsXzAyY2FmZWNjMzM2MWZiNWVlMzAzODMyZGRlMjZlM2M2N2Y0N2I5NDQ3NmI1NWYxMGI0NjRiYTIwYmZlYzRmMWM=');
            console.warn(stryMutAct_9fa48("37") ? "" : (stryCov_9fa48("37"), 'Using fallback key assembly'));
            return fallback;
          }
        }
      }
    };
  }
})();

// Anti-debugging: Add timing variations
const _validateEnvironment = () => {
  if (stryMutAct_9fa48("38")) {
    {}
  } else {
    stryCov_9fa48("38");
    const start = performance.now();
    let sum = 0;
    for (let i = 0; stryMutAct_9fa48("41") ? i >= 1000 : stryMutAct_9fa48("40") ? i <= 1000 : stryMutAct_9fa48("39") ? false : (stryCov_9fa48("39", "40", "41"), i < 1000); stryMutAct_9fa48("42") ? i-- : (stryCov_9fa48("42"), i++)) {
      if (stryMutAct_9fa48("43")) {
        {}
      } else {
        stryCov_9fa48("43");
        stryMutAct_9fa48("44") ? sum -= Math.random() : (stryCov_9fa48("44"), sum += Math.random());
      }
    }
    const duration = stryMutAct_9fa48("45") ? performance.now() + start : (stryCov_9fa48("45"), performance.now() - start);

    // If execution is suspiciously slow, might be debugged
    return stryMutAct_9fa48("49") ? duration >= 100 : stryMutAct_9fa48("48") ? duration <= 100 : stryMutAct_9fa48("47") ? false : stryMutAct_9fa48("46") ? true : (stryCov_9fa48("46", "47", "48", "49"), duration < 100);
  }
};
const CACHE_KEY = stryMutAct_9fa48("50") ? "" : (stryCov_9fa48("50"), 'labor_actions_cache');
const CACHE_DURATION = 300000; // 5 minutes in milliseconds
const CACHE_HASH_KEY = stryMutAct_9fa48("51") ? "" : (stryCov_9fa48("51"), 'content_hash');
class ApiService {
  constructor() {
    if (stryMutAct_9fa48("52")) {
      {}
    } else {
      stryCov_9fa48("52");
      this.baseUrl = DEFAULT_API_BASE_URL;
      this.keyResolver = _getObfuscatedKey;
      this._environmentValid = _validateEnvironment();
    }
  }

  /**
   * Initialize the API service with settings
   */
  async init() {
    if (stryMutAct_9fa48("53")) {
      {}
    } else {
      stryCov_9fa48("53");
      // Settings are now hardcoded with obfuscated key
      this.baseUrl = DEFAULT_API_BASE_URL;
      this._environmentValid = _validateEnvironment();
    }
  }

  /**
   * Get API settings
   * @returns {Promise<Object>}
   */
  async getSettings() {
    if (stryMutAct_9fa48("54")) {
      {}
    } else {
      stryCov_9fa48("54");
      return Promise.resolve(stryMutAct_9fa48("55") ? {} : (stryCov_9fa48("55"), {
        apiUrl: DEFAULT_API_BASE_URL,
        keyType: stryMutAct_9fa48("56") ? "" : (stryCov_9fa48("56"), 'obfuscated')
      }));
    }
  }

  /**
   * Get decoded API key with anti-tampering checks
   * @returns {string} Decoded API key
   */
  getApiKey() {
    if (stryMutAct_9fa48("57")) {
      {}
    } else {
      stryCov_9fa48("57");
      if (stryMutAct_9fa48("60") ? false : stryMutAct_9fa48("59") ? true : stryMutAct_9fa48("58") ? this._environmentValid : (stryCov_9fa48("58", "59", "60"), !this._environmentValid)) {
        if (stryMutAct_9fa48("61")) {
          {}
        } else {
          stryCov_9fa48("61");
          throw new Error(stryMutAct_9fa48("62") ? "" : (stryCov_9fa48("62"), 'Invalid execution environment detected'));
        }
      }
      try {
        if (stryMutAct_9fa48("63")) {
          {}
        } else {
          stryCov_9fa48("63");
          const obfuscatedKey = this.keyResolver();
          const decodedKey = atob(obfuscatedKey);

          // Validate key format
          if (stryMutAct_9fa48("66") ? !decodedKey.startsWith('opl_') && decodedKey.length < 60 : stryMutAct_9fa48("65") ? false : stryMutAct_9fa48("64") ? true : (stryCov_9fa48("64", "65", "66"), (stryMutAct_9fa48("67") ? decodedKey.startsWith('opl_') : (stryCov_9fa48("67"), !(stryMutAct_9fa48("68") ? decodedKey.endsWith('opl_') : (stryCov_9fa48("68"), decodedKey.startsWith(stryMutAct_9fa48("69") ? "" : (stryCov_9fa48("69"), 'opl_')))))) || (stryMutAct_9fa48("72") ? decodedKey.length >= 60 : stryMutAct_9fa48("71") ? decodedKey.length <= 60 : stryMutAct_9fa48("70") ? false : (stryCov_9fa48("70", "71", "72"), decodedKey.length < 60)))) {
            if (stryMutAct_9fa48("73")) {
              {}
            } else {
              stryCov_9fa48("73");
              throw new Error(stryMutAct_9fa48("74") ? "" : (stryCov_9fa48("74"), 'Key validation failed'));
            }
          }
          return decodedKey;
        }
      } catch (error) {
        if (stryMutAct_9fa48("75")) {
          {}
        } else {
          stryCov_9fa48("75");
          console.error(stryMutAct_9fa48("76") ? "" : (stryCov_9fa48("76"), 'Key decryption failed:'), error.message);
          throw new Error(stryMutAct_9fa48("77") ? "" : (stryCov_9fa48("77"), 'Authentication unavailable'));
        }
      }
    }
  }

  /**
   * Fetch labor actions from the Online Picketline API with caching
   * Includes anti-tampering and obfuscated authentication
   * @returns {Promise<Array>} List of transformed labor action objects with structure:
   *   {
   *     id: string,
   *     title: string,
   *     description: string,
   *     company: string,
   *     type: string,
   *     status: string,
   *     target_urls: string[],
   *     locations: string[],
   *     divisions: string[]
   *   }
   * @throws {Error} If API request fails or API key is invalid
   */
  async getLaborActions() {
    if (stryMutAct_9fa48("78")) {
      {}
    } else {
      stryCov_9fa48("78");
      try {
        if (stryMutAct_9fa48("79")) {
          {}
        } else {
          stryCov_9fa48("79");
          // Environment validation
          if (stryMutAct_9fa48("82") ? false : stryMutAct_9fa48("81") ? true : stryMutAct_9fa48("80") ? this._environmentValid : (stryCov_9fa48("80", "81", "82"), !this._environmentValid)) {
            if (stryMutAct_9fa48("83")) {
              {}
            } else {
              stryCov_9fa48("83");
              console.warn(stryMutAct_9fa48("84") ? "" : (stryCov_9fa48("84"), 'Execution environment validation failed'));
            }
          }

          // Check cache first
          const cached = await this.getCachedData();
          if (stryMutAct_9fa48("86") ? false : stryMutAct_9fa48("85") ? true : (stryCov_9fa48("85", "86"), cached)) {
            if (stryMutAct_9fa48("87")) {
              {}
            } else {
              stryCov_9fa48("87");
              console.log(stryMutAct_9fa48("88") ? "" : (stryCov_9fa48("88"), 'Using cached labor actions'));
              return cached;
            }
          }

          // Ensure we have the latest settings
          await this.init();

          // Get cached hash for efficient caching
          const cachedHash = await this.getCachedHash();

          // Fetch from Online Picketline External API with obfuscated API key
          let url = stryMutAct_9fa48("89") ? `` : (stryCov_9fa48("89"), `${this.baseUrl}/api/blocklist.json?format=extension&includeInactive=false`);
          if (stryMutAct_9fa48("91") ? false : stryMutAct_9fa48("90") ? true : (stryCov_9fa48("90", "91"), cachedHash)) {
            if (stryMutAct_9fa48("92")) {
              {}
            } else {
              stryCov_9fa48("92");
              url += stryMutAct_9fa48("93") ? `` : (stryCov_9fa48("93"), `&hash=${cachedHash}`);
            }
          }

          // Get API key through obfuscated resolver
          const apiKey = this.getApiKey();
          const headers = stryMutAct_9fa48("94") ? {} : (stryCov_9fa48("94"), {
            'Accept': stryMutAct_9fa48("95") ? "" : (stryCov_9fa48("95"), 'application/json'),
            'X-API-Key': apiKey,
            'User-Agent': stryMutAct_9fa48("96") ? `` : (stryCov_9fa48("96"), `OPL-Extension/${chrome.runtime.getManifest().version}`)
          });
          const response = await fetch(url, stryMutAct_9fa48("97") ? {} : (stryCov_9fa48("97"), {
            method: stryMutAct_9fa48("98") ? "" : (stryCov_9fa48("98"), 'GET'),
            headers
          }));
          if (stryMutAct_9fa48("101") ? response.status !== 304 : stryMutAct_9fa48("100") ? false : stryMutAct_9fa48("99") ? true : (stryCov_9fa48("99", "100", "101"), response.status === 304)) {
            if (stryMutAct_9fa48("102")) {
              {}
            } else {
              stryCov_9fa48("102");
              // Content not modified, use cached data
              console.log(stryMutAct_9fa48("103") ? "" : (stryCov_9fa48("103"), 'Content not modified (304), using cached data'));
              const cached = await this.getCachedData(stryMutAct_9fa48("104") ? false : (stryCov_9fa48("104"), true));
              if (stryMutAct_9fa48("106") ? false : stryMutAct_9fa48("105") ? true : (stryCov_9fa48("105", "106"), cached)) {
                if (stryMutAct_9fa48("107")) {
                  {}
                } else {
                  stryCov_9fa48("107");
                  return cached;
                }
              }
              // Fall through to fetch fresh if no cache
            }
          }
          if (stryMutAct_9fa48("110") ? response.status !== 429 : stryMutAct_9fa48("109") ? false : stryMutAct_9fa48("108") ? true : (stryCov_9fa48("108", "109", "110"), response.status === 429)) {
            if (stryMutAct_9fa48("111")) {
              {}
            } else {
              stryCov_9fa48("111");
              const retryAfter = stryMutAct_9fa48("114") ? response.headers.get('Retry-After') && '120' : stryMutAct_9fa48("113") ? false : stryMutAct_9fa48("112") ? true : (stryCov_9fa48("112", "113", "114"), response.headers.get(stryMutAct_9fa48("115") ? "" : (stryCov_9fa48("115"), 'Retry-After')) || (stryMutAct_9fa48("116") ? "" : (stryCov_9fa48("116"), '120')));
              throw new Error(stryMutAct_9fa48("117") ? `` : (stryCov_9fa48("117"), `Rate limited. Retry after ${retryAfter} seconds`));
            }
          }
          if (stryMutAct_9fa48("120") ? response.status !== 401 : stryMutAct_9fa48("119") ? false : stryMutAct_9fa48("118") ? true : (stryCov_9fa48("118", "119", "120"), response.status === 401)) {
            if (stryMutAct_9fa48("121")) {
              {}
            } else {
              stryCov_9fa48("121");
              throw new Error(stryMutAct_9fa48("122") ? "" : (stryCov_9fa48("122"), 'Invalid or missing API key. Please check your API key in settings.'));
            }
          }
          if (stryMutAct_9fa48("125") ? false : stryMutAct_9fa48("124") ? true : stryMutAct_9fa48("123") ? response.ok : (stryCov_9fa48("123", "124", "125"), !response.ok)) {
            if (stryMutAct_9fa48("126")) {
              {}
            } else {
              stryCov_9fa48("126");
              throw new Error(stryMutAct_9fa48("127") ? `` : (stryCov_9fa48("127"), `API request failed: ${response.status} ${response.statusText}`));
            }
          }
          const data = await response.json();

          // Store content hash for future requests
          const contentHash = response.headers.get(stryMutAct_9fa48("128") ? "" : (stryCov_9fa48("128"), 'X-Content-Hash'));
          if (stryMutAct_9fa48("130") ? false : stryMutAct_9fa48("129") ? true : (stryCov_9fa48("129", "130"), contentHash)) {
            if (stryMutAct_9fa48("131")) {
              {}
            } else {
              stryCov_9fa48("131");
              await this.setCachedHash(contentHash);
            }
          }

          // Transform API response to internal format (new extension format)
          const transformedData = this.transformExtensionApiResponse(data);

          // Cache the transformed data
          await this.setCachedData(transformedData);
          console.log(stryMutAct_9fa48("132") ? `` : (stryCov_9fa48("132"), `Fetched ${transformedData.length} labor actions (Extension format v3.0)`));
          return transformedData;
        }
      } catch (error) {
        if (stryMutAct_9fa48("133")) {
          {}
        } else {
          stryCov_9fa48("133");
          console.error(stryMutAct_9fa48("134") ? "" : (stryCov_9fa48("134"), 'Error fetching labor actions:'), error);

          // Return cached data if available, even if expired
          const cached = await this.getCachedData(stryMutAct_9fa48("135") ? false : (stryCov_9fa48("135"), true));
          if (stryMutAct_9fa48("137") ? false : stryMutAct_9fa48("136") ? true : (stryCov_9fa48("136", "137"), cached)) {
            if (stryMutAct_9fa48("138")) {
              {}
            } else {
              stryCov_9fa48("138");
              console.log(stryMutAct_9fa48("139") ? "" : (stryCov_9fa48("139"), 'Using stale cached data due to API error'));
              return cached;
            }
          }

          // Return empty array if no cache available
          return stryMutAct_9fa48("140") ? ["Stryker was here"] : (stryCov_9fa48("140"), []);
        }
      }
    }
  }

  /**
   * Transform Extension API response to internal format
   * @param {Object} extensionData - Raw extension format from API v3.0
   * @returns {Array} Transformed data for internal use
   */
  transformExtensionApiResponse(extensionData) {
    if (stryMutAct_9fa48("141")) {
      {}
    } else {
      stryCov_9fa48("141");
      if (stryMutAct_9fa48("144") ? !extensionData && typeof extensionData !== 'object' : stryMutAct_9fa48("143") ? false : stryMutAct_9fa48("142") ? true : (stryCov_9fa48("142", "143", "144"), (stryMutAct_9fa48("145") ? extensionData : (stryCov_9fa48("145"), !extensionData)) || (stryMutAct_9fa48("147") ? typeof extensionData === 'object' : stryMutAct_9fa48("146") ? false : (stryCov_9fa48("146", "147"), typeof extensionData !== (stryMutAct_9fa48("148") ? "" : (stryCov_9fa48("148"), 'object')))))) {
        if (stryMutAct_9fa48("149")) {
          {}
        } else {
          stryCov_9fa48("149");
          return stryMutAct_9fa48("150") ? ["Stryker was here"] : (stryCov_9fa48("150"), []);
        }
      }
      const actions = stryMutAct_9fa48("151") ? ["Stryker was here"] : (stryCov_9fa48("151"), []);

      // Process each organization in the extension format
      for (const [orgName, orgData] of Object.entries(extensionData)) {
        if (stryMutAct_9fa48("152")) {
          {}
        } else {
          stryCov_9fa48("152");
          // Skip the _optimizedPatterns helper object
          if (stryMutAct_9fa48("155") ? orgName !== '_optimizedPatterns' : stryMutAct_9fa48("154") ? false : stryMutAct_9fa48("153") ? true : (stryCov_9fa48("153", "154", "155"), orgName === (stryMutAct_9fa48("156") ? "" : (stryCov_9fa48("156"), '_optimizedPatterns')))) {
            if (stryMutAct_9fa48("157")) {
              {}
            } else {
              stryCov_9fa48("157");
              continue;
            }
          }

          // Extract action details with fallbacks
          const actionDetails = stryMutAct_9fa48("160") ? orgData.actionDetails && {} : stryMutAct_9fa48("159") ? false : stryMutAct_9fa48("158") ? true : (stryCov_9fa48("158", "159", "160"), orgData.actionDetails || {});
          const action = stryMutAct_9fa48("161") ? {} : (stryCov_9fa48("161"), {
            id: stryMutAct_9fa48("164") ? actionDetails.id && `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : stryMutAct_9fa48("163") ? false : stryMutAct_9fa48("162") ? true : (stryCov_9fa48("162", "163", "164"), actionDetails.id || (stryMutAct_9fa48("165") ? `` : (stryCov_9fa48("165"), `org-${Date.now()}-${stryMutAct_9fa48("166") ? Math.random().toString(36) : (stryCov_9fa48("166"), Math.random().toString(36).substr(2, 9))}`))),
            title: actionDetails.organization ? stryMutAct_9fa48("167") ? `` : (stryCov_9fa48("167"), `${stryMutAct_9fa48("170") ? actionDetails.actionType && 'Labor Action' : stryMutAct_9fa48("169") ? false : stryMutAct_9fa48("168") ? true : (stryCov_9fa48("168", "169", "170"), actionDetails.actionType || (stryMutAct_9fa48("171") ? "" : (stryCov_9fa48("171"), 'Labor Action')))}: ${actionDetails.organization}`) : stryMutAct_9fa48("172") ? `` : (stryCov_9fa48("172"), `Labor Action: ${orgName}`),
            description: stryMutAct_9fa48("175") ? actionDetails.description && 'Active labor action' : stryMutAct_9fa48("174") ? false : stryMutAct_9fa48("173") ? true : (stryCov_9fa48("173", "174", "175"), actionDetails.description || (stryMutAct_9fa48("176") ? "" : (stryCov_9fa48("176"), 'Active labor action'))),
            company: orgName,
            type: stryMutAct_9fa48("179") ? actionDetails.actionType && this.extractActionType('labor action') : stryMutAct_9fa48("178") ? false : stryMutAct_9fa48("177") ? true : (stryCov_9fa48("177", "178", "179"), actionDetails.actionType || this.extractActionType(stryMutAct_9fa48("180") ? "" : (stryCov_9fa48("180"), 'labor action'))),
            status: stryMutAct_9fa48("183") ? actionDetails.status && 'active' : stryMutAct_9fa48("182") ? false : stryMutAct_9fa48("181") ? true : (stryCov_9fa48("181", "182", "183"), actionDetails.status || (stryMutAct_9fa48("184") ? "" : (stryCov_9fa48("184"), 'active'))),
            more_info: stryMutAct_9fa48("187") ? (orgData.moreInfoUrl || actionDetails.urls?.[0]?.url) && '' : stryMutAct_9fa48("186") ? false : stryMutAct_9fa48("185") ? true : (stryCov_9fa48("185", "186", "187"), (stryMutAct_9fa48("189") ? orgData.moreInfoUrl && actionDetails.urls?.[0]?.url : stryMutAct_9fa48("188") ? false : (stryCov_9fa48("188", "189"), orgData.moreInfoUrl || (stryMutAct_9fa48("191") ? actionDetails.urls[0]?.url : stryMutAct_9fa48("190") ? actionDetails.urls?.[0].url : (stryCov_9fa48("190", "191"), actionDetails.urls?.[0]?.url)))) || (stryMutAct_9fa48("192") ? "Stryker was here!" : (stryCov_9fa48("192"), ''))),
            target_urls: (stryMutAct_9fa48("195") ? orgData.matchingUrlRegexes && [] : stryMutAct_9fa48("194") ? false : stryMutAct_9fa48("193") ? true : (stryCov_9fa48("193", "194", "195"), orgData.matchingUrlRegexes || (stryMutAct_9fa48("196") ? ["Stryker was here"] : (stryCov_9fa48("196"), [])))).map(stryMutAct_9fa48("197") ? () => undefined : (stryCov_9fa48("197"), regex => this.extractDomainFromRegex(regex))),
            locations: actionDetails.location ? stryMutAct_9fa48("198") ? [] : (stryCov_9fa48("198"), [actionDetails.location]) : stryMutAct_9fa48("199") ? ["Stryker was here"] : (stryCov_9fa48("199"), []),
            demands: stryMutAct_9fa48("202") ? actionDetails.demands && '' : stryMutAct_9fa48("201") ? false : stryMutAct_9fa48("200") ? true : (stryCov_9fa48("200", "201", "202"), actionDetails.demands || (stryMutAct_9fa48("203") ? "Stryker was here!" : (stryCov_9fa48("203"), ''))),
            startDate: stryMutAct_9fa48("206") ? (orgData.startTime || actionDetails.startDate) && '' : stryMutAct_9fa48("205") ? false : stryMutAct_9fa48("204") ? true : (stryCov_9fa48("204", "205", "206"), (stryMutAct_9fa48("208") ? orgData.startTime && actionDetails.startDate : stryMutAct_9fa48("207") ? false : (stryCov_9fa48("207", "208"), orgData.startTime || actionDetails.startDate)) || (stryMutAct_9fa48("209") ? "Stryker was here!" : (stryCov_9fa48("209"), ''))),
            endDate: stryMutAct_9fa48("212") ? (orgData.endTime || actionDetails.endDate) && '' : stryMutAct_9fa48("211") ? false : stryMutAct_9fa48("210") ? true : (stryCov_9fa48("210", "211", "212"), (stryMutAct_9fa48("214") ? orgData.endTime && actionDetails.endDate : stryMutAct_9fa48("213") ? false : (stryCov_9fa48("213", "214"), orgData.endTime || actionDetails.endDate)) || (stryMutAct_9fa48("215") ? "Stryker was here!" : (stryCov_9fa48("215"), ''))),
            contactInfo: stryMutAct_9fa48("218") ? actionDetails.contactInfo && '' : stryMutAct_9fa48("217") ? false : stryMutAct_9fa48("216") ? true : (stryCov_9fa48("216", "217", "218"), actionDetails.contactInfo || (stryMutAct_9fa48("219") ? "Stryker was here!" : (stryCov_9fa48("219"), ''))),
            logoUrl: stryMutAct_9fa48("222") ? (actionDetails.logoUrl || actionDetails.unionImageUrl) && '' : stryMutAct_9fa48("221") ? false : stryMutAct_9fa48("220") ? true : (stryCov_9fa48("220", "221", "222"), (stryMutAct_9fa48("224") ? actionDetails.logoUrl && actionDetails.unionImageUrl : stryMutAct_9fa48("223") ? false : (stryCov_9fa48("223", "224"), actionDetails.logoUrl || actionDetails.unionImageUrl)) || (stryMutAct_9fa48("225") ? "Stryker was here!" : (stryCov_9fa48("225"), ''))),
            divisions: stryMutAct_9fa48("226") ? ["Stryker was here"] : (stryCov_9fa48("226"), []),
            actionResources: stryMutAct_9fa48("229") ? actionDetails.urls && [] : stryMutAct_9fa48("228") ? false : stryMutAct_9fa48("227") ? true : (stryCov_9fa48("227", "228", "229"), actionDetails.urls || (stryMutAct_9fa48("230") ? ["Stryker was here"] : (stryCov_9fa48("230"), []))),
            // Store original extension data for advanced matching
            _extensionData: orgData
          });
          actions.push(action);
        }
      }
      return actions;
    }
  }

  /**
   * Extract domain from regex pattern
   * @param {string} regex - URL matching regex
   * @returns {string} Extracted domain
   */
  extractDomainFromRegex(regex) {
    if (stryMutAct_9fa48("231")) {
      {}
    } else {
      stryCov_9fa48("231");
      // Simple extraction - remove common regex chars to get domain
      return regex.replace(stryMutAct_9fa48("232") ? /[^\\^$*+?.()|[\]{}]/g : (stryCov_9fa48("232"), /[\\^$*+?.()|[\]{}]/g), stryMutAct_9fa48("233") ? "Stryker was here!" : (stryCov_9fa48("233"), '')).replace(stryMutAct_9fa48("234") ? /\.com./ : (stryCov_9fa48("234"), /\.com.*/), stryMutAct_9fa48("235") ? "" : (stryCov_9fa48("235"), '.com'));
    }
  }

  /**
   * Extract action type from reason string
   * @param {string} reason - Reason string from API
   * @returns {string} Action type
   */
  extractActionType(reason) {
    if (stryMutAct_9fa48("236")) {
      {}
    } else {
      stryCov_9fa48("236");
      if (stryMutAct_9fa48("239") ? false : stryMutAct_9fa48("238") ? true : stryMutAct_9fa48("237") ? reason : (stryCov_9fa48("237", "238", "239"), !reason)) return stryMutAct_9fa48("240") ? "" : (stryCov_9fa48("240"), 'labor_action');
      const lowerReason = stryMutAct_9fa48("241") ? reason.toUpperCase() : (stryCov_9fa48("241"), reason.toLowerCase());
      if (stryMutAct_9fa48("243") ? false : stryMutAct_9fa48("242") ? true : (stryCov_9fa48("242", "243"), lowerReason.includes(stryMutAct_9fa48("244") ? "" : (stryCov_9fa48("244"), 'strike')))) return stryMutAct_9fa48("245") ? "" : (stryCov_9fa48("245"), 'strike');
      if (stryMutAct_9fa48("247") ? false : stryMutAct_9fa48("246") ? true : (stryCov_9fa48("246", "247"), lowerReason.includes(stryMutAct_9fa48("248") ? "" : (stryCov_9fa48("248"), 'boycott')))) return stryMutAct_9fa48("249") ? "" : (stryCov_9fa48("249"), 'boycott');
      if (stryMutAct_9fa48("251") ? false : stryMutAct_9fa48("250") ? true : (stryCov_9fa48("250", "251"), lowerReason.includes(stryMutAct_9fa48("252") ? "" : (stryCov_9fa48("252"), 'picket')))) return stryMutAct_9fa48("253") ? "" : (stryCov_9fa48("253"), 'picket');
      if (stryMutAct_9fa48("255") ? false : stryMutAct_9fa48("254") ? true : (stryCov_9fa48("254", "255"), lowerReason.includes(stryMutAct_9fa48("256") ? "" : (stryCov_9fa48("256"), 'protest')))) return stryMutAct_9fa48("257") ? "" : (stryCov_9fa48("257"), 'protest');
      return stryMutAct_9fa48("258") ? "" : (stryCov_9fa48("258"), 'labor_action');
    }
  }

  /**
   * Parse URL safely
   * @param {string} urlString - URL string
   * @returns {URL|null} Parsed URL or null
   */
  parseUrl(urlString) {
    if (stryMutAct_9fa48("259")) {
      {}
    } else {
      stryCov_9fa48("259");
      try {
        if (stryMutAct_9fa48("260")) {
          {}
        } else {
          stryCov_9fa48("260");
          return new URL(urlString);
        }
      } catch (e) {
        if (stryMutAct_9fa48("261")) {
          {}
        } else {
          stryCov_9fa48("261");
          // If URL doesn't have protocol, try adding https://
          try {
            if (stryMutAct_9fa48("262")) {
              {}
            } else {
              stryCov_9fa48("262");
              return new URL((stryMutAct_9fa48("263") ? "" : (stryCov_9fa48("263"), 'https://')) + urlString);
            }
          } catch (e2) {
            if (stryMutAct_9fa48("264")) {
              {}
            } else {
              stryCov_9fa48("264");
              console.warn(stryMutAct_9fa48("265") ? "" : (stryCov_9fa48("265"), 'Failed to parse URL:'), urlString);
              return null;
            }
          }
        }
      }
    }
  }

  /**
   * Get cached data from storage
   * @param {boolean} ignoreExpiry - Whether to ignore cache expiry
   * @returns {Promise<Array|null>}
   */
  async getCachedData(ignoreExpiry = stryMutAct_9fa48("266") ? true : (stryCov_9fa48("266"), false)) {
    if (stryMutAct_9fa48("267")) {
      {}
    } else {
      stryCov_9fa48("267");
      return new Promise(resolve => {
        if (stryMutAct_9fa48("268")) {
          {}
        } else {
          stryCov_9fa48("268");
          chrome.storage.local.get(stryMutAct_9fa48("269") ? [] : (stryCov_9fa48("269"), [CACHE_KEY, stryMutAct_9fa48("270") ? "" : (stryCov_9fa48("270"), 'cache_timestamp')]), result => {
            if (stryMutAct_9fa48("271")) {
              {}
            } else {
              stryCov_9fa48("271");
              const cached = result[CACHE_KEY];
              const timestamp = result.cache_timestamp;
              if (stryMutAct_9fa48("274") ? !cached && !timestamp : stryMutAct_9fa48("273") ? false : stryMutAct_9fa48("272") ? true : (stryCov_9fa48("272", "273", "274"), (stryMutAct_9fa48("275") ? cached : (stryCov_9fa48("275"), !cached)) || (stryMutAct_9fa48("276") ? timestamp : (stryCov_9fa48("276"), !timestamp)))) {
                if (stryMutAct_9fa48("277")) {
                  {}
                } else {
                  stryCov_9fa48("277");
                  resolve(null);
                  return;
                }
              }
              const now = Date.now();
              const age = stryMutAct_9fa48("278") ? now + timestamp : (stryCov_9fa48("278"), now - timestamp);
              if (stryMutAct_9fa48("281") ? !ignoreExpiry || age > CACHE_DURATION : stryMutAct_9fa48("280") ? false : stryMutAct_9fa48("279") ? true : (stryCov_9fa48("279", "280", "281"), (stryMutAct_9fa48("282") ? ignoreExpiry : (stryCov_9fa48("282"), !ignoreExpiry)) && (stryMutAct_9fa48("285") ? age <= CACHE_DURATION : stryMutAct_9fa48("284") ? age >= CACHE_DURATION : stryMutAct_9fa48("283") ? true : (stryCov_9fa48("283", "284", "285"), age > CACHE_DURATION)))) {
                if (stryMutAct_9fa48("286")) {
                  {}
                } else {
                  stryCov_9fa48("286");
                  resolve(null);
                  return;
                }
              }
              resolve(cached);
            }
          });
        }
      });
    }
  }

  /**
   * Cache data in storage
   * @param {Array} data - Labor actions data to cache
   */
  async setCachedData(data) {
    if (stryMutAct_9fa48("287")) {
      {}
    } else {
      stryCov_9fa48("287");
      return new Promise(resolve => {
        if (stryMutAct_9fa48("288")) {
          {}
        } else {
          stryCov_9fa48("288");
          chrome.storage.local.set(stryMutAct_9fa48("289") ? {} : (stryCov_9fa48("289"), {
            [CACHE_KEY]: data,
            cache_timestamp: Date.now()
          }), resolve);
        }
      });
    }
  }

  /**
   * Clear cached data
   */
  async clearCache() {
    if (stryMutAct_9fa48("290")) {
      {}
    } else {
      stryCov_9fa48("290");
      return new Promise(resolve => {
        if (stryMutAct_9fa48("291")) {
          {}
        } else {
          stryCov_9fa48("291");
          chrome.storage.local.remove(stryMutAct_9fa48("292") ? [] : (stryCov_9fa48("292"), [CACHE_KEY, stryMutAct_9fa48("293") ? "" : (stryCov_9fa48("293"), 'cache_timestamp'), CACHE_HASH_KEY]), resolve);
        }
      });
    }
  }

  /**
   * Get cached content hash
   * @returns {Promise<string|null>}
   */
  async getCachedHash() {
    if (stryMutAct_9fa48("294")) {
      {}
    } else {
      stryCov_9fa48("294");
      return new Promise(resolve => {
        if (stryMutAct_9fa48("295")) {
          {}
        } else {
          stryCov_9fa48("295");
          chrome.storage.local.get(stryMutAct_9fa48("296") ? [] : (stryCov_9fa48("296"), [CACHE_HASH_KEY]), result => {
            if (stryMutAct_9fa48("297")) {
              {}
            } else {
              stryCov_9fa48("297");
              resolve(stryMutAct_9fa48("300") ? result[CACHE_HASH_KEY] && null : stryMutAct_9fa48("299") ? false : stryMutAct_9fa48("298") ? true : (stryCov_9fa48("298", "299", "300"), result[CACHE_HASH_KEY] || null));
            }
          });
        }
      });
    }
  }

  /**
   * Set cached content hash
   * @param {string} hash - Content hash from API
   */
  async setCachedHash(hash) {
    if (stryMutAct_9fa48("301")) {
      {}
    } else {
      stryCov_9fa48("301");
      return new Promise(resolve => {
        if (stryMutAct_9fa48("302")) {
          {}
        } else {
          stryCov_9fa48("302");
          chrome.storage.local.set(stryMutAct_9fa48("303") ? {} : (stryCov_9fa48("303"), {
            [CACHE_HASH_KEY]: hash
          }), resolve);
        }
      });
    }
  }
}

// Additional obfuscation layers and anti-tampering measures
(function () {
  if (stryMutAct_9fa48("304")) {
    {}
  } else {
    stryCov_9fa48("304");
    // Detect common debugging techniques
    const _antiDebug = stryMutAct_9fa48("305") ? {} : (stryCov_9fa48("305"), {
      checkDevTools: function () {
        if (stryMutAct_9fa48("306")) {
          {}
        } else {
          stryCov_9fa48("306");
          const start = Date.now();
          debugger; // This will cause delay if dev tools are open
          const duration = stryMutAct_9fa48("307") ? Date.now() + start : (stryCov_9fa48("307"), Date.now() - start);
          return stryMutAct_9fa48("311") ? duration >= 100 : stryMutAct_9fa48("310") ? duration <= 100 : stryMutAct_9fa48("309") ? false : stryMutAct_9fa48("308") ? true : (stryCov_9fa48("308", "309", "310", "311"), duration < 100);
        }
      },
      checkConsole: function () {
        if (stryMutAct_9fa48("312")) {
          {}
        } else {
          stryCov_9fa48("312");
          let devtools = stryMutAct_9fa48("313") ? true : (stryCov_9fa48("313"), false);
          const _console = console;
          Object.defineProperty(console, stryMutAct_9fa48("314") ? "" : (stryCov_9fa48("314"), '_commandLineAPI'), stryMutAct_9fa48("315") ? {} : (stryCov_9fa48("315"), {
            get: function () {
              if (stryMutAct_9fa48("316")) {
                {}
              } else {
                stryCov_9fa48("316");
                devtools = stryMutAct_9fa48("317") ? false : (stryCov_9fa48("317"), true);
                return _console;
              }
            }
          }));
          return stryMutAct_9fa48("318") ? () => undefined : (stryCov_9fa48("318"), () => devtools);
        }
      },
      detectVM: function () {
        if (stryMutAct_9fa48("319")) {
          {}
        } else {
          stryCov_9fa48("319");
          // Simple VM detection
          const canvas = document.createElement(stryMutAct_9fa48("320") ? "" : (stryCov_9fa48("320"), 'canvas'));
          const gl = canvas.getContext(stryMutAct_9fa48("321") ? "" : (stryCov_9fa48("321"), 'webgl'));
          const debugInfo = gl ? gl.getExtension(stryMutAct_9fa48("322") ? "" : (stryCov_9fa48("322"), 'WEBGL_debug_renderer_info')) : null;
          if (stryMutAct_9fa48("324") ? false : stryMutAct_9fa48("323") ? true : (stryCov_9fa48("323", "324"), debugInfo)) {
            if (stryMutAct_9fa48("325")) {
              {}
            } else {
              stryCov_9fa48("325");
              const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
              const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
              return stryMutAct_9fa48("328") ? !vendor.includes('VMware') || !renderer.includes('VMware') : stryMutAct_9fa48("327") ? false : stryMutAct_9fa48("326") ? true : (stryCov_9fa48("326", "327", "328"), (stryMutAct_9fa48("329") ? vendor.includes('VMware') : (stryCov_9fa48("329"), !vendor.includes(stryMutAct_9fa48("330") ? "" : (stryCov_9fa48("330"), 'VMware')))) && (stryMutAct_9fa48("331") ? renderer.includes('VMware') : (stryCov_9fa48("331"), !renderer.includes(stryMutAct_9fa48("332") ? "" : (stryCov_9fa48("332"), 'VMware')))));
            }
          }
          return stryMutAct_9fa48("333") ? false : (stryCov_9fa48("333"), true);
        }
      }
    });

    // Integrity verification for critical functions
    const _verifyIntegrity = function () {
      if (stryMutAct_9fa48("334")) {
        {}
      } else {
        stryCov_9fa48("334");
        const criticalFunctions = stryMutAct_9fa48("335") ? [] : (stryCov_9fa48("335"), [_assembleKey, _getObfuscatedKey, _validateEnvironment]);
        for (const func of criticalFunctions) {
          if (stryMutAct_9fa48("336")) {
            {}
          } else {
            stryCov_9fa48("336");
            const funcStr = func.toString();
            if (stryMutAct_9fa48("339") ? funcStr.includes('debugger') && funcStr.includes('console.log') : stryMutAct_9fa48("338") ? false : stryMutAct_9fa48("337") ? true : (stryCov_9fa48("337", "338", "339"), funcStr.includes(stryMutAct_9fa48("340") ? "" : (stryCov_9fa48("340"), 'debugger')) || funcStr.includes(stryMutAct_9fa48("341") ? "" : (stryCov_9fa48("341"), 'console.log')))) {
              if (stryMutAct_9fa48("342")) {
                {}
              } else {
                stryCov_9fa48("342");
                return stryMutAct_9fa48("343") ? true : (stryCov_9fa48("343"), false);
              }
            }
          }
        }
        return stryMutAct_9fa48("344") ? false : (stryCov_9fa48("344"), true);
      }
    };

    // Dynamic key rotation (theoretical - would need backend support)
    const _keyRotation = stryMutAct_9fa48("345") ? {} : (stryCov_9fa48("345"), {
      lastRotation: Date.now(),
      rotationInterval: stryMutAct_9fa48("346") ? 24 * 60 * 60 / 1000 : (stryCov_9fa48("346"), (stryMutAct_9fa48("347") ? 24 * 60 / 60 : (stryCov_9fa48("347"), (stryMutAct_9fa48("348") ? 24 / 60 : (stryCov_9fa48("348"), 24 * 60)) * 60)) * 1000),
      // 24 hours

      shouldRotate: function () {
        if (stryMutAct_9fa48("349")) {
          {}
        } else {
          stryCov_9fa48("349");
          return stryMutAct_9fa48("353") ? Date.now() - this.lastRotation <= this.rotationInterval : stryMutAct_9fa48("352") ? Date.now() - this.lastRotation >= this.rotationInterval : stryMutAct_9fa48("351") ? false : stryMutAct_9fa48("350") ? true : (stryCov_9fa48("350", "351", "352", "353"), (stryMutAct_9fa48("354") ? Date.now() + this.lastRotation : (stryCov_9fa48("354"), Date.now() - this.lastRotation)) > this.rotationInterval);
        }
      },
      // Placeholder for future key rotation implementation
      rotateKey: function () {
        if (stryMutAct_9fa48("355")) {
          {}
        } else {
          stryCov_9fa48("355");
          if (stryMutAct_9fa48("357") ? false : stryMutAct_9fa48("356") ? true : (stryCov_9fa48("356", "357"), this.shouldRotate())) {
            if (stryMutAct_9fa48("358")) {
              {}
            } else {
              stryCov_9fa48("358");
              console.log(stryMutAct_9fa48("359") ? "" : (stryCov_9fa48("359"), 'Key rotation would occur here'));
              this.lastRotation = Date.now();
            }
          }
        }
      }
    });

    // Obfuscate global access
    if (stryMutAct_9fa48("362") ? typeof window === 'undefined' : stryMutAct_9fa48("361") ? false : stryMutAct_9fa48("360") ? true : (stryCov_9fa48("360", "361", "362"), typeof window !== (stryMutAct_9fa48("363") ? "" : (stryCov_9fa48("363"), 'undefined')))) {
      if (stryMutAct_9fa48("364")) {
        {}
      } else {
        stryCov_9fa48("364");
        Object.defineProperty(window, stryMutAct_9fa48("365") ? "" : (stryCov_9fa48("365"), '_oplObfuscated'), stryMutAct_9fa48("366") ? {} : (stryCov_9fa48("366"), {
          value: stryMutAct_9fa48("367") ? false : (stryCov_9fa48("367"), true),
          writable: stryMutAct_9fa48("368") ? true : (stryCov_9fa48("368"), false),
          enumerable: stryMutAct_9fa48("369") ? true : (stryCov_9fa48("369"), false),
          configurable: stryMutAct_9fa48("370") ? true : (stryCov_9fa48("370"), false)
        }));
      }
    }

    // Self-verification on load
    setTimeout(() => {
      if (stryMutAct_9fa48("371")) {
        {}
      } else {
        stryCov_9fa48("371");
        if (stryMutAct_9fa48("374") ? !_verifyIntegrity() && !_antiDebug.detectVM() : stryMutAct_9fa48("373") ? false : stryMutAct_9fa48("372") ? true : (stryCov_9fa48("372", "373", "374"), (stryMutAct_9fa48("375") ? _verifyIntegrity() : (stryCov_9fa48("375"), !_verifyIntegrity())) || (stryMutAct_9fa48("376") ? _antiDebug.detectVM() : (stryCov_9fa48("376"), !_antiDebug.detectVM())))) {
          if (stryMutAct_9fa48("377")) {
            {}
          } else {
            stryCov_9fa48("377");
            console.warn(stryMutAct_9fa48("378") ? "" : (stryCov_9fa48("378"), 'Security verification failed - functionality may be limited'));
          }
        }
      }
    }, stryMutAct_9fa48("379") ? Math.random() / 1000 : (stryCov_9fa48("379"), Math.random() * 1000));
  }
})();

// Export for use in other scripts
if (stryMutAct_9fa48("382") ? typeof module !== 'undefined' || module.exports : stryMutAct_9fa48("381") ? false : stryMutAct_9fa48("380") ? true : (stryCov_9fa48("380", "381", "382"), (stryMutAct_9fa48("384") ? typeof module === 'undefined' : stryMutAct_9fa48("383") ? true : (stryCov_9fa48("383", "384"), typeof module !== (stryMutAct_9fa48("385") ? "" : (stryCov_9fa48("385"), 'undefined')))) && module.exports)) {
  if (stryMutAct_9fa48("386")) {
    {}
  } else {
    stryCov_9fa48("386");
    module.exports = ApiService;
  }
}