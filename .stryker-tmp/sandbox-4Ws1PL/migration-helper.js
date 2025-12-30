// @ts-nocheck
// API Migration Helper Script
// This script helps identify changes needed when updating to a new API version
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
class ApiMigrationHelper {
  constructor(oldApiUrl, newApiUrl) {
    if (stryMutAct_9fa48("843")) {
      {}
    } else {
      stryCov_9fa48("843");
      this.oldApiUrl = oldApiUrl;
      this.newApiUrl = newApiUrl;
    }
  }

  /**
   * Compare API responses to identify structural changes
   */
  async compareApiResponses() {
    if (stryMutAct_9fa48("844")) {
      {}
    } else {
      stryCov_9fa48("844");
      console.log(stryMutAct_9fa48("845") ? "" : (stryCov_9fa48("845"), '🔍 Comparing API responses...'));
      try {
        if (stryMutAct_9fa48("846")) {
          {}
        } else {
          stryCov_9fa48("846");
          // Test old API endpoint
          const oldResponse = await this.testEndpoint(this.oldApiUrl, stryMutAct_9fa48("847") ? "" : (stryCov_9fa48("847"), '/api/blocklist?format=json'));

          // Test potential new endpoints
          const newEndpoints = stryMutAct_9fa48("848") ? [] : (stryCov_9fa48("848"), [stryMutAct_9fa48("849") ? "" : (stryCov_9fa48("849"), '/api/blocklist?format=json'), stryMutAct_9fa48("850") ? "" : (stryCov_9fa48("850"), '/api/v1/blocklist?format=json'), stryMutAct_9fa48("851") ? "" : (stryCov_9fa48("851"), '/api/v2/blocklist?format=json'), stryMutAct_9fa48("852") ? "" : (stryCov_9fa48("852"), '/api/labor-actions'), stryMutAct_9fa48("853") ? "" : (stryCov_9fa48("853"), '/api/actions')]);
          for (const endpoint of newEndpoints) {
            if (stryMutAct_9fa48("854")) {
              {}
            } else {
              stryCov_9fa48("854");
              console.log(stryMutAct_9fa48("855") ? `` : (stryCov_9fa48("855"), `\n📡 Testing ${endpoint}...`));
              const newResponse = await this.testEndpoint(this.newApiUrl, endpoint);
              if (stryMutAct_9fa48("858") ? newResponse.success || oldResponse.success : stryMutAct_9fa48("857") ? false : stryMutAct_9fa48("856") ? true : (stryCov_9fa48("856", "857", "858"), newResponse.success && oldResponse.success)) {
                if (stryMutAct_9fa48("859")) {
                  {}
                } else {
                  stryCov_9fa48("859");
                  this.compareDataStructures(oldResponse.data, newResponse.data, endpoint);
                }
              }
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("860")) {
          {}
        } else {
          stryCov_9fa48("860");
          console.error(stryMutAct_9fa48("861") ? "" : (stryCov_9fa48("861"), '❌ Migration comparison failed:'), error);
        }
      }
    }
  }

  /**
   * Test an API endpoint
   */
  async testEndpoint(baseUrl, endpoint) {
    if (stryMutAct_9fa48("862")) {
      {}
    } else {
      stryCov_9fa48("862");
      try {
        if (stryMutAct_9fa48("863")) {
          {}
        } else {
          stryCov_9fa48("863");
          const response = await fetch(stryMutAct_9fa48("864") ? `` : (stryCov_9fa48("864"), `${baseUrl}${endpoint}`), stryMutAct_9fa48("865") ? {} : (stryCov_9fa48("865"), {
            headers: stryMutAct_9fa48("866") ? {} : (stryCov_9fa48("866"), {
              'Accept': stryMutAct_9fa48("867") ? "" : (stryCov_9fa48("867"), 'application/json')
            })
          }));
          if (stryMutAct_9fa48("870") ? false : stryMutAct_9fa48("869") ? true : stryMutAct_9fa48("868") ? response.ok : (stryCov_9fa48("868", "869", "870"), !response.ok)) {
            if (stryMutAct_9fa48("871")) {
              {}
            } else {
              stryCov_9fa48("871");
              return stryMutAct_9fa48("872") ? {} : (stryCov_9fa48("872"), {
                success: stryMutAct_9fa48("873") ? true : (stryCov_9fa48("873"), false),
                status: response.status,
                error: stryMutAct_9fa48("874") ? `` : (stryCov_9fa48("874"), `HTTP ${response.status}`)
              });
            }
          }
          const data = await response.json();
          return stryMutAct_9fa48("875") ? {} : (stryCov_9fa48("875"), {
            success: stryMutAct_9fa48("876") ? false : (stryCov_9fa48("876"), true),
            data,
            status: response.status
          });
        }
      } catch (error) {
        if (stryMutAct_9fa48("877")) {
          {}
        } else {
          stryCov_9fa48("877");
          return stryMutAct_9fa48("878") ? {} : (stryCov_9fa48("878"), {
            success: stryMutAct_9fa48("879") ? true : (stryCov_9fa48("879"), false),
            error: error.message
          });
        }
      }
    }
  }

  /**
   * Compare data structures between old and new API
   */
  compareDataStructures(oldData, newData, endpoint) {
    if (stryMutAct_9fa48("880")) {
      {}
    } else {
      stryCov_9fa48("880");
      console.log(stryMutAct_9fa48("881") ? `` : (stryCov_9fa48("881"), `\n🔄 Comparing data structure for ${endpoint}:`));

      // Check top-level structure
      const oldKeys = Object.keys(oldData);
      const newKeys = Object.keys(newData);
      const addedKeys = stryMutAct_9fa48("882") ? newKeys : (stryCov_9fa48("882"), newKeys.filter(stryMutAct_9fa48("883") ? () => undefined : (stryCov_9fa48("883"), key => stryMutAct_9fa48("884") ? oldKeys.includes(key) : (stryCov_9fa48("884"), !oldKeys.includes(key)))));
      const removedKeys = stryMutAct_9fa48("885") ? oldKeys : (stryCov_9fa48("885"), oldKeys.filter(stryMutAct_9fa48("886") ? () => undefined : (stryCov_9fa48("886"), key => stryMutAct_9fa48("887") ? newKeys.includes(key) : (stryCov_9fa48("887"), !newKeys.includes(key)))));
      const commonKeys = stryMutAct_9fa48("888") ? oldKeys : (stryCov_9fa48("888"), oldKeys.filter(stryMutAct_9fa48("889") ? () => undefined : (stryCov_9fa48("889"), key => newKeys.includes(key))));
      if (stryMutAct_9fa48("893") ? addedKeys.length <= 0 : stryMutAct_9fa48("892") ? addedKeys.length >= 0 : stryMutAct_9fa48("891") ? false : stryMutAct_9fa48("890") ? true : (stryCov_9fa48("890", "891", "892", "893"), addedKeys.length > 0)) {
        if (stryMutAct_9fa48("894")) {
          {}
        } else {
          stryCov_9fa48("894");
          console.log(stryMutAct_9fa48("895") ? "" : (stryCov_9fa48("895"), '➕ Added fields:'), addedKeys);
        }
      }
      if (stryMutAct_9fa48("899") ? removedKeys.length <= 0 : stryMutAct_9fa48("898") ? removedKeys.length >= 0 : stryMutAct_9fa48("897") ? false : stryMutAct_9fa48("896") ? true : (stryCov_9fa48("896", "897", "898", "899"), removedKeys.length > 0)) {
        if (stryMutAct_9fa48("900")) {
          {}
        } else {
          stryCov_9fa48("900");
          console.log(stryMutAct_9fa48("901") ? "" : (stryCov_9fa48("901"), '❌ Removed fields:'), removedKeys);
        }
      }
      if (stryMutAct_9fa48("905") ? commonKeys.length <= 0 : stryMutAct_9fa48("904") ? commonKeys.length >= 0 : stryMutAct_9fa48("903") ? false : stryMutAct_9fa48("902") ? true : (stryCov_9fa48("902", "903", "904", "905"), commonKeys.length > 0)) {
        if (stryMutAct_9fa48("906")) {
          {}
        } else {
          stryCov_9fa48("906");
          console.log(stryMutAct_9fa48("907") ? "" : (stryCov_9fa48("907"), '✅ Common fields:'), commonKeys);

          // Check blocklist structure specifically
          if (stryMutAct_9fa48("910") ? oldData.blocklist || newData.blocklist : stryMutAct_9fa48("909") ? false : stryMutAct_9fa48("908") ? true : (stryCov_9fa48("908", "909", "910"), oldData.blocklist && newData.blocklist)) {
            if (stryMutAct_9fa48("911")) {
              {}
            } else {
              stryCov_9fa48("911");
              this.compareBlocklistStructure(oldData.blocklist, newData.blocklist);
            }
          }
        }
      }
    }
  }

  /**
   * Compare blocklist item structure
   */
  compareBlocklistStructure(oldBlocklist, newBlocklist) {
    if (stryMutAct_9fa48("912")) {
      {}
    } else {
      stryCov_9fa48("912");
      if (stryMutAct_9fa48("915") ? oldBlocklist.length === 0 && newBlocklist.length === 0 : stryMutAct_9fa48("914") ? false : stryMutAct_9fa48("913") ? true : (stryCov_9fa48("913", "914", "915"), (stryMutAct_9fa48("917") ? oldBlocklist.length !== 0 : stryMutAct_9fa48("916") ? false : (stryCov_9fa48("916", "917"), oldBlocklist.length === 0)) || (stryMutAct_9fa48("919") ? newBlocklist.length !== 0 : stryMutAct_9fa48("918") ? false : (stryCov_9fa48("918", "919"), newBlocklist.length === 0)))) {
        if (stryMutAct_9fa48("920")) {
          {}
        } else {
          stryCov_9fa48("920");
          console.log(stryMutAct_9fa48("921") ? "" : (stryCov_9fa48("921"), '⚠️ Empty blocklist - cannot compare structure'));
          return;
        }
      }
      console.log(stryMutAct_9fa48("922") ? "" : (stryCov_9fa48("922"), '\n📋 Comparing blocklist item structure:'));
      const oldItem = oldBlocklist[0];
      const newItem = newBlocklist[0];
      const oldItemKeys = Object.keys(oldItem);
      const newItemKeys = Object.keys(newItem);
      const addedFields = stryMutAct_9fa48("923") ? newItemKeys : (stryCov_9fa48("923"), newItemKeys.filter(stryMutAct_9fa48("924") ? () => undefined : (stryCov_9fa48("924"), key => stryMutAct_9fa48("925") ? oldItemKeys.includes(key) : (stryCov_9fa48("925"), !oldItemKeys.includes(key)))));
      const removedFields = stryMutAct_9fa48("926") ? oldItemKeys : (stryCov_9fa48("926"), oldItemKeys.filter(stryMutAct_9fa48("927") ? () => undefined : (stryCov_9fa48("927"), key => stryMutAct_9fa48("928") ? newItemKeys.includes(key) : (stryCov_9fa48("928"), !newItemKeys.includes(key)))));
      if (stryMutAct_9fa48("932") ? addedFields.length <= 0 : stryMutAct_9fa48("931") ? addedFields.length >= 0 : stryMutAct_9fa48("930") ? false : stryMutAct_9fa48("929") ? true : (stryCov_9fa48("929", "930", "931", "932"), addedFields.length > 0)) {
        if (stryMutAct_9fa48("933")) {
          {}
        } else {
          stryCov_9fa48("933");
          console.log(stryMutAct_9fa48("934") ? "" : (stryCov_9fa48("934"), '➕ New blocklist fields:'), addedFields);
        }
      }
      if (stryMutAct_9fa48("938") ? removedFields.length <= 0 : stryMutAct_9fa48("937") ? removedFields.length >= 0 : stryMutAct_9fa48("936") ? false : stryMutAct_9fa48("935") ? true : (stryCov_9fa48("935", "936", "937", "938"), removedFields.length > 0)) {
        if (stryMutAct_9fa48("939")) {
          {}
        } else {
          stryCov_9fa48("939");
          console.log(stryMutAct_9fa48("940") ? "" : (stryCov_9fa48("940"), '❌ Removed blocklist fields:'), removedFields);
        }
      }

      // Check actionDetails structure
      if (stryMutAct_9fa48("943") ? oldItem.actionDetails || newItem.actionDetails : stryMutAct_9fa48("942") ? false : stryMutAct_9fa48("941") ? true : (stryCov_9fa48("941", "942", "943"), oldItem.actionDetails && newItem.actionDetails)) {
        if (stryMutAct_9fa48("944")) {
          {}
        } else {
          stryCov_9fa48("944");
          console.log(stryMutAct_9fa48("945") ? "" : (stryCov_9fa48("945"), '🔍 actionDetails structure comparison:'));
          console.log(stryMutAct_9fa48("946") ? "" : (stryCov_9fa48("946"), 'Old actionDetails keys:'), Object.keys(oldItem.actionDetails));
          console.log(stryMutAct_9fa48("947") ? "" : (stryCov_9fa48("947"), 'New actionDetails keys:'), Object.keys(newItem.actionDetails));
        }
      }
    }
  }

  /**
   * Generate migration recommendations
   */
  generateMigrationPlan(changes) {
    if (stryMutAct_9fa48("948")) {
      {}
    } else {
      stryCov_9fa48("948");
      console.log(stryMutAct_9fa48("949") ? "" : (stryCov_9fa48("949"), '\n📝 Migration Plan:'));
      console.log(stryMutAct_9fa48("950") ? "" : (stryCov_9fa48("950"), '=================='));
      const updates = stryMutAct_9fa48("951") ? ["Stryker was here"] : (stryCov_9fa48("951"), []);

      // Add specific recommendations based on common changes
      updates.push(stryMutAct_9fa48("952") ? {} : (stryCov_9fa48("952"), {
        file: stryMutAct_9fa48("953") ? "" : (stryCov_9fa48("953"), 'api-service.js'),
        changes: stryMutAct_9fa48("954") ? [] : (stryCov_9fa48("954"), [stryMutAct_9fa48("955") ? "" : (stryCov_9fa48("955"), 'Update CACHE_DURATION if rate limiting changed'), stryMutAct_9fa48("956") ? "" : (stryCov_9fa48("956"), 'Check transformApiResponse() method for new fields'), stryMutAct_9fa48("957") ? "" : (stryCov_9fa48("957"), 'Update error handling for new response codes')])
      }));
      updates.push(stryMutAct_9fa48("958") ? {} : (stryCov_9fa48("958"), {
        file: stryMutAct_9fa48("959") ? "" : (stryCov_9fa48("959"), 'popup.js'),
        changes: stryMutAct_9fa48("960") ? [] : (stryCov_9fa48("960"), [stryMutAct_9fa48("961") ? "" : (stryCov_9fa48("961"), 'Add API key input field if authentication added'), stryMutAct_9fa48("962") ? "" : (stryCov_9fa48("962"), 'Update connection test logic'), stryMutAct_9fa48("963") ? "" : (stryCov_9fa48("963"), 'Handle new error response formats')])
      }));
      updates.push(stryMutAct_9fa48("964") ? {} : (stryCov_9fa48("964"), {
        file: stryMutAct_9fa48("965") ? "" : (stryCov_9fa48("965"), 'background.js'),
        changes: stryMutAct_9fa48("966") ? [] : (stryCov_9fa48("966"), [stryMutAct_9fa48("967") ? "" : (stryCov_9fa48("967"), 'Update URL matching logic for new data structure'), stryMutAct_9fa48("968") ? "" : (stryCov_9fa48("968"), 'Adjust refresh intervals if recommended'), stryMutAct_9fa48("969") ? "" : (stryCov_9fa48("969"), 'Handle new action types or statuses')])
      }));
      updates.forEach(update => {
        if (stryMutAct_9fa48("970")) {
          {}
        } else {
          stryCov_9fa48("970");
          console.log(stryMutAct_9fa48("971") ? `` : (stryCov_9fa48("971"), `\n📄 ${update.file}:`));
          update.changes.forEach(change => {
            if (stryMutAct_9fa48("972")) {
              {}
            } else {
              stryCov_9fa48("972");
              console.log(stryMutAct_9fa48("973") ? `` : (stryCov_9fa48("973"), `   • ${change}`));
            }
          });
        }
      });
    }
  }
}

// Usage example:
// const migrator = new ApiMigrationHelper('https://old-api.com', 'https://new-api.com');
// migrator.compareApiResponses();

// Export for use in console
window.ApiMigrationHelper = ApiMigrationHelper;