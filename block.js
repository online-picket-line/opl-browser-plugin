// Block page script
document.addEventListener('DOMContentLoaded', () => {
  const actionTitle = document.getElementById('action-title');
  const actionDescription = document.getElementById('action-description');
  const actionType = document.getElementById('action-type');
  const blockedUrl = document.getElementById('blocked-url');
  const unionLogo = document.getElementById('union-logo');
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
      // Display union logo if available
      if (action.logoUrl) {
        unionLogo.src = action.logoUrl;
        unionLogo.style.display = 'block';
      } else {
        unionLogo.style.display = 'none';
      }

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
    // Check if we have a meaningful history to go back to
    // If we came directly from a new tab (like test mode), redirect to onlinepicketline.com
    if (window.history.length <= 2 && window.originalUrl) {
      // History is too short (just the blocked page), go to onlinepicketline.com
      window.location.href = 'https://onlinepicketline.com';
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  });
});
