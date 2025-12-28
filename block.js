// Block page script
document.addEventListener('DOMContentLoaded', () => {
  // Display extension version
  const versionDiv = document.getElementById('block-version-info');
  if (versionDiv && chrome.runtime && chrome.runtime.getManifest) {
    const version = chrome.runtime.getManifest().version;
    versionDiv.textContent = `Version: ${version}`;
  }
  const actionTitle = document.getElementById('action-title');
  const actionDescription = document.getElementById('action-description');
  const actionType = document.getElementById('action-type');
  const blockedUrl = document.getElementById('blocked-url');
  const learnMoreBtn = document.getElementById('learn-more-btn');
  const proceedBtn = document.getElementById('proceed-btn');
  const goBackBtn = document.getElementById('go-back-btn');

  // Load blocked action data from background script
  chrome.runtime.sendMessage({ action: 'getBlockedState' }, (response) => {
    if (response) {
      updateUI(response.action, response.url);
      
      // Store original URL for proceed button
      window.originalUrl = response.url;
    } else {
      // Fallback or error state
      document.getElementById('action-title').textContent = 'Error Loading Data';
      document.getElementById('action-description').textContent = 'Could not retrieve labor action details. Please try refreshing.';
    }
  });

  function updateUI(action, originalUrl) {
    if (action) {
      // Update UI with action data
      actionTitle.textContent = action.title || 'Labor Action in Progress';
      actionDescription.textContent = action.description || 
        'This company is currently subject to a labor action. We encourage you to learn more and support workers.';
      
      if (action.type) {
        actionType.textContent = action.type.toUpperCase();
      }
      
      if (action.url || action.more_info) {
        learnMoreBtn.href = action.url || action.more_info;
        learnMoreBtn.style.display = 'inline-block';
      }

      // Show additional details if available
      const detailsContainer = document.getElementById('action-details');
      let hasDetails = false;

      if (action.demands) {
        document.getElementById('action-demands').textContent = action.demands;
        document.getElementById('action-demands-container').style.display = 'block';
        hasDetails = true;
      } else {
        document.getElementById('action-demands-container').style.display = 'none';
      }

      if (action.locations && action.locations.length > 0) {
        document.getElementById('action-location').textContent = action.locations.join(', ');
        document.getElementById('action-location-container').style.display = 'block';
        hasDetails = true;
      } else {
        document.getElementById('action-location-container').style.display = 'none';
      }

      if (action.startDate) {
        let dateText = new Date(action.startDate).toLocaleDateString();
        if (action.endDate) {
          dateText += ' - ' + new Date(action.endDate).toLocaleDateString();
        } else {
          dateText += ' - Present';
        }
        document.getElementById('action-dates').textContent = dateText;
        document.getElementById('action-dates-container').style.display = 'block';
        hasDetails = true;
      } else {
        document.getElementById('action-dates-container').style.display = 'none';
      }

      if (hasDetails) {
        detailsContainer.style.display = 'block';
      }
    }

    if (originalUrl) {
      try {
        const url = new URL(originalUrl);
        blockedUrl.textContent = url.hostname;
      } catch (e) {
        blockedUrl.textContent = originalUrl;
      }
    }
  }

  // Handle proceed button
  proceedBtn.addEventListener('click', () => {
    const urlToProceed = window.originalUrl;
    if (urlToProceed) {
      // Notify background script to allow bypass
      chrome.runtime.sendMessage({ action: 'allowBypass', url: urlToProceed }, () => {
        window.location.href = urlToProceed;
      });
    }
  });

  // Handle go back button
  goBackBtn.addEventListener('click', () => {
    // Go back or close
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  });
});
