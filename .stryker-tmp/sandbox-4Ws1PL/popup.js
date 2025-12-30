// @ts-nocheck
// Popup script

// Constants
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
document.addEventListener(stryMutAct_9fa48("974") ? "" : (stryCov_9fa48("974"), 'DOMContentLoaded'), () => {
  if (stryMutAct_9fa48("975")) {
    {}
  } else {
    stryCov_9fa48("975");
    const modeBannerRadio = document.getElementById(stryMutAct_9fa48("976") ? "" : (stryCov_9fa48("976"), 'mode-banner'));
    const modeBlockRadio = document.getElementById(stryMutAct_9fa48("977") ? "" : (stryCov_9fa48("977"), 'mode-block'));
    const statusDiv = document.getElementById(stryMutAct_9fa48("978") ? "" : (stryCov_9fa48("978"), 'status'));
    const statsContent = document.getElementById(stryMutAct_9fa48("979") ? "" : (stryCov_9fa48("979"), 'stats-content'));
    const connectionIndicator = document.getElementById(stryMutAct_9fa48("980") ? "" : (stryCov_9fa48("980"), 'connection-indicator'));
    const connectionText = document.getElementById(stryMutAct_9fa48("981") ? "" : (stryCov_9fa48("981"), 'connection-text'));

    // Load current settings
    chrome.storage.sync.get(stryMutAct_9fa48("982") ? [] : (stryCov_9fa48("982"), [stryMutAct_9fa48("983") ? "" : (stryCov_9fa48("983"), 'blockMode')]), result => {
      if (stryMutAct_9fa48("984")) {
        {}
      } else {
        stryCov_9fa48("984");
        const blockMode = stryMutAct_9fa48("987") ? result.blockMode && false : stryMutAct_9fa48("986") ? false : stryMutAct_9fa48("985") ? true : (stryCov_9fa48("985", "986", "987"), result.blockMode || (stryMutAct_9fa48("988") ? true : (stryCov_9fa48("988"), false)));
        if (stryMutAct_9fa48("990") ? false : stryMutAct_9fa48("989") ? true : (stryCov_9fa48("989", "990"), blockMode)) {
          if (stryMutAct_9fa48("991")) {
            {}
          } else {
            stryCov_9fa48("991");
            modeBlockRadio.checked = stryMutAct_9fa48("992") ? false : (stryCov_9fa48("992"), true);
          }
        } else {
          if (stryMutAct_9fa48("993")) {
            {}
          } else {
            stryCov_9fa48("993");
            modeBannerRadio.checked = stryMutAct_9fa48("994") ? false : (stryCov_9fa48("994"), true);
          }
        }
      }
    });

    // Load stats
    loadStats();

    // Test mode button
    const testModeBtn = document.getElementById(stryMutAct_9fa48("995") ? "" : (stryCov_9fa48("995"), 'test-mode-btn'));
    if (stryMutAct_9fa48("997") ? false : stryMutAct_9fa48("996") ? true : (stryCov_9fa48("996", "997"), testModeBtn)) {
      if (stryMutAct_9fa48("998")) {
        {}
      } else {
        stryCov_9fa48("998");
        testModeBtn.addEventListener(stryMutAct_9fa48("999") ? "" : (stryCov_9fa48("999"), 'click'), async () => {
          if (stryMutAct_9fa48("1000")) {
            {}
          } else {
            stryCov_9fa48("1000");
            try {
              if (stryMutAct_9fa48("1001")) {
                {}
              } else {
                stryCov_9fa48("1001");
                // Enable test mode and inject test data
                await enableTestMode();
                showStatus(stryMutAct_9fa48("1002") ? "" : (stryCov_9fa48("1002"), 'Test mode enabled! Opening example.com...'), stryMutAct_9fa48("1003") ? "" : (stryCov_9fa48("1003"), 'success'));

                // Open example.com in a new tab
                chrome.tabs.create(stryMutAct_9fa48("1004") ? {} : (stryCov_9fa48("1004"), {
                  url: stryMutAct_9fa48("1005") ? "" : (stryCov_9fa48("1005"), 'https://example.com')
                }));
              }
            } catch (error) {
              if (stryMutAct_9fa48("1006")) {
                {}
              } else {
                stryCov_9fa48("1006");
                console.error(stryMutAct_9fa48("1007") ? "" : (stryCov_9fa48("1007"), 'Error enabling test mode:'), error);
                showStatus(stryMutAct_9fa48("1008") ? "" : (stryCov_9fa48("1008"), 'Failed to enable test mode'), stryMutAct_9fa48("1009") ? "" : (stryCov_9fa48("1009"), 'error'));
              }
            }
          }
        });
      }
    }

    // Save settings when radio buttons change
    modeBannerRadio.addEventListener(stryMutAct_9fa48("1010") ? "" : (stryCov_9fa48("1010"), 'change'), () => {
      if (stryMutAct_9fa48("1011")) {
        {}
      } else {
        stryCov_9fa48("1011");
        if (stryMutAct_9fa48("1013") ? false : stryMutAct_9fa48("1012") ? true : (stryCov_9fa48("1012", "1013"), modeBannerRadio.checked)) {
          if (stryMutAct_9fa48("1014")) {
            {}
          } else {
            stryCov_9fa48("1014");
            chrome.storage.sync.set(stryMutAct_9fa48("1015") ? {} : (stryCov_9fa48("1015"), {
              blockMode: stryMutAct_9fa48("1016") ? true : (stryCov_9fa48("1016"), false)
            }));
            showStatus(stryMutAct_9fa48("1017") ? "" : (stryCov_9fa48("1017"), 'Settings saved'), stryMutAct_9fa48("1018") ? "" : (stryCov_9fa48("1018"), 'success'));
          }
        }
      }
    });
    modeBlockRadio.addEventListener(stryMutAct_9fa48("1019") ? "" : (stryCov_9fa48("1019"), 'change'), () => {
      if (stryMutAct_9fa48("1020")) {
        {}
      } else {
        stryCov_9fa48("1020");
        if (stryMutAct_9fa48("1022") ? false : stryMutAct_9fa48("1021") ? true : (stryCov_9fa48("1021", "1022"), modeBlockRadio.checked)) {
          if (stryMutAct_9fa48("1023")) {
            {}
          } else {
            stryCov_9fa48("1023");
            chrome.storage.sync.set(stryMutAct_9fa48("1024") ? {} : (stryCov_9fa48("1024"), {
              blockMode: stryMutAct_9fa48("1025") ? false : (stryCov_9fa48("1025"), true)
            }));
            showStatus(stryMutAct_9fa48("1026") ? "" : (stryCov_9fa48("1026"), 'Settings saved'), stryMutAct_9fa48("1027") ? "" : (stryCov_9fa48("1027"), 'success'));
          }
        }
      }
    });

    /**
     * Show status message
     * @param {string} message - Status message
     * @param {string} type - Status type (success, error, warning)
     */
    function showStatus(message, type) {
      if (stryMutAct_9fa48("1028")) {
        {}
      } else {
        stryCov_9fa48("1028");
        statusDiv.textContent = message;
        statusDiv.className = stryMutAct_9fa48("1029") ? `` : (stryCov_9fa48("1029"), `status ${type}`);
        if (stryMutAct_9fa48("1032") ? type === 'warning' : stryMutAct_9fa48("1031") ? false : stryMutAct_9fa48("1030") ? true : (stryCov_9fa48("1030", "1031", "1032"), type !== (stryMutAct_9fa48("1033") ? "" : (stryCov_9fa48("1033"), 'warning')))) {
          if (stryMutAct_9fa48("1034")) {
            {}
          } else {
            stryCov_9fa48("1034");
            setTimeout(() => {
              if (stryMutAct_9fa48("1035")) {
                {}
              } else {
                stryCov_9fa48("1035");
                statusDiv.className = stryMutAct_9fa48("1036") ? "" : (stryCov_9fa48("1036"), 'status');
              }
            }, 5000);
          }
        }
      }
    }

    /**
     * Load and display stats
     */
    function loadStats() {
      if (stryMutAct_9fa48("1037")) {
        {}
      } else {
        stryCov_9fa48("1037");
        chrome.storage.local.get(stryMutAct_9fa48("1038") ? [] : (stryCov_9fa48("1038"), [stryMutAct_9fa48("1039") ? "" : (stryCov_9fa48("1039"), 'labor_actions'), stryMutAct_9fa48("1040") ? "" : (stryCov_9fa48("1040"), 'cache_timestamp'), stryMutAct_9fa48("1041") ? "" : (stryCov_9fa48("1041"), 'connection_status')]), result => {
          if (stryMutAct_9fa48("1042")) {
            {}
          } else {
            stryCov_9fa48("1042");
            const actions = stryMutAct_9fa48("1045") ? result.labor_actions && [] : stryMutAct_9fa48("1044") ? false : stryMutAct_9fa48("1043") ? true : (stryCov_9fa48("1043", "1044", "1045"), result.labor_actions || (stryMutAct_9fa48("1046") ? ["Stryker was here"] : (stryCov_9fa48("1046"), [])));
            const timestamp = result.cache_timestamp;

            // Update connection indicator
            const status = stryMutAct_9fa48("1049") ? result.connection_status && 'online' : stryMutAct_9fa48("1048") ? false : stryMutAct_9fa48("1047") ? true : (stryCov_9fa48("1047", "1048", "1049"), result.connection_status || (stryMutAct_9fa48("1050") ? "" : (stryCov_9fa48("1050"), 'online')));
            if (stryMutAct_9fa48("1053") ? connectionIndicator || connectionText : stryMutAct_9fa48("1052") ? false : stryMutAct_9fa48("1051") ? true : (stryCov_9fa48("1051", "1052", "1053"), connectionIndicator && connectionText)) {
              if (stryMutAct_9fa48("1054")) {
                {}
              } else {
                stryCov_9fa48("1054");
                connectionIndicator.style.display = stryMutAct_9fa48("1055") ? "" : (stryCov_9fa48("1055"), 'inline-flex');
                connectionIndicator.className = stryMutAct_9fa48("1056") ? `` : (stryCov_9fa48("1056"), `connection-status status-${status}`);
                connectionText.textContent = stryMutAct_9fa48("1057") ? status.charAt(0).toUpperCase() - status.slice(1) : (stryCov_9fa48("1057"), (stryMutAct_9fa48("1059") ? status.toUpperCase() : stryMutAct_9fa48("1058") ? status.charAt(0).toLowerCase() : (stryCov_9fa48("1058", "1059"), status.charAt(0).toUpperCase())) + (stryMutAct_9fa48("1060") ? status : (stryCov_9fa48("1060"), status.slice(1))));
              }
            }
            const activeActions = stryMutAct_9fa48("1061") ? actions.length : (stryCov_9fa48("1061"), actions.filter(stryMutAct_9fa48("1062") ? () => undefined : (stryCov_9fa48("1062"), a => stryMutAct_9fa48("1065") ? !a.status || a.status === 'active' || !a._isTestAction : stryMutAct_9fa48("1064") ? false : stryMutAct_9fa48("1063") ? true : (stryCov_9fa48("1063", "1064", "1065"), (stryMutAct_9fa48("1067") ? !a.status && a.status === 'active' : stryMutAct_9fa48("1066") ? true : (stryCov_9fa48("1066", "1067"), (stryMutAct_9fa48("1068") ? a.status : (stryCov_9fa48("1068"), !a.status)) || (stryMutAct_9fa48("1070") ? a.status !== 'active' : stryMutAct_9fa48("1069") ? false : (stryCov_9fa48("1069", "1070"), a.status === (stryMutAct_9fa48("1071") ? "" : (stryCov_9fa48("1071"), 'active')))))) && (stryMutAct_9fa48("1072") ? a._isTestAction : (stryCov_9fa48("1072"), !a._isTestAction))))).length);
            const totalUrls = actions.reduce(stryMutAct_9fa48("1073") ? () => undefined : (stryCov_9fa48("1073"), (sum, a) => stryMutAct_9fa48("1074") ? sum - (a.target_urls?.length || 0) : (stryCov_9fa48("1074"), sum + (stryMutAct_9fa48("1077") ? a.target_urls?.length && 0 : stryMutAct_9fa48("1076") ? false : stryMutAct_9fa48("1075") ? true : (stryCov_9fa48("1075", "1076", "1077"), (stryMutAct_9fa48("1078") ? a.target_urls.length : (stryCov_9fa48("1078"), a.target_urls?.length)) || 0)))), 0);
            let statsHtml = stryMutAct_9fa48("1079") ? `` : (stryCov_9fa48("1079"), `<strong>${activeActions}</strong> active labor action${(stryMutAct_9fa48("1082") ? activeActions === 1 : stryMutAct_9fa48("1081") ? false : stryMutAct_9fa48("1080") ? true : (stryCov_9fa48("1080", "1081", "1082"), activeActions !== 1)) ? stryMutAct_9fa48("1083") ? "" : (stryCov_9fa48("1083"), 's') : stryMutAct_9fa48("1084") ? "Stryker was here!" : (stryCov_9fa48("1084"), '')}`);
            if (stryMutAct_9fa48("1088") ? totalUrls <= 0 : stryMutAct_9fa48("1087") ? totalUrls >= 0 : stryMutAct_9fa48("1086") ? false : stryMutAct_9fa48("1085") ? true : (stryCov_9fa48("1085", "1086", "1087", "1088"), totalUrls > 0)) {
              if (stryMutAct_9fa48("1089")) {
                {}
              } else {
                stryCov_9fa48("1089");
                statsHtml += stryMutAct_9fa48("1090") ? `` : (stryCov_9fa48("1090"), `<br><strong>${totalUrls}</strong> URL${(stryMutAct_9fa48("1093") ? totalUrls === 1 : stryMutAct_9fa48("1092") ? false : stryMutAct_9fa48("1091") ? true : (stryCov_9fa48("1091", "1092", "1093"), totalUrls !== 1)) ? stryMutAct_9fa48("1094") ? "" : (stryCov_9fa48("1094"), 's') : stryMutAct_9fa48("1095") ? "Stryker was here!" : (stryCov_9fa48("1095"), '')} monitored`);
              }
            }
            if (stryMutAct_9fa48("1097") ? false : stryMutAct_9fa48("1096") ? true : (stryCov_9fa48("1096", "1097"), timestamp)) {
              if (stryMutAct_9fa48("1098")) {
                {}
              } else {
                stryCov_9fa48("1098");
                const age = stryMutAct_9fa48("1099") ? Date.now() + timestamp : (stryCov_9fa48("1099"), Date.now() - timestamp);
                const minutes = Math.floor(stryMutAct_9fa48("1100") ? age * 60000 : (stryCov_9fa48("1100"), age / 60000));
                const hours = Math.floor(stryMutAct_9fa48("1101") ? minutes * 60 : (stryCov_9fa48("1101"), minutes / 60));
                let timeStr;
                if (stryMutAct_9fa48("1105") ? hours <= 0 : stryMutAct_9fa48("1104") ? hours >= 0 : stryMutAct_9fa48("1103") ? false : stryMutAct_9fa48("1102") ? true : (stryCov_9fa48("1102", "1103", "1104", "1105"), hours > 0)) {
                  if (stryMutAct_9fa48("1106")) {
                    {}
                  } else {
                    stryCov_9fa48("1106");
                    timeStr = stryMutAct_9fa48("1107") ? `` : (stryCov_9fa48("1107"), `${hours} hour${(stryMutAct_9fa48("1110") ? hours === 1 : stryMutAct_9fa48("1109") ? false : stryMutAct_9fa48("1108") ? true : (stryCov_9fa48("1108", "1109", "1110"), hours !== 1)) ? stryMutAct_9fa48("1111") ? "" : (stryCov_9fa48("1111"), 's') : stryMutAct_9fa48("1112") ? "Stryker was here!" : (stryCov_9fa48("1112"), '')} ago`);
                  }
                } else if (stryMutAct_9fa48("1116") ? minutes <= 0 : stryMutAct_9fa48("1115") ? minutes >= 0 : stryMutAct_9fa48("1114") ? false : stryMutAct_9fa48("1113") ? true : (stryCov_9fa48("1113", "1114", "1115", "1116"), minutes > 0)) {
                  if (stryMutAct_9fa48("1117")) {
                    {}
                  } else {
                    stryCov_9fa48("1117");
                    timeStr = stryMutAct_9fa48("1118") ? `` : (stryCov_9fa48("1118"), `${minutes} minute${(stryMutAct_9fa48("1121") ? minutes === 1 : stryMutAct_9fa48("1120") ? false : stryMutAct_9fa48("1119") ? true : (stryCov_9fa48("1119", "1120", "1121"), minutes !== 1)) ? stryMutAct_9fa48("1122") ? "" : (stryCov_9fa48("1122"), 's') : stryMutAct_9fa48("1123") ? "Stryker was here!" : (stryCov_9fa48("1123"), '')} ago`);
                  }
                } else {
                  if (stryMutAct_9fa48("1124")) {
                    {}
                  } else {
                    stryCov_9fa48("1124");
                    timeStr = stryMutAct_9fa48("1125") ? "" : (stryCov_9fa48("1125"), 'just now');
                  }
                }
                statsHtml += stryMutAct_9fa48("1126") ? `` : (stryCov_9fa48("1126"), `<br>Last updated ${timeStr}`);
              }
            } else if (stryMutAct_9fa48("1129") ? activeActions !== 0 : stryMutAct_9fa48("1128") ? false : stryMutAct_9fa48("1127") ? true : (stryCov_9fa48("1127", "1128", "1129"), activeActions === 0)) {
              if (stryMutAct_9fa48("1130")) {
                {}
              } else {
                stryCov_9fa48("1130");
                statsHtml = stryMutAct_9fa48("1131") ? "" : (stryCov_9fa48("1131"), 'No data loaded yet<br>Configure API and refresh');
              }
            }
            statsHtml += stryMutAct_9fa48("1132") ? `` : (stryCov_9fa48("1132"), `<br><a href="https://onlinepicketline.com" target="_blank" style="color: inherit; text-decoration: underline; margin-top: 0.5rem; display: inline-block;">More Info at OnlinePicketLine.com</a>`);
            statsContent.innerHTML = statsHtml;
          }
        });
      }
    }

    /**
     * Enable test mode by injecting test data for example.com
     */
    async function enableTestMode() {
      if (stryMutAct_9fa48("1133")) {
        {}
      } else {
        stryCov_9fa48("1133");
        return new Promise((resolve, reject) => {
          if (stryMutAct_9fa48("1134")) {
            {}
          } else {
            stryCov_9fa48("1134");
            // Get current labor actions
            chrome.storage.local.get(stryMutAct_9fa48("1135") ? [] : (stryCov_9fa48("1135"), [stryMutAct_9fa48("1136") ? "" : (stryCov_9fa48("1136"), 'labor_actions')]), result => {
              if (stryMutAct_9fa48("1137")) {
                {}
              } else {
                stryCov_9fa48("1137");
                const currentActions = stryMutAct_9fa48("1140") ? result.labor_actions && [] : stryMutAct_9fa48("1139") ? false : stryMutAct_9fa48("1138") ? true : (stryCov_9fa48("1138", "1139", "1140"), result.labor_actions || (stryMutAct_9fa48("1141") ? ["Stryker was here"] : (stryCov_9fa48("1141"), [])));

                // Create test action for example.com
                const testAction = stryMutAct_9fa48("1142") ? {} : (stryCov_9fa48("1142"), {
                  id: stryMutAct_9fa48("1143") ? "" : (stryCov_9fa48("1143"), 'test-example-com'),
                  title: stryMutAct_9fa48("1144") ? "" : (stryCov_9fa48("1144"), 'TEST MODE: Example Company Workers Strike'),
                  description: stryMutAct_9fa48("1145") ? "" : (stryCov_9fa48("1145"), 'This is a test action to demonstrate the Online Picket Line plugin functionality. Workers at Example Company are demanding better wages, improved working conditions, and union recognition. This test will show how the plugin blocks or warns about sites with active labor actions.'),
                  company: stryMutAct_9fa48("1146") ? "" : (stryCov_9fa48("1146"), 'Example Company'),
                  type: stryMutAct_9fa48("1147") ? "" : (stryCov_9fa48("1147"), 'strike'),
                  status: stryMutAct_9fa48("1148") ? "" : (stryCov_9fa48("1148"), 'active'),
                  more_info: stryMutAct_9fa48("1149") ? "" : (stryCov_9fa48("1149"), 'https://onlinepicketline.com/about'),
                  target_urls: stryMutAct_9fa48("1150") ? [] : (stryCov_9fa48("1150"), [stryMutAct_9fa48("1151") ? "" : (stryCov_9fa48("1151"), 'example.com'), stryMutAct_9fa48("1152") ? "" : (stryCov_9fa48("1152"), 'www.example.com')]),
                  locations: stryMutAct_9fa48("1153") ? [] : (stryCov_9fa48("1153"), [stryMutAct_9fa48("1154") ? "" : (stryCov_9fa48("1154"), 'Worldwide')]),
                  demands: stryMutAct_9fa48("1155") ? "" : (stryCov_9fa48("1155"), 'Fair wages, safe working conditions, union recognition'),
                  startDate: new Date().toISOString().split(stryMutAct_9fa48("1156") ? "" : (stryCov_9fa48("1156"), 'T'))[0],
                  contactInfo: stryMutAct_9fa48("1157") ? "" : (stryCov_9fa48("1157"), 'test@onlinepicketline.com'),
                  divisions: stryMutAct_9fa48("1158") ? [] : (stryCov_9fa48("1158"), [stryMutAct_9fa48("1159") ? "" : (stryCov_9fa48("1159"), 'All Divisions')]),
                  actionResources: stryMutAct_9fa48("1160") ? [] : (stryCov_9fa48("1160"), [stryMutAct_9fa48("1161") ? {} : (stryCov_9fa48("1161"), {
                    title: stryMutAct_9fa48("1162") ? "" : (stryCov_9fa48("1162"), 'Strike Information'),
                    url: stryMutAct_9fa48("1163") ? "" : (stryCov_9fa48("1163"), 'https://onlinepicketline.com/about')
                  }), stryMutAct_9fa48("1164") ? {} : (stryCov_9fa48("1164"), {
                    title: stryMutAct_9fa48("1165") ? "" : (stryCov_9fa48("1165"), 'How to Support'),
                    url: stryMutAct_9fa48("1166") ? "" : (stryCov_9fa48("1166"), 'https://onlinepicketline.com')
                  })]),
                  _isTestAction: stryMutAct_9fa48("1167") ? false : (stryCov_9fa48("1167"), true),
                  _extensionData: stryMutAct_9fa48("1168") ? {} : (stryCov_9fa48("1168"), {
                    matchingUrlRegexes: stryMutAct_9fa48("1169") ? [] : (stryCov_9fa48("1169"), [stryMutAct_9fa48("1170") ? "" : (stryCov_9fa48("1170"), '^https?://(?:www\\.)?example\\.com')]),
                    moreInfoUrl: stryMutAct_9fa48("1171") ? "" : (stryCov_9fa48("1171"), 'https://onlinepicketline.com/about'),
                    actionDetails: stryMutAct_9fa48("1172") ? {} : (stryCov_9fa48("1172"), {
                      id: stryMutAct_9fa48("1173") ? "" : (stryCov_9fa48("1173"), 'test-example-com'),
                      organization: stryMutAct_9fa48("1174") ? "" : (stryCov_9fa48("1174"), 'Example Company'),
                      actionType: stryMutAct_9fa48("1175") ? "" : (stryCov_9fa48("1175"), 'strike'),
                      description: stryMutAct_9fa48("1176") ? "" : (stryCov_9fa48("1176"), 'Test labor action for plugin verification'),
                      status: stryMutAct_9fa48("1177") ? "" : (stryCov_9fa48("1177"), 'active'),
                      location: stryMutAct_9fa48("1178") ? "" : (stryCov_9fa48("1178"), 'Worldwide'),
                      startDate: new Date().toISOString().split(stryMutAct_9fa48("1179") ? "" : (stryCov_9fa48("1179"), 'T'))[0],
                      demands: stryMutAct_9fa48("1180") ? "" : (stryCov_9fa48("1180"), 'Fair wages, safe working conditions, union recognition'),
                      contactInfo: stryMutAct_9fa48("1181") ? "" : (stryCov_9fa48("1181"), 'test@onlinepicketline.com'),
                      urls: stryMutAct_9fa48("1182") ? [] : (stryCov_9fa48("1182"), [stryMutAct_9fa48("1183") ? {} : (stryCov_9fa48("1183"), {
                        title: stryMutAct_9fa48("1184") ? "" : (stryCov_9fa48("1184"), 'Strike Information'),
                        url: stryMutAct_9fa48("1185") ? "" : (stryCov_9fa48("1185"), 'https://onlinepicketline.com/about')
                      })])
                    })
                  })
                });

                // Remove any existing test action and add new one
                const filteredActions = stryMutAct_9fa48("1186") ? currentActions : (stryCov_9fa48("1186"), currentActions.filter(stryMutAct_9fa48("1187") ? () => undefined : (stryCov_9fa48("1187"), a => stryMutAct_9fa48("1188") ? a._isTestAction : (stryCov_9fa48("1188"), !a._isTestAction))));
                const updatedActions = stryMutAct_9fa48("1189") ? [] : (stryCov_9fa48("1189"), [...filteredActions, testAction]);

                // Save updated actions
                chrome.storage.local.set(stryMutAct_9fa48("1190") ? {} : (stryCov_9fa48("1190"), {
                  labor_actions: updatedActions,
                  cache_timestamp: Date.now(),
                  test_mode_enabled: stryMutAct_9fa48("1191") ? false : (stryCov_9fa48("1191"), true)
                }), () => {
                  if (stryMutAct_9fa48("1192")) {
                    {}
                  } else {
                    stryCov_9fa48("1192");
                    if (stryMutAct_9fa48("1194") ? false : stryMutAct_9fa48("1193") ? true : (stryCov_9fa48("1193", "1194"), chrome.runtime.lastError)) {
                      if (stryMutAct_9fa48("1195")) {
                        {}
                      } else {
                        stryCov_9fa48("1195");
                        reject(chrome.runtime.lastError);
                      }
                    } else {
                      if (stryMutAct_9fa48("1196")) {
                        {}
                      } else {
                        stryCov_9fa48("1196");
                        // Reload stats to show the new test action
                        loadStats();
                        resolve();
                      }
                    }
                  }
                });
              }
            });
          }
        });
      }
    }
  }
});