// @ts-nocheck
// Block page script
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
document.addEventListener(stryMutAct_9fa48("603") ? "" : (stryCov_9fa48("603"), 'DOMContentLoaded'), () => {
  if (stryMutAct_9fa48("604")) {
    {}
  } else {
    stryCov_9fa48("604");
    const actionTitle = document.getElementById(stryMutAct_9fa48("605") ? "" : (stryCov_9fa48("605"), 'action-title'));
    const actionDescription = document.getElementById(stryMutAct_9fa48("606") ? "" : (stryCov_9fa48("606"), 'action-description'));
    const actionType = document.getElementById(stryMutAct_9fa48("607") ? "" : (stryCov_9fa48("607"), 'action-type'));
    const blockedUrl = document.getElementById(stryMutAct_9fa48("608") ? "" : (stryCov_9fa48("608"), 'blocked-url'));
    const unionLogo = document.getElementById(stryMutAct_9fa48("609") ? "" : (stryCov_9fa48("609"), 'union-logo'));
    const learnMoreBtn = document.getElementById(stryMutAct_9fa48("610") ? "" : (stryCov_9fa48("610"), 'learn-more-btn'));
    const proceedBtn = document.getElementById(stryMutAct_9fa48("611") ? "" : (stryCov_9fa48("611"), 'proceed-btn'));
    const goBackBtn = document.getElementById(stryMutAct_9fa48("612") ? "" : (stryCov_9fa48("612"), 'go-back-btn'));

    // Load blocked action data from background script
    chrome.runtime.sendMessage(stryMutAct_9fa48("613") ? {} : (stryCov_9fa48("613"), {
      action: stryMutAct_9fa48("614") ? "" : (stryCov_9fa48("614"), 'getBlockedState')
    }), response => {
      if (stryMutAct_9fa48("615")) {
        {}
      } else {
        stryCov_9fa48("615");
        if (stryMutAct_9fa48("617") ? false : stryMutAct_9fa48("616") ? true : (stryCov_9fa48("616", "617"), response)) {
          if (stryMutAct_9fa48("618")) {
            {}
          } else {
            stryCov_9fa48("618");
            updateUI(response.action, response.url);

            // Store original URL for proceed button
            window.originalUrl = response.url;
          }
        } else {
          if (stryMutAct_9fa48("619")) {
            {}
          } else {
            stryCov_9fa48("619");
            // Fallback or error state
            document.getElementById(stryMutAct_9fa48("620") ? "" : (stryCov_9fa48("620"), 'action-title')).textContent = stryMutAct_9fa48("621") ? "" : (stryCov_9fa48("621"), 'Error Loading Data');
            document.getElementById(stryMutAct_9fa48("622") ? "" : (stryCov_9fa48("622"), 'action-description')).textContent = stryMutAct_9fa48("623") ? "" : (stryCov_9fa48("623"), 'Could not retrieve labor action details. Please try refreshing.');
          }
        }
      }
    });
    function updateUI(action, originalUrl) {
      if (stryMutAct_9fa48("624")) {
        {}
      } else {
        stryCov_9fa48("624");
        if (stryMutAct_9fa48("626") ? false : stryMutAct_9fa48("625") ? true : (stryCov_9fa48("625", "626"), action)) {
          if (stryMutAct_9fa48("627")) {
            {}
          } else {
            stryCov_9fa48("627");
            // Display union logo if available
            if (stryMutAct_9fa48("629") ? false : stryMutAct_9fa48("628") ? true : (stryCov_9fa48("628", "629"), action.logoUrl)) {
              if (stryMutAct_9fa48("630")) {
                {}
              } else {
                stryCov_9fa48("630");
                unionLogo.src = action.logoUrl;
                unionLogo.style.display = stryMutAct_9fa48("631") ? "" : (stryCov_9fa48("631"), 'block');
              }
            } else {
              if (stryMutAct_9fa48("632")) {
                {}
              } else {
                stryCov_9fa48("632");
                unionLogo.style.display = stryMutAct_9fa48("633") ? "" : (stryCov_9fa48("633"), 'none');
              }
            }

            // Update UI with action data
            actionTitle.textContent = stryMutAct_9fa48("636") ? action.title && 'Labor Action in Progress' : stryMutAct_9fa48("635") ? false : stryMutAct_9fa48("634") ? true : (stryCov_9fa48("634", "635", "636"), action.title || (stryMutAct_9fa48("637") ? "" : (stryCov_9fa48("637"), 'Labor Action in Progress')));
            actionDescription.textContent = stryMutAct_9fa48("640") ? action.description && 'This company is currently subject to a labor action. We encourage you to learn more and support workers.' : stryMutAct_9fa48("639") ? false : stryMutAct_9fa48("638") ? true : (stryCov_9fa48("638", "639", "640"), action.description || (stryMutAct_9fa48("641") ? "" : (stryCov_9fa48("641"), 'This company is currently subject to a labor action. We encourage you to learn more and support workers.')));
            if (stryMutAct_9fa48("643") ? false : stryMutAct_9fa48("642") ? true : (stryCov_9fa48("642", "643"), action.type)) {
              if (stryMutAct_9fa48("644")) {
                {}
              } else {
                stryCov_9fa48("644");
                actionType.textContent = stryMutAct_9fa48("645") ? action.type.toLowerCase() : (stryCov_9fa48("645"), action.type.toUpperCase());
              }
            }
            if (stryMutAct_9fa48("648") ? action.url && action.more_info : stryMutAct_9fa48("647") ? false : stryMutAct_9fa48("646") ? true : (stryCov_9fa48("646", "647", "648"), action.url || action.more_info)) {
              if (stryMutAct_9fa48("649")) {
                {}
              } else {
                stryCov_9fa48("649");
                learnMoreBtn.href = stryMutAct_9fa48("652") ? action.url && action.more_info : stryMutAct_9fa48("651") ? false : stryMutAct_9fa48("650") ? true : (stryCov_9fa48("650", "651", "652"), action.url || action.more_info);
                learnMoreBtn.style.display = stryMutAct_9fa48("653") ? "" : (stryCov_9fa48("653"), 'inline-block');
              }
            }

            // Show additional details if available
            const detailsContainer = document.getElementById(stryMutAct_9fa48("654") ? "" : (stryCov_9fa48("654"), 'action-details'));
            let hasDetails = stryMutAct_9fa48("655") ? true : (stryCov_9fa48("655"), false);
            if (stryMutAct_9fa48("657") ? false : stryMutAct_9fa48("656") ? true : (stryCov_9fa48("656", "657"), action.demands)) {
              if (stryMutAct_9fa48("658")) {
                {}
              } else {
                stryCov_9fa48("658");
                document.getElementById(stryMutAct_9fa48("659") ? "" : (stryCov_9fa48("659"), 'action-demands')).textContent = action.demands;
                document.getElementById(stryMutAct_9fa48("660") ? "" : (stryCov_9fa48("660"), 'action-demands-container')).style.display = stryMutAct_9fa48("661") ? "" : (stryCov_9fa48("661"), 'block');
                hasDetails = stryMutAct_9fa48("662") ? false : (stryCov_9fa48("662"), true);
              }
            } else {
              if (stryMutAct_9fa48("663")) {
                {}
              } else {
                stryCov_9fa48("663");
                document.getElementById(stryMutAct_9fa48("664") ? "" : (stryCov_9fa48("664"), 'action-demands-container')).style.display = stryMutAct_9fa48("665") ? "" : (stryCov_9fa48("665"), 'none');
              }
            }
            if (stryMutAct_9fa48("668") ? action.locations || action.locations.length > 0 : stryMutAct_9fa48("667") ? false : stryMutAct_9fa48("666") ? true : (stryCov_9fa48("666", "667", "668"), action.locations && (stryMutAct_9fa48("671") ? action.locations.length <= 0 : stryMutAct_9fa48("670") ? action.locations.length >= 0 : stryMutAct_9fa48("669") ? true : (stryCov_9fa48("669", "670", "671"), action.locations.length > 0)))) {
              if (stryMutAct_9fa48("672")) {
                {}
              } else {
                stryCov_9fa48("672");
                document.getElementById(stryMutAct_9fa48("673") ? "" : (stryCov_9fa48("673"), 'action-location')).textContent = action.locations.join(stryMutAct_9fa48("674") ? "" : (stryCov_9fa48("674"), ', '));
                document.getElementById(stryMutAct_9fa48("675") ? "" : (stryCov_9fa48("675"), 'action-location-container')).style.display = stryMutAct_9fa48("676") ? "" : (stryCov_9fa48("676"), 'block');
                hasDetails = stryMutAct_9fa48("677") ? false : (stryCov_9fa48("677"), true);
              }
            } else {
              if (stryMutAct_9fa48("678")) {
                {}
              } else {
                stryCov_9fa48("678");
                document.getElementById(stryMutAct_9fa48("679") ? "" : (stryCov_9fa48("679"), 'action-location-container')).style.display = stryMutAct_9fa48("680") ? "" : (stryCov_9fa48("680"), 'none');
              }
            }
            if (stryMutAct_9fa48("682") ? false : stryMutAct_9fa48("681") ? true : (stryCov_9fa48("681", "682"), action.startDate)) {
              if (stryMutAct_9fa48("683")) {
                {}
              } else {
                stryCov_9fa48("683");
                let dateText = new Date(action.startDate).toLocaleDateString();
                if (stryMutAct_9fa48("685") ? false : stryMutAct_9fa48("684") ? true : (stryCov_9fa48("684", "685"), action.endDate)) {
                  if (stryMutAct_9fa48("686")) {
                    {}
                  } else {
                    stryCov_9fa48("686");
                    stryMutAct_9fa48("687") ? dateText -= ' - ' + new Date(action.endDate).toLocaleDateString() : (stryCov_9fa48("687"), dateText += (stryMutAct_9fa48("688") ? "" : (stryCov_9fa48("688"), ' - ')) + new Date(action.endDate).toLocaleDateString());
                  }
                } else {
                  if (stryMutAct_9fa48("689")) {
                    {}
                  } else {
                    stryCov_9fa48("689");
                    dateText += stryMutAct_9fa48("690") ? "" : (stryCov_9fa48("690"), ' - Present');
                  }
                }
                document.getElementById(stryMutAct_9fa48("691") ? "" : (stryCov_9fa48("691"), 'action-dates')).textContent = dateText;
                document.getElementById(stryMutAct_9fa48("692") ? "" : (stryCov_9fa48("692"), 'action-dates-container')).style.display = stryMutAct_9fa48("693") ? "" : (stryCov_9fa48("693"), 'block');
                hasDetails = stryMutAct_9fa48("694") ? false : (stryCov_9fa48("694"), true);
              }
            } else {
              if (stryMutAct_9fa48("695")) {
                {}
              } else {
                stryCov_9fa48("695");
                document.getElementById(stryMutAct_9fa48("696") ? "" : (stryCov_9fa48("696"), 'action-dates-container')).style.display = stryMutAct_9fa48("697") ? "" : (stryCov_9fa48("697"), 'none');
              }
            }
            if (stryMutAct_9fa48("699") ? false : stryMutAct_9fa48("698") ? true : (stryCov_9fa48("698", "699"), hasDetails)) {
              if (stryMutAct_9fa48("700")) {
                {}
              } else {
                stryCov_9fa48("700");
                detailsContainer.style.display = stryMutAct_9fa48("701") ? "" : (stryCov_9fa48("701"), 'block');
              }
            }
          }
        }
        if (stryMutAct_9fa48("703") ? false : stryMutAct_9fa48("702") ? true : (stryCov_9fa48("702", "703"), originalUrl)) {
          if (stryMutAct_9fa48("704")) {
            {}
          } else {
            stryCov_9fa48("704");
            try {
              if (stryMutAct_9fa48("705")) {
                {}
              } else {
                stryCov_9fa48("705");
                const url = new URL(originalUrl);
                blockedUrl.textContent = url.hostname;
              }
            } catch (e) {
              if (stryMutAct_9fa48("706")) {
                {}
              } else {
                stryCov_9fa48("706");
                blockedUrl.textContent = originalUrl;
              }
            }
          }
        }
      }
    }

    // Handle proceed button
    proceedBtn.addEventListener(stryMutAct_9fa48("707") ? "" : (stryCov_9fa48("707"), 'click'), () => {
      if (stryMutAct_9fa48("708")) {
        {}
      } else {
        stryCov_9fa48("708");
        const urlToProceed = window.originalUrl;
        if (stryMutAct_9fa48("710") ? false : stryMutAct_9fa48("709") ? true : (stryCov_9fa48("709", "710"), urlToProceed)) {
          if (stryMutAct_9fa48("711")) {
            {}
          } else {
            stryCov_9fa48("711");
            // Notify background script to allow bypass
            chrome.runtime.sendMessage(stryMutAct_9fa48("712") ? {} : (stryCov_9fa48("712"), {
              action: stryMutAct_9fa48("713") ? "" : (stryCov_9fa48("713"), 'allowBypass'),
              url: urlToProceed
            }), () => {
              if (stryMutAct_9fa48("714")) {
                {}
              } else {
                stryCov_9fa48("714");
                window.location.href = urlToProceed;
              }
            });
          }
        }
      }
    });

    // Handle go back button
    goBackBtn.addEventListener(stryMutAct_9fa48("715") ? "" : (stryCov_9fa48("715"), 'click'), () => {
      if (stryMutAct_9fa48("716")) {
        {}
      } else {
        stryCov_9fa48("716");
        // Check if we have a meaningful history to go back to
        // If we came directly from a new tab (like test mode), redirect to onlinepicketline.com
        if (stryMutAct_9fa48("719") ? window.history.length <= 2 || window.originalUrl : stryMutAct_9fa48("718") ? false : stryMutAct_9fa48("717") ? true : (stryCov_9fa48("717", "718", "719"), (stryMutAct_9fa48("722") ? window.history.length > 2 : stryMutAct_9fa48("721") ? window.history.length < 2 : stryMutAct_9fa48("720") ? true : (stryCov_9fa48("720", "721", "722"), window.history.length <= 2)) && window.originalUrl)) {
          if (stryMutAct_9fa48("723")) {
            {}
          } else {
            stryCov_9fa48("723");
            // History is too short (just the blocked page), go to onlinepicketline.com
            window.location.href = stryMutAct_9fa48("724") ? "" : (stryCov_9fa48("724"), 'https://onlinepicketline.com');
          }
        } else if (stryMutAct_9fa48("728") ? window.history.length <= 1 : stryMutAct_9fa48("727") ? window.history.length >= 1 : stryMutAct_9fa48("726") ? false : stryMutAct_9fa48("725") ? true : (stryCov_9fa48("725", "726", "727", "728"), window.history.length > 1)) {
          if (stryMutAct_9fa48("729")) {
            {}
          } else {
            stryCov_9fa48("729");
            window.history.back();
          }
        } else {
          if (stryMutAct_9fa48("730")) {
            {}
          } else {
            stryCov_9fa48("730");
            window.close();
          }
        }
      }
    });
  }
});