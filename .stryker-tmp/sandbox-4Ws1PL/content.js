// @ts-nocheck
// Content script - runs on all pages
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
(function () {
  if (stryMutAct_9fa48("731")) {
    {}
  } else {
    stryCov_9fa48("731");
    let currentBanner = null;

    /**
     * Check if current page matches any labor actions
     */
    function checkCurrentPage() {
      if (stryMutAct_9fa48("732")) {
        {}
      } else {
        stryCov_9fa48("732");
        // Check if user has bypassed the block
        if (stryMutAct_9fa48("735") ? sessionStorage.getItem('opl_bypass') !== 'true' : stryMutAct_9fa48("734") ? false : stryMutAct_9fa48("733") ? true : (stryCov_9fa48("733", "734", "735"), sessionStorage.getItem(stryMutAct_9fa48("736") ? "" : (stryCov_9fa48("736"), 'opl_bypass')) === (stryMutAct_9fa48("737") ? "" : (stryCov_9fa48("737"), 'true')))) {
          if (stryMutAct_9fa48("738")) {
            {}
          } else {
            stryCov_9fa48("738");
            return;
          }
        }
        chrome.runtime.sendMessage(stryMutAct_9fa48("739") ? {} : (stryCov_9fa48("739"), {
          action: stryMutAct_9fa48("740") ? "" : (stryCov_9fa48("740"), 'checkUrl'),
          url: window.location.href
        }), response => {
          if (stryMutAct_9fa48("741")) {
            {}
          } else {
            stryCov_9fa48("741");
            if (stryMutAct_9fa48("743") ? false : stryMutAct_9fa48("742") ? true : (stryCov_9fa48("742", "743"), response)) {
              if (stryMutAct_9fa48("744")) {
                {}
              } else {
                stryCov_9fa48("744");
                if (stryMutAct_9fa48("746") ? false : stryMutAct_9fa48("745") ? true : (stryCov_9fa48("745", "746"), response.bypass)) {
                  if (stryMutAct_9fa48("747")) {
                    {}
                  } else {
                    stryCov_9fa48("747");
                    // User just bypassed the block page, set session flag
                    sessionStorage.setItem(stryMutAct_9fa48("748") ? "" : (stryCov_9fa48("748"), 'opl_bypass'), stryMutAct_9fa48("749") ? "" : (stryCov_9fa48("749"), 'true'));
                    return;
                  }
                }
                if (stryMutAct_9fa48("751") ? false : stryMutAct_9fa48("750") ? true : (stryCov_9fa48("750", "751"), response.match)) {
                  if (stryMutAct_9fa48("752")) {
                    {}
                  } else {
                    stryCov_9fa48("752");
                    if (stryMutAct_9fa48("754") ? false : stryMutAct_9fa48("753") ? true : (stryCov_9fa48("753", "754"), response.blockMode)) {
                      if (stryMutAct_9fa48("755")) {
                        {}
                      } else {
                        stryCov_9fa48("755");
                        blockPage(response.match);
                      }
                    } else {
                      if (stryMutAct_9fa48("756")) {
                        {}
                      } else {
                        stryCov_9fa48("756");
                        showBanner(response.match);
                      }
                    }
                  }
                }
              }
            }
          }
        });
      }
    }

    /**
     * Show banner with labor action information
     * @param {Object} action - Labor action data
     */
    function showBanner(action) {
      if (stryMutAct_9fa48("757")) {
        {}
      } else {
        stryCov_9fa48("757");
        // Remove existing banner if any
        if (stryMutAct_9fa48("759") ? false : stryMutAct_9fa48("758") ? true : (stryCov_9fa48("758", "759"), currentBanner)) {
          if (stryMutAct_9fa48("760")) {
            {}
          } else {
            stryCov_9fa48("760");
            currentBanner.remove();
          }
        }

        // Create banner element
        const banner = document.createElement(stryMutAct_9fa48("761") ? "" : (stryCov_9fa48("761"), 'div'));
        banner.id = stryMutAct_9fa48("762") ? "" : (stryCov_9fa48("762"), 'opl-labor-banner');
        banner.className = stryMutAct_9fa48("763") ? "" : (stryCov_9fa48("763"), 'opl-banner');
        const title = stryMutAct_9fa48("766") ? action.title && 'Labor Action in Progress' : stryMutAct_9fa48("765") ? false : stryMutAct_9fa48("764") ? true : (stryCov_9fa48("764", "765", "766"), action.title || (stryMutAct_9fa48("767") ? "" : (stryCov_9fa48("767"), 'Labor Action in Progress')));
        const description = stryMutAct_9fa48("770") ? action.description && 'This company is currently subject to a labor action.' : stryMutAct_9fa48("769") ? false : stryMutAct_9fa48("768") ? true : (stryCov_9fa48("768", "769", "770"), action.description || (stryMutAct_9fa48("771") ? "" : (stryCov_9fa48("771"), 'This company is currently subject to a labor action.')));
        const actionType = stryMutAct_9fa48("774") ? action.type && 'strike' : stryMutAct_9fa48("773") ? false : stryMutAct_9fa48("772") ? true : (stryCov_9fa48("772", "773", "774"), action.type || (stryMutAct_9fa48("775") ? "" : (stryCov_9fa48("775"), 'strike')));
        const moreInfoUrl = stryMutAct_9fa48("778") ? (action.url || action.more_info) && '' : stryMutAct_9fa48("777") ? false : stryMutAct_9fa48("776") ? true : (stryCov_9fa48("776", "777", "778"), (stryMutAct_9fa48("780") ? action.url && action.more_info : stryMutAct_9fa48("779") ? false : (stryCov_9fa48("779", "780"), action.url || action.more_info)) || (stryMutAct_9fa48("781") ? "Stryker was here!" : (stryCov_9fa48("781"), '')));
        const logoUrl = stryMutAct_9fa48("784") ? action.logoUrl && '' : stryMutAct_9fa48("783") ? false : stryMutAct_9fa48("782") ? true : (stryCov_9fa48("782", "783", "784"), action.logoUrl || (stryMutAct_9fa48("785") ? "Stryker was here!" : (stryCov_9fa48("785"), '')));

        // Construct details string
        let details = stryMutAct_9fa48("786") ? ["Stryker was here"] : (stryCov_9fa48("786"), []);
        if (stryMutAct_9fa48("789") ? action.locations || action.locations.length > 0 : stryMutAct_9fa48("788") ? false : stryMutAct_9fa48("787") ? true : (stryCov_9fa48("787", "788", "789"), action.locations && (stryMutAct_9fa48("792") ? action.locations.length <= 0 : stryMutAct_9fa48("791") ? action.locations.length >= 0 : stryMutAct_9fa48("790") ? true : (stryCov_9fa48("790", "791", "792"), action.locations.length > 0)))) details.push(action.locations[0]);
        if (stryMutAct_9fa48("794") ? false : stryMutAct_9fa48("793") ? true : (stryCov_9fa48("793", "794"), action.startDate)) details.push(stryMutAct_9fa48("795") ? `` : (stryCov_9fa48("795"), `Since ${new Date(action.startDate).toLocaleDateString()}`));
        const detailsHtml = (stryMutAct_9fa48("799") ? details.length <= 0 : stryMutAct_9fa48("798") ? details.length >= 0 : stryMutAct_9fa48("797") ? false : stryMutAct_9fa48("796") ? true : (stryCov_9fa48("796", "797", "798", "799"), details.length > 0)) ? stryMutAct_9fa48("800") ? `` : (stryCov_9fa48("800"), `<p class="opl-banner-details" style="font-size: 0.8em; opacity: 0.9; margin-top: 2px;">${details.join(stryMutAct_9fa48("801") ? "" : (stryCov_9fa48("801"), ' • '))}</p>`) : stryMutAct_9fa48("802") ? "Stryker was here!" : (stryCov_9fa48("802"), '');

        // Build logo HTML if available
        const logoHtml = logoUrl ? stryMutAct_9fa48("803") ? `` : (stryCov_9fa48("803"), `<img src="${escapeHtml(logoUrl)}" alt="Union logo" class="opl-banner-logo" />`) : stryMutAct_9fa48("804") ? `` : (stryCov_9fa48("804"), `<div class="opl-banner-icon">⚠️</div>`);
        banner.innerHTML = stryMutAct_9fa48("805") ? `` : (stryCov_9fa48("805"), `
      <div class="opl-banner-content">
        ${logoHtml}
        <div class="opl-banner-text">
          <strong class="opl-banner-title">${escapeHtml(title)}</strong>
          <p class="opl-banner-description">${escapeHtml(description)}</p>
          ${detailsHtml}
          <div class="opl-banner-links" style="margin-top: 4px;">
            ${moreInfoUrl ? stryMutAct_9fa48("806") ? `` : (stryCov_9fa48("806"), `<a href="${escapeHtml(moreInfoUrl)}" target="_blank" class="opl-banner-link">Learn More</a><span style="margin: 0 5px; opacity: 0.5;">|</span>`) : stryMutAct_9fa48("807") ? "Stryker was here!" : (stryCov_9fa48("807"), '')}
            <a href="https://onlinepicketline.com" target="_blank" class="opl-banner-link" style="font-size: 0.8em; opacity: 0.8;">Online Picket Line - OPL</a>
          </div>
        </div>
        <button class="opl-banner-close" aria-label="Close banner">×</button>
      </div>
    `);

        // Add close button functionality
        const closeBtn = banner.querySelector(stryMutAct_9fa48("808") ? "" : (stryCov_9fa48("808"), '.opl-banner-close'));
        closeBtn.addEventListener(stryMutAct_9fa48("809") ? "" : (stryCov_9fa48("809"), 'click'), () => {
          if (stryMutAct_9fa48("810")) {
            {}
          } else {
            stryCov_9fa48("810");
            banner.remove();
            currentBanner = null;
          }
        });

        // Append to body
        document.body.appendChild(banner);
        currentBanner = banner;

        // Animate in
        setTimeout(() => {
          if (stryMutAct_9fa48("811")) {
            {}
          } else {
            stryCov_9fa48("811");
            banner.classList.add(stryMutAct_9fa48("812") ? "" : (stryCov_9fa48("812"), 'opl-banner-visible'));
          }
        }, 100);
      }
    }

    /**
     * Block the page and redirect to block page
     * @param {Object} action - Labor action data
     */
    function blockPage(action) {
      if (stryMutAct_9fa48("813")) {
        {}
      } else {
        stryCov_9fa48("813");
        // Send data to background script to store for the block page
        // We use background storage because sessionStorage is not shared between origins
        chrome.runtime.sendMessage(stryMutAct_9fa48("814") ? {} : (stryCov_9fa48("814"), {
          action: stryMutAct_9fa48("815") ? "" : (stryCov_9fa48("815"), 'setBlockedState'),
          data: action,
          url: window.location.href
        }), () => {
          if (stryMutAct_9fa48("816")) {
            {}
          } else {
            stryCov_9fa48("816");
            // Redirect to block page after data is saved
            const blockPageUrl = chrome.runtime.getURL(stryMutAct_9fa48("817") ? "" : (stryCov_9fa48("817"), 'block.html'));
            window.location.href = blockPageUrl;
          }
        });
      }
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
      if (stryMutAct_9fa48("818")) {
        {}
      } else {
        stryCov_9fa48("818");
        const div = document.createElement(stryMutAct_9fa48("819") ? "" : (stryCov_9fa48("819"), 'div'));
        div.textContent = text;
        return div.innerHTML;
      }
    }

    // Check page when content script loads
    if (stryMutAct_9fa48("822") ? document.readyState !== 'loading' : stryMutAct_9fa48("821") ? false : stryMutAct_9fa48("820") ? true : (stryCov_9fa48("820", "821", "822"), document.readyState === (stryMutAct_9fa48("823") ? "" : (stryCov_9fa48("823"), 'loading')))) {
      if (stryMutAct_9fa48("824")) {
        {}
      } else {
        stryCov_9fa48("824");
        document.addEventListener(stryMutAct_9fa48("825") ? "" : (stryCov_9fa48("825"), 'DOMContentLoaded'), checkCurrentPage);
      }
    } else {
      if (stryMutAct_9fa48("826")) {
        {}
      } else {
        stryCov_9fa48("826");
        checkCurrentPage();
      }
    }

    // Listen for URL changes in SPAs using a more efficient approach
    // Only monitor for history state changes rather than all DOM mutations
    let lastUrl = window.location.href;

    // Modern approach: use popstate for history changes
    window.addEventListener(stryMutAct_9fa48("827") ? "" : (stryCov_9fa48("827"), 'popstate'), () => {
      if (stryMutAct_9fa48("828")) {
        {}
      } else {
        stryCov_9fa48("828");
        if (stryMutAct_9fa48("831") ? window.location.href === lastUrl : stryMutAct_9fa48("830") ? false : stryMutAct_9fa48("829") ? true : (stryCov_9fa48("829", "830", "831"), window.location.href !== lastUrl)) {
          if (stryMutAct_9fa48("832")) {
            {}
          } else {
            stryCov_9fa48("832");
            lastUrl = window.location.href;
            checkCurrentPage();
          }
        }
      }
    });

    // Also monitor pushState and replaceState for SPAs
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function () {
      if (stryMutAct_9fa48("833")) {
        {}
      } else {
        stryCov_9fa48("833");
        originalPushState.apply(this, arguments);
        if (stryMutAct_9fa48("836") ? window.location.href === lastUrl : stryMutAct_9fa48("835") ? false : stryMutAct_9fa48("834") ? true : (stryCov_9fa48("834", "835", "836"), window.location.href !== lastUrl)) {
          if (stryMutAct_9fa48("837")) {
            {}
          } else {
            stryCov_9fa48("837");
            lastUrl = window.location.href;
            checkCurrentPage();
          }
        }
      }
    };
    history.replaceState = function () {
      if (stryMutAct_9fa48("838")) {
        {}
      } else {
        stryCov_9fa48("838");
        originalReplaceState.apply(this, arguments);
        if (stryMutAct_9fa48("841") ? window.location.href === lastUrl : stryMutAct_9fa48("840") ? false : stryMutAct_9fa48("839") ? true : (stryCov_9fa48("839", "840", "841"), window.location.href !== lastUrl)) {
          if (stryMutAct_9fa48("842")) {
            {}
          } else {
            stryCov_9fa48("842");
            lastUrl = window.location.href;
            checkCurrentPage();
          }
        }
      }
    };
  }
})();