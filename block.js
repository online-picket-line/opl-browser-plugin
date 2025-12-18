// Block page script
document.addEventListener('DOMContentLoaded', () => {
  const actionTitle = document.getElementById('action-title');
  const actionDescription = document.getElementById('action-description');
  const actionType = document.getElementById('action-type');
  const blockedUrl = document.getElementById('blocked-url');
  const learnMoreBtn = document.getElementById('learn-more-btn');
  const proceedBtn = document.getElementById('proceed-btn');
  const goBackBtn = document.getElementById('go-back-btn');

  // Load blocked action data
  const actionData = sessionStorage.getItem('opl_blocked_action');
  const originalUrl = sessionStorage.getItem('opl_blocked_url');

  if (actionData) {
    try {
      const action = JSON.parse(actionData);
      
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
    } catch (e) {
      console.error('Failed to parse action data:', e);
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

  // Handle proceed button
  proceedBtn.addEventListener('click', () => {
    if (originalUrl) {
      // Clear session storage and navigate to original URL
      sessionStorage.removeItem('opl_blocked_action');
      sessionStorage.removeItem('opl_blocked_url');
      
      // Add a flag to prevent re-blocking
      sessionStorage.setItem('opl_bypass', 'true');
      
      window.location.href = originalUrl;
    }
  });

  // Handle go back button
  goBackBtn.addEventListener('click', () => {
    // Clear session storage
    sessionStorage.removeItem('opl_blocked_action');
    sessionStorage.removeItem('opl_blocked_url');
    
    // Go back or close
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  });
});
