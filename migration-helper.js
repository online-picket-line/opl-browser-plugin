// API Migration Helper Script
// This script helps identify changes needed when updating to a new API version

class ApiMigrationHelper {
  constructor(oldApiUrl, newApiUrl) {
    this.oldApiUrl = oldApiUrl;
    this.newApiUrl = newApiUrl;
  }

  /**
   * Compare API responses to identify structural changes
   */
  async compareApiResponses() {
    console.log('🔍 Comparing API responses...');

    try {
      // Test old API endpoint
      const oldResponse = await this.testEndpoint(this.oldApiUrl, '/api/blocklist?format=json');

      // Test potential new endpoints
      const newEndpoints = [
        '/api/blocklist?format=json',
        '/api/v1/blocklist?format=json',
        '/api/v2/blocklist?format=json',
        '/api/labor-actions',
        '/api/actions'
      ];

      for (const endpoint of newEndpoints) {
        console.log(`\n📡 Testing ${endpoint}...`);
        const newResponse = await this.testEndpoint(this.newApiUrl, endpoint);

        if (newResponse.success && oldResponse.success) {
          this.compareDataStructures(oldResponse.data, newResponse.data, endpoint);
        }
      }
    } catch (error) {
      console.error('❌ Migration comparison failed:', error);
    }
  }

  /**
   * Test an API endpoint
   */
  async testEndpoint(baseUrl, endpoint) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error: `HTTP ${response.status}`
        };
      }

      const data = await response.json();
      return { success: true, data, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Compare data structures between old and new API
   */
  compareDataStructures(oldData, newData, endpoint) {
    console.log(`\n🔄 Comparing data structure for ${endpoint}:`);

    // Check top-level structure
    const oldKeys = Object.keys(oldData);
    const newKeys = Object.keys(newData);

    const addedKeys = newKeys.filter(key => !oldKeys.includes(key));
    const removedKeys = oldKeys.filter(key => !newKeys.includes(key));
    const commonKeys = oldKeys.filter(key => newKeys.includes(key));

    if (addedKeys.length > 0) {
      console.log('➕ Added fields:', addedKeys);
    }

    if (removedKeys.length > 0) {
      console.log('❌ Removed fields:', removedKeys);
    }

    if (commonKeys.length > 0) {
      console.log('✅ Common fields:', commonKeys);

      // Check blocklist structure specifically
      if (oldData.blocklist && newData.blocklist) {
        this.compareBlocklistStructure(oldData.blocklist, newData.blocklist);
      }
    }
  }

  /**
   * Compare blocklist item structure
   */
  compareBlocklistStructure(oldBlocklist, newBlocklist) {
    if (oldBlocklist.length === 0 || newBlocklist.length === 0) {
      console.log('⚠️ Empty blocklist - cannot compare structure');
      return;
    }

    console.log('\n📋 Comparing blocklist item structure:');

    const oldItem = oldBlocklist[0];
    const newItem = newBlocklist[0];

    const oldItemKeys = Object.keys(oldItem);
    const newItemKeys = Object.keys(newItem);

    const addedFields = newItemKeys.filter(key => !oldItemKeys.includes(key));
    const removedFields = oldItemKeys.filter(key => !newItemKeys.includes(key));

    if (addedFields.length > 0) {
      console.log('➕ New blocklist fields:', addedFields);
    }

    if (removedFields.length > 0) {
      console.log('❌ Removed blocklist fields:', removedFields);
    }

    // Check actionDetails structure
    if (oldItem.actionDetails && newItem.actionDetails) {
      console.log('🔍 actionDetails structure comparison:');
      console.log('Old actionDetails keys:', Object.keys(oldItem.actionDetails));
      console.log('New actionDetails keys:', Object.keys(newItem.actionDetails));
    }
  }

  /**
   * Generate migration recommendations
   */
  generateMigrationPlan(changes) {
    console.log('\n📝 Migration Plan:');
    console.log('==================');

    const updates = [];

    // Add specific recommendations based on common changes
    updates.push({
      file: 'api-service.js',
      changes: [
        'Update CACHE_DURATION if rate limiting changed',
        'Check transformApiResponse() method for new fields',
        'Update error handling for new response codes'
      ]
    });

    updates.push({
      file: 'popup.js',
      changes: [
        'Add API key input field if authentication added',
        'Update connection test logic',
        'Handle new error response formats'
      ]
    });

    updates.push({
      file: 'background.js',
      changes: [
        'Update URL matching logic for new data structure',
        'Adjust refresh intervals if recommended',
        'Handle new action types or statuses'
      ]
    });

    updates.forEach(update => {
      console.log(`\n📄 ${update.file}:`);
      update.changes.forEach(change => {
        console.log(`   • ${change}`);
      });
    });
  }
}

// Usage example:
// const migrator = new ApiMigrationHelper('https://old-api.com', 'https://new-api.com');
// migrator.compareApiResponses();

// Export for use in console
window.ApiMigrationHelper = ApiMigrationHelper;
