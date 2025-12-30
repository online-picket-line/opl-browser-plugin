// @ts-nocheck
// Background service worker
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
importScripts(stryMutAct_9fa48("387") ? "" : (stryCov_9fa48("387"), 'browser-polyfill.js'));
importScripts(stryMutAct_9fa48("388") ? "" : (stryCov_9fa48("388"), 'api-service.js'));
const apiService = new ApiService();
const allowedBypasses = new Map(); // tabId -> url
// We use chrome.storage.local for blocked states to persist across service worker restarts
// Key format: blocked_tab_${tabId}

// Refresh labor actions on installation and periodically
chrome.runtime.onInstalled.addListener(async () => {
  if (stryMutAct_9fa48("389")) {
    {}
  } else {
    stryCov_9fa48("389");
    console.log(stryMutAct_9fa48("390") ? "" : (stryCov_9fa48("390"), 'Extension installed, fetching labor actions...'));
    await refreshLaborActions();

    // Set default settings
    chrome.storage.sync.get(stryMutAct_9fa48("391") ? [] : (stryCov_9fa48("391"), [stryMutAct_9fa48("392") ? "" : (stryCov_9fa48("392"), 'blockMode')]), result => {
      if (stryMutAct_9fa48("393")) {
        {}
      } else {
        stryCov_9fa48("393");
        if (stryMutAct_9fa48("396") ? result.blockMode !== undefined : stryMutAct_9fa48("395") ? false : stryMutAct_9fa48("394") ? true : (stryCov_9fa48("394", "395", "396"), result.blockMode === undefined)) {
          if (stryMutAct_9fa48("397")) {
            {}
          } else {
            stryCov_9fa48("397");
            chrome.storage.sync.set(stryMutAct_9fa48("398") ? {} : (stryCov_9fa48("398"), {
              blockMode: stryMutAct_9fa48("399") ? true : (stryCov_9fa48("399"), false)
            })); // Default to banner mode
          }
        }
      }
    });
  }
});
chrome.alarms.onAlarm.addListener(alarm => {
  if (stryMutAct_9fa48("400")) {
    {}
  } else {
    stryCov_9fa48("400");
    if (stryMutAct_9fa48("403") ? alarm.name !== 'refreshLaborActions' : stryMutAct_9fa48("402") ? false : stryMutAct_9fa48("401") ? true : (stryCov_9fa48("401", "402", "403"), alarm.name === (stryMutAct_9fa48("404") ? "" : (stryCov_9fa48("404"), 'refreshLaborActions')))) {
      if (stryMutAct_9fa48("405")) {
        {}
      } else {
        stryCov_9fa48("405");
        console.log(stryMutAct_9fa48("406") ? "" : (stryCov_9fa48("406"), 'Periodic refresh of labor actions'));
        refreshLaborActions();
      }
    }
  }
});

/**
 * Fetch and cache labor actions
 * @returns {Promise<boolean>} Success status
 */
async function refreshLaborActions() {
  if (stryMutAct_9fa48("407")) {
    {}
  } else {
    stryCov_9fa48("407");
    try {
      if (stryMutAct_9fa48("408")) {
        {}
      } else {
        stryCov_9fa48("408");
        const actions = await apiService.getLaborActions();
        console.log(stryMutAct_9fa48("409") ? `` : (stryCov_9fa48("409"), `Fetched ${actions.length} labor actions`));

        // Store in local storage for quick access
        await chrome.storage.local.set(stryMutAct_9fa48("410") ? {} : (stryCov_9fa48("410"), {
          labor_actions: actions,
          connection_status: stryMutAct_9fa48("411") ? "" : (stryCov_9fa48("411"), 'online'),
          failure_count: 0
        }));
        return stryMutAct_9fa48("414") ? actions.length > 0 && true : stryMutAct_9fa48("413") ? false : stryMutAct_9fa48("412") ? true : (stryCov_9fa48("412", "413", "414"), (stryMutAct_9fa48("417") ? actions.length <= 0 : stryMutAct_9fa48("416") ? actions.length >= 0 : stryMutAct_9fa48("415") ? false : (stryCov_9fa48("415", "416", "417"), actions.length > 0)) || (stryMutAct_9fa48("418") ? false : (stryCov_9fa48("418"), true))); // Return true even if empty (successful fetch)
      }
    } catch (error) {
      if (stryMutAct_9fa48("419")) {
        {}
      } else {
        stryCov_9fa48("419");
        console.error(stryMutAct_9fa48("420") ? "" : (stryCov_9fa48("420"), 'Failed to refresh labor actions:'), error);

        // Get current failure count
        const result = await chrome.storage.local.get(stryMutAct_9fa48("421") ? [] : (stryCov_9fa48("421"), [stryMutAct_9fa48("422") ? "" : (stryCov_9fa48("422"), 'failure_count')]));
        const currentFailures = stryMutAct_9fa48("423") ? (result.failure_count || 0) - 1 : (stryCov_9fa48("423"), (stryMutAct_9fa48("426") ? result.failure_count && 0 : stryMutAct_9fa48("425") ? false : stryMutAct_9fa48("424") ? true : (stryCov_9fa48("424", "425", "426"), result.failure_count || 0)) + 1);
        const updates = stryMutAct_9fa48("427") ? {} : (stryCov_9fa48("427"), {
          failure_count: currentFailures
        });
        if (stryMutAct_9fa48("431") ? currentFailures < 3 : stryMutAct_9fa48("430") ? currentFailures > 3 : stryMutAct_9fa48("429") ? false : stryMutAct_9fa48("428") ? true : (stryCov_9fa48("428", "429", "430", "431"), currentFailures >= 3)) {
          if (stryMutAct_9fa48("432")) {
            {}
          } else {
            stryCov_9fa48("432");
            updates.connection_status = stryMutAct_9fa48("433") ? "" : (stryCov_9fa48("433"), 'offline');
          }
        }
        await chrome.storage.local.set(updates);
        return stryMutAct_9fa48("434") ? true : (stryCov_9fa48("434"), false);
      }
    }
  }
}

/**
 * Check if a URL matches any labor actions using optimized extension format
 *
 * Uses the optimized pattern matching from API v3.0 extension format:
 * 1. Tests against optimized combined patterns first (fast)
 * 2. Falls back to individual pattern matching for accuracy
 * 3. Returns full action details for rich notifications
 *
 * @param {string} url - URL to check
 * @param {Array} actions - List of labor actions with _extensionData
 * @returns {Object|null} Matching action object or null if no match found
 */
function matchUrlToAction(url, actions) {
  if (stryMutAct_9fa48("435")) {
    {}
  } else {
    stryCov_9fa48("435");
    if (stryMutAct_9fa48("438") ? (!url || !actions) && actions.length === 0 : stryMutAct_9fa48("437") ? false : stryMutAct_9fa48("436") ? true : (stryCov_9fa48("436", "437", "438"), (stryMutAct_9fa48("440") ? !url && !actions : stryMutAct_9fa48("439") ? false : (stryCov_9fa48("439", "440"), (stryMutAct_9fa48("441") ? url : (stryCov_9fa48("441"), !url)) || (stryMutAct_9fa48("442") ? actions : (stryCov_9fa48("442"), !actions)))) || (stryMutAct_9fa48("444") ? actions.length !== 0 : stryMutAct_9fa48("443") ? false : (stryCov_9fa48("443", "444"), actions.length === 0)))) {
      if (stryMutAct_9fa48("445")) {
        {}
      } else {
        stryCov_9fa48("445");
        return null;
      }
    }
    try {
      if (stryMutAct_9fa48("446")) {
        {}
      } else {
        stryCov_9fa48("446");
        const urlToTest = stryMutAct_9fa48("447") ? url.toUpperCase() : (stryCov_9fa48("447"), url.toLowerCase());

        // Check each action using extension format data if available
        for (const action of actions) {
          if (stryMutAct_9fa48("448")) {
            {}
          } else {
            stryCov_9fa48("448");
            // Skip inactive actions
            if (stryMutAct_9fa48("451") ? action.status || action.status !== 'active' : stryMutAct_9fa48("450") ? false : stryMutAct_9fa48("449") ? true : (stryCov_9fa48("449", "450", "451"), action.status && (stryMutAct_9fa48("453") ? action.status === 'active' : stryMutAct_9fa48("452") ? true : (stryCov_9fa48("452", "453"), action.status !== (stryMutAct_9fa48("454") ? "" : (stryCov_9fa48("454"), 'active')))))) {
              if (stryMutAct_9fa48("455")) {
                {}
              } else {
                stryCov_9fa48("455");
                continue;
              }
            }

            // Use extension format data if available (preferred)
            if (stryMutAct_9fa48("458") ? action._extensionData || action._extensionData.matchingUrlRegexes : stryMutAct_9fa48("457") ? false : stryMutAct_9fa48("456") ? true : (stryCov_9fa48("456", "457", "458"), action._extensionData && action._extensionData.matchingUrlRegexes)) {
              if (stryMutAct_9fa48("459")) {
                {}
              } else {
                stryCov_9fa48("459");
                for (const pattern of action._extensionData.matchingUrlRegexes) {
                  if (stryMutAct_9fa48("460")) {
                    {}
                  } else {
                    stryCov_9fa48("460");
                    try {
                      if (stryMutAct_9fa48("461")) {
                        {}
                      } else {
                        stryCov_9fa48("461");
                        const regex = new RegExp(pattern, stryMutAct_9fa48("462") ? "" : (stryCov_9fa48("462"), 'i'));
                        if (stryMutAct_9fa48("464") ? false : stryMutAct_9fa48("463") ? true : (stryCov_9fa48("463", "464"), regex.test(urlToTest))) {
                          if (stryMutAct_9fa48("465")) {
                            {}
                          } else {
                            stryCov_9fa48("465");
                            return action;
                          }
                        }
                      }
                    } catch (e) {
                      if (stryMutAct_9fa48("466")) {
                        {}
                      } else {
                        stryCov_9fa48("466");
                        console.warn(stryMutAct_9fa48("467") ? "" : (stryCov_9fa48("467"), 'Invalid regex pattern:'), pattern);
                        continue;
                      }
                    }
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("468")) {
                {}
              } else {
                stryCov_9fa48("468");
                // Fallback to legacy target_urls matching
                const hostname = stryMutAct_9fa48("469") ? new URL(url).hostname.toUpperCase() : (stryCov_9fa48("469"), new URL(url).hostname.toLowerCase());
                const targets = stryMutAct_9fa48("472") ? (action.target_urls || action.targets || action.domains) && [] : stryMutAct_9fa48("471") ? false : stryMutAct_9fa48("470") ? true : (stryCov_9fa48("470", "471", "472"), (stryMutAct_9fa48("474") ? (action.target_urls || action.targets) && action.domains : stryMutAct_9fa48("473") ? false : (stryCov_9fa48("473", "474"), (stryMutAct_9fa48("476") ? action.target_urls && action.targets : stryMutAct_9fa48("475") ? false : (stryCov_9fa48("475", "476"), action.target_urls || action.targets)) || action.domains)) || (stryMutAct_9fa48("477") ? ["Stryker was here"] : (stryCov_9fa48("477"), [])));
                for (const target of targets) {
                  if (stryMutAct_9fa48("478")) {
                    {}
                  } else {
                    stryCov_9fa48("478");
                    const targetLower = stryMutAct_9fa48("479") ? target.toUpperCase() : (stryCov_9fa48("479"), target.toLowerCase());

                    // Match exact domain or subdomain
                    if (stryMutAct_9fa48("482") ? hostname === targetLower && hostname.endsWith('.' + targetLower) : stryMutAct_9fa48("481") ? false : stryMutAct_9fa48("480") ? true : (stryCov_9fa48("480", "481", "482"), (stryMutAct_9fa48("484") ? hostname !== targetLower : stryMutAct_9fa48("483") ? false : (stryCov_9fa48("483", "484"), hostname === targetLower)) || (stryMutAct_9fa48("485") ? hostname.startsWith('.' + targetLower) : (stryCov_9fa48("485"), hostname.endsWith((stryMutAct_9fa48("486") ? "" : (stryCov_9fa48("486"), '.')) + targetLower))))) {
                      if (stryMutAct_9fa48("487")) {
                        {}
                      } else {
                        stryCov_9fa48("487");
                        return action;
                      }
                    }
                  }
                }

                // Fallback: check company name
                if (stryMutAct_9fa48("489") ? false : stryMutAct_9fa48("488") ? true : (stryCov_9fa48("488", "489"), action.company)) {
                  if (stryMutAct_9fa48("490")) {
                    {}
                  } else {
                    stryCov_9fa48("490");
                    const companyLower = stryMutAct_9fa48("491") ? action.company.toUpperCase().replace(/\s+/g, '') : (stryCov_9fa48("491"), action.company.toLowerCase().replace(stryMutAct_9fa48("493") ? /\S+/g : stryMutAct_9fa48("492") ? /\s/g : (stryCov_9fa48("492", "493"), /\s+/g), stryMutAct_9fa48("494") ? "Stryker was here!" : (stryCov_9fa48("494"), '')));
                    if (stryMutAct_9fa48("496") ? false : stryMutAct_9fa48("495") ? true : (stryCov_9fa48("495", "496"), hostname.includes(companyLower))) {
                      if (stryMutAct_9fa48("497")) {
                        {}
                      } else {
                        stryCov_9fa48("497");
                        return action;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      if (stryMutAct_9fa48("498")) {
        {}
      } else {
        stryCov_9fa48("498");
        console.error(stryMutAct_9fa48("499") ? "" : (stryCov_9fa48("499"), 'Error matching URL:'), error);
      }
    }
    return null;
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (stryMutAct_9fa48("500")) {
    {}
  } else {
    stryCov_9fa48("500");
    if (stryMutAct_9fa48("503") ? request.action !== 'checkUrl' : stryMutAct_9fa48("502") ? false : stryMutAct_9fa48("501") ? true : (stryCov_9fa48("501", "502", "503"), request.action === (stryMutAct_9fa48("504") ? "" : (stryCov_9fa48("504"), 'checkUrl')))) {
      if (stryMutAct_9fa48("505")) {
        {}
      } else {
        stryCov_9fa48("505");
        // Check for bypass
        if (stryMutAct_9fa48("508") ? sender.tab || allowedBypasses.has(sender.tab.id) : stryMutAct_9fa48("507") ? false : stryMutAct_9fa48("506") ? true : (stryCov_9fa48("506", "507", "508"), sender.tab && allowedBypasses.has(sender.tab.id))) {
          if (stryMutAct_9fa48("509")) {
            {}
          } else {
            stryCov_9fa48("509");
            const bypassedUrl = allowedBypasses.get(sender.tab.id);
            if (stryMutAct_9fa48("512") ? request.url === bypassedUrl && request.url.startsWith(bypassedUrl) : stryMutAct_9fa48("511") ? false : stryMutAct_9fa48("510") ? true : (stryCov_9fa48("510", "511", "512"), (stryMutAct_9fa48("514") ? request.url !== bypassedUrl : stryMutAct_9fa48("513") ? false : (stryCov_9fa48("513", "514"), request.url === bypassedUrl)) || (stryMutAct_9fa48("515") ? request.url.endsWith(bypassedUrl) : (stryCov_9fa48("515"), request.url.startsWith(bypassedUrl))))) {
              if (stryMutAct_9fa48("516")) {
                {}
              } else {
                stryCov_9fa48("516");
                allowedBypasses.delete(sender.tab.id);
                sendResponse(stryMutAct_9fa48("517") ? {} : (stryCov_9fa48("517"), {
                  bypass: stryMutAct_9fa48("518") ? false : (stryCov_9fa48("518"), true)
                }));
                return stryMutAct_9fa48("519") ? false : (stryCov_9fa48("519"), true);
              }
            }
          }
        }
        chrome.storage.local.get(stryMutAct_9fa48("520") ? [] : (stryCov_9fa48("520"), [stryMutAct_9fa48("521") ? "" : (stryCov_9fa48("521"), 'labor_actions')]), result => {
          if (stryMutAct_9fa48("522")) {
            {}
          } else {
            stryCov_9fa48("522");
            const actions = stryMutAct_9fa48("525") ? result.labor_actions && [] : stryMutAct_9fa48("524") ? false : stryMutAct_9fa48("523") ? true : (stryCov_9fa48("523", "524", "525"), result.labor_actions || (stryMutAct_9fa48("526") ? ["Stryker was here"] : (stryCov_9fa48("526"), [])));
            const match = matchUrlToAction(request.url, actions);
            chrome.storage.sync.get(stryMutAct_9fa48("527") ? [] : (stryCov_9fa48("527"), [stryMutAct_9fa48("528") ? "" : (stryCov_9fa48("528"), 'blockMode')]), settings => {
              if (stryMutAct_9fa48("529")) {
                {}
              } else {
                stryCov_9fa48("529");
                sendResponse(stryMutAct_9fa48("530") ? {} : (stryCov_9fa48("530"), {
                  match: match,
                  blockMode: stryMutAct_9fa48("533") ? settings.blockMode && false : stryMutAct_9fa48("532") ? false : stryMutAct_9fa48("531") ? true : (stryCov_9fa48("531", "532", "533"), settings.blockMode || (stryMutAct_9fa48("534") ? true : (stryCov_9fa48("534"), false)))
                }));
              }
            });
          }
        });

        // Return true to indicate async response
        return stryMutAct_9fa48("535") ? false : (stryCov_9fa48("535"), true);
      }
    } else if (stryMutAct_9fa48("538") ? request.action !== 'allowBypass' : stryMutAct_9fa48("537") ? false : stryMutAct_9fa48("536") ? true : (stryCov_9fa48("536", "537", "538"), request.action === (stryMutAct_9fa48("539") ? "" : (stryCov_9fa48("539"), 'allowBypass')))) {
      if (stryMutAct_9fa48("540")) {
        {}
      } else {
        stryCov_9fa48("540");
        if (stryMutAct_9fa48("542") ? false : stryMutAct_9fa48("541") ? true : (stryCov_9fa48("541", "542"), sender.tab)) {
          if (stryMutAct_9fa48("543")) {
            {}
          } else {
            stryCov_9fa48("543");
            allowedBypasses.set(sender.tab.id, request.url);
            // Clear after 1 minute to prevent memory leaks
            setTimeout(stryMutAct_9fa48("544") ? () => undefined : (stryCov_9fa48("544"), () => allowedBypasses.delete(sender.tab.id)), 60000);
          }
        }
        sendResponse(stryMutAct_9fa48("545") ? {} : (stryCov_9fa48("545"), {
          success: stryMutAct_9fa48("546") ? false : (stryCov_9fa48("546"), true)
        }));
        return stryMutAct_9fa48("547") ? false : (stryCov_9fa48("547"), true);
      }
    } else if (stryMutAct_9fa48("550") ? request.action !== 'setBlockedState' : stryMutAct_9fa48("549") ? false : stryMutAct_9fa48("548") ? true : (stryCov_9fa48("548", "549", "550"), request.action === (stryMutAct_9fa48("551") ? "" : (stryCov_9fa48("551"), 'setBlockedState')))) {
      if (stryMutAct_9fa48("552")) {
        {}
      } else {
        stryCov_9fa48("552");
        if (stryMutAct_9fa48("554") ? false : stryMutAct_9fa48("553") ? true : (stryCov_9fa48("553", "554"), sender.tab)) {
          if (stryMutAct_9fa48("555")) {
            {}
          } else {
            stryCov_9fa48("555");
            const key = stryMutAct_9fa48("556") ? `` : (stryCov_9fa48("556"), `blocked_tab_${sender.tab.id}`);
            chrome.storage.local.set(stryMutAct_9fa48("557") ? {} : (stryCov_9fa48("557"), {
              [key]: stryMutAct_9fa48("558") ? {} : (stryCov_9fa48("558"), {
                action: request.data,
                url: request.url,
                timestamp: Date.now()
              })
            })).then(() => {
              if (stryMutAct_9fa48("559")) {
                {}
              } else {
                stryCov_9fa48("559");
                sendResponse(stryMutAct_9fa48("560") ? {} : (stryCov_9fa48("560"), {
                  success: stryMutAct_9fa48("561") ? false : (stryCov_9fa48("561"), true)
                }));
              }
            });
          }
        }
        return stryMutAct_9fa48("562") ? false : (stryCov_9fa48("562"), true);
      }
    } else if (stryMutAct_9fa48("565") ? request.action !== 'getBlockedState' : stryMutAct_9fa48("564") ? false : stryMutAct_9fa48("563") ? true : (stryCov_9fa48("563", "564", "565"), request.action === (stryMutAct_9fa48("566") ? "" : (stryCov_9fa48("566"), 'getBlockedState')))) {
      if (stryMutAct_9fa48("567")) {
        {}
      } else {
        stryCov_9fa48("567");
        if (stryMutAct_9fa48("569") ? false : stryMutAct_9fa48("568") ? true : (stryCov_9fa48("568", "569"), sender.tab)) {
          if (stryMutAct_9fa48("570")) {
            {}
          } else {
            stryCov_9fa48("570");
            const key = stryMutAct_9fa48("571") ? `` : (stryCov_9fa48("571"), `blocked_tab_${sender.tab.id}`);
            chrome.storage.local.get(stryMutAct_9fa48("572") ? [] : (stryCov_9fa48("572"), [key]), result => {
              if (stryMutAct_9fa48("573")) {
                {}
              } else {
                stryCov_9fa48("573");
                sendResponse(stryMutAct_9fa48("576") ? result[key] && null : stryMutAct_9fa48("575") ? false : stryMutAct_9fa48("574") ? true : (stryCov_9fa48("574", "575", "576"), result[key] || null));
              }
            });
          }
        }
        return stryMutAct_9fa48("577") ? false : (stryCov_9fa48("577"), true);
      }
    } else if (stryMutAct_9fa48("580") ? request.action !== 'refreshActions' : stryMutAct_9fa48("579") ? false : stryMutAct_9fa48("578") ? true : (stryCov_9fa48("578", "579", "580"), request.action === (stryMutAct_9fa48("581") ? "" : (stryCov_9fa48("581"), 'refreshActions')))) {
      if (stryMutAct_9fa48("582")) {
        {}
      } else {
        stryCov_9fa48("582");
        refreshLaborActions().then(success => {
          if (stryMutAct_9fa48("583")) {
            {}
          } else {
            stryCov_9fa48("583");
            if (stryMutAct_9fa48("585") ? false : stryMutAct_9fa48("584") ? true : (stryCov_9fa48("584", "585"), success)) {
              if (stryMutAct_9fa48("586")) {
                {}
              } else {
                stryCov_9fa48("586");
                sendResponse(stryMutAct_9fa48("587") ? {} : (stryCov_9fa48("587"), {
                  success: stryMutAct_9fa48("588") ? false : (stryCov_9fa48("588"), true)
                }));
              }
            } else {
              if (stryMutAct_9fa48("589")) {
                {}
              } else {
                stryCov_9fa48("589");
                sendResponse(stryMutAct_9fa48("590") ? {} : (stryCov_9fa48("590"), {
                  success: stryMutAct_9fa48("591") ? true : (stryCov_9fa48("591"), false),
                  error: stryMutAct_9fa48("592") ? "" : (stryCov_9fa48("592"), 'Failed to fetch labor actions. Check API configuration.')
                }));
              }
            }
          }
        });
        return stryMutAct_9fa48("593") ? false : (stryCov_9fa48("593"), true);
      }
    } else if (stryMutAct_9fa48("596") ? request.action !== 'clearCache' : stryMutAct_9fa48("595") ? false : stryMutAct_9fa48("594") ? true : (stryCov_9fa48("594", "595", "596"), request.action === (stryMutAct_9fa48("597") ? "" : (stryCov_9fa48("597"), 'clearCache')))) {
      if (stryMutAct_9fa48("598")) {
        {}
      } else {
        stryCov_9fa48("598");
        apiService.clearCache().then(() => {
          if (stryMutAct_9fa48("599")) {
            {}
          } else {
            stryCov_9fa48("599");
            sendResponse(stryMutAct_9fa48("600") ? {} : (stryCov_9fa48("600"), {
              success: stryMutAct_9fa48("601") ? false : (stryCov_9fa48("601"), true)
            }));
          }
        });
        return stryMutAct_9fa48("602") ? false : (stryCov_9fa48("602"), true);
      }
    }
  }
});

// Initial fetch on startup
refreshLaborActions();