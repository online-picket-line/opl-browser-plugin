/**
 * Strike Card Renderer
 * 
 * Renders labor action information cards that replace ad elements.
 * Cards are adaptive — showing different levels of detail based on 
 * the available space (small, medium, large).
 * 
 * Uses the same design language as the OPL theme (oklch colors, 
 * IBM Plex fonts, hard shadow).
 */

// API base URL for resolving relative logo URLs  
var STRIKE_CARD_API_BASE = 'https://onlinepicketline.com';

/**
 * Resolve a logo URL, converting relative paths to absolute.
 * @param {string} url - Logo URL (may be relative like /union_logos/foo.png)
 * @returns {string} - Absolute URL
 */
function resolveLogoUrl(url) {
  if (!url) return '';
  if (url.startsWith('/')) {
    return STRIKE_CARD_API_BASE + url;
  }
  return url;
}

/**
 * Get the best available logo URL from an action object.
 * @param {Object} action - Labor action data
 * @returns {string} - Logo URL or empty string
 */
function getActionLogoUrl(action) {
  var url = action.logoUrl ||
    (action._extensionData && action._extensionData.logoUrl) ||
    (action._extensionData && action._extensionData.unionLogoUrl) ||
    (action._extensionData && action._extensionData.actionDetails && action._extensionData.actionDetails.logoUrl) ||
    (action._extensionData && action._extensionData.actionDetails && action._extensionData.actionDetails.unionLogoUrl) ||
    '';
  return resolveLogoUrl(url);
}

/**
 * Get the best available "learn more" URL from an action object.
 * @param {Object} action - Labor action data
 * @returns {string} - URL or empty string
 */
function getActionMoreInfoUrl(action) {
  return action.more_info || action.url ||
    (action._extensionData && action._extensionData.moreInfoUrl) ||
    (action._extensionData && action._extensionData.actionDetails && action._extensionData.actionDetails.learnMoreUrl) ||
    '';
}

/**
 * Get a display-friendly action type string.
 * @param {Object} action - Labor action data
 * @returns {string} - e.g., "Strike", "Boycott", "Picket"
 */
function getActionTypeLabel(action) {
  var type = action.type || 
    (action._extensionData && action._extensionData.actionDetails && action._extensionData.actionDetails.actionType) ||
    'action';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Truncate text to a maximum length, adding ellipsis if needed.
 * @param {string} text - Text to truncate
 * @param {number} maxLen - Maximum length
 * @returns {string}
 */
function truncateText(text, maxLen) {
  if (!text || text.length <= maxLen) return text || '';
  return text.substring(0, maxLen - 1) + '…';
}

/**
 * Create a small strike card (for narrow/tiny ad slots).
 * Shows: fist emoji + "Workers on strike at {employer}" + Learn More link
 * 
 * @param {Object} action - Labor action data
 * @param {number} width - Available width in pixels
 * @param {number} height - Available height in pixels
 * @returns {HTMLElement}
 */
function renderSmallCard(action, width, height) {
  var card = document.createElement('div');
  card.className = 'opl-strike-card opl-strike-card-small';
  card.style.width = width + 'px';
  card.style.height = height + 'px';

  var employer = action.company || action.employer || 'this employer';
  var typeLabel = getActionTypeLabel(action);
  var moreInfoUrl = getActionMoreInfoUrl(action);

  var inner = document.createElement('div');
  inner.className = 'opl-strike-card-inner';

  // Fist icon
  var icon = document.createElement('span');
  icon.className = 'opl-strike-card-icon';
  icon.textContent = '✊';
  inner.appendChild(icon);

  // Headline text
  var headline = document.createElement('span');
  headline.className = 'opl-strike-card-headline';
  headline.textContent = typeLabel + ' at ' + truncateText(employer, 30);
  inner.appendChild(headline);

  // Learn more link
  if (moreInfoUrl) {
    var link = document.createElement('a');
    link.className = 'opl-strike-card-link';
    link.href = moreInfoUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Learn More →';
    inner.appendChild(link);
  }

  card.appendChild(inner);
  return card;
}

/**
 * Create a medium strike card.
 * Shows: logo + type badge + employer + location + Learn More button
 * 
 * @param {Object} action - Labor action data
 * @param {number} width - Available width in pixels
 * @param {number} height - Available height in pixels
 * @returns {HTMLElement}
 */
function renderMediumCard(action, width, height) {
  var card = document.createElement('div');
  card.className = 'opl-strike-card opl-strike-card-medium';
  card.style.width = width + 'px';
  card.style.height = height + 'px';

  var employer = action.company || action.employer || 'Unknown Employer';
  var typeLabel = getActionTypeLabel(action);
  var moreInfoUrl = getActionMoreInfoUrl(action);
  var logoUrl = getActionLogoUrl(action);
  var location = (action.locations && action.locations.length > 0) ? action.locations[0] : '';

  var inner = document.createElement('div');
  inner.className = 'opl-strike-card-inner';

  // Top row: logo + text
  var topRow = document.createElement('div');
  topRow.className = 'opl-strike-card-top-row';

  // Logo or icon
  if (logoUrl) {
    var logo = document.createElement('img');
    logo.className = 'opl-strike-card-logo';
    logo.src = logoUrl;
    logo.alt = 'Union logo';
    logo.onerror = function() { this.style.display = 'none'; };
    topRow.appendChild(logo);
  } else {
    var icon = document.createElement('span');
    icon.className = 'opl-strike-card-icon opl-strike-card-icon-medium';
    icon.textContent = '✊';
    topRow.appendChild(icon);
  }

  var textCol = document.createElement('div');
  textCol.className = 'opl-strike-card-text-col';

  // Action type badge
  var badge = document.createElement('span');
  badge.className = 'opl-strike-card-badge';
  badge.textContent = '🪧 ' + typeLabel;
  textCol.appendChild(badge);

  // Employer name
  var empEl = document.createElement('div');
  empEl.className = 'opl-strike-card-employer';
  empEl.textContent = truncateText(employer, 40);
  textCol.appendChild(empEl);

  // Location
  if (location) {
    var locEl = document.createElement('div');
    locEl.className = 'opl-strike-card-location';
    locEl.textContent = location;
    textCol.appendChild(locEl);
  }

  topRow.appendChild(textCol);
  inner.appendChild(topRow);

  // Learn More button
  if (moreInfoUrl) {
    var btn = document.createElement('a');
    btn.className = 'opl-strike-card-btn';
    btn.href = moreInfoUrl;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.textContent = 'Learn More';
    inner.appendChild(btn);
  }

  // OPL footer
  var footer = document.createElement('div');
  footer.className = 'opl-strike-card-footer';
  footer.textContent = 'via Online Picket Line';
  inner.appendChild(footer);

  card.appendChild(inner);
  return card;
}

/**
 * Create a large strike card (full detail).
 * Shows: logo, badge, title, employer, location, demands, description, Learn More, footer.
 * 
 * @param {Object} action - Labor action data
 * @param {number} width - Available width in pixels
 * @param {number} height - Available height in pixels
 * @returns {HTMLElement}
 */
function renderLargeCard(action, width, height) {
  var card = document.createElement('div');
  card.className = 'opl-strike-card opl-strike-card-large';
  card.style.width = width + 'px';
  card.style.height = height + 'px';

  var employer = action.company || action.employer || 'Unknown Employer';
  var typeLabel = getActionTypeLabel(action);
  var moreInfoUrl = getActionMoreInfoUrl(action);
  var logoUrl = getActionLogoUrl(action);
  var location = (action.locations && action.locations.length > 0) ? action.locations[0] : '';
  var title = action.title || '';
  var demands = action.demands || '';
  var description = action.description || '';

  var inner = document.createElement('div');
  inner.className = 'opl-strike-card-inner';

  // Header row: logo + title area
  var header = document.createElement('div');
  header.className = 'opl-strike-card-header';

  if (logoUrl) {
    var logo = document.createElement('img');
    logo.className = 'opl-strike-card-logo opl-strike-card-logo-large';
    logo.src = logoUrl;
    logo.alt = 'Union logo';
    logo.onerror = function() { this.style.display = 'none'; };
    header.appendChild(logo);
  }

  var headerText = document.createElement('div');
  headerText.className = 'opl-strike-card-header-text';

  // Action type badge
  var badge = document.createElement('span');
  badge.className = 'opl-strike-card-badge';
  badge.textContent = '🪧 ' + typeLabel;
  headerText.appendChild(badge);

  // Title (e.g., "UAW Strike at Amazon")
  var titleEl = document.createElement('div');
  titleEl.className = 'opl-strike-card-title';
  if (title) {
    titleEl.textContent = truncateText(title, 60);
  } else {
    titleEl.textContent = typeLabel + ' at ' + truncateText(employer, 50);
  }
  headerText.appendChild(titleEl);

  // Employer + location
  var subline = document.createElement('div');
  subline.className = 'opl-strike-card-subline';
  subline.textContent = employer + (location ? ' — ' + location : '');
  headerText.appendChild(subline);

  header.appendChild(headerText);
  inner.appendChild(header);

  // Demands
  if (demands) {
    var demandsEl = document.createElement('div');
    demandsEl.className = 'opl-strike-card-demands';
    var demandsLabel = document.createElement('strong');
    demandsLabel.textContent = 'Demands: ';
    demandsEl.appendChild(demandsLabel);
    demandsEl.appendChild(document.createTextNode(truncateText(demands, 120)));
    inner.appendChild(demandsEl);
  }

  // Description
  if (description) {
    var descEl = document.createElement('div');
    descEl.className = 'opl-strike-card-description';
    descEl.textContent = truncateText(description, 180);
    inner.appendChild(descEl);
  }

  // Bottom row: Learn More button + footer
  var bottomRow = document.createElement('div');
  bottomRow.className = 'opl-strike-card-bottom-row';

  if (moreInfoUrl) {
    var btn = document.createElement('a');
    btn.className = 'opl-strike-card-btn';
    btn.href = moreInfoUrl;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.textContent = 'Learn More';
    bottomRow.appendChild(btn);
  }

  var footer = document.createElement('div');
  footer.className = 'opl-strike-card-footer';
  footer.textContent = '✊ Online Picket Line';
  bottomRow.appendChild(footer);

  inner.appendChild(bottomRow);
  card.appendChild(inner);
  return card;
}

/**
 * Render a strike card sized to the given ad slot.
 * Delegates to small/medium/large renderers based on size category.
 * 
 * @param {Object} action - Labor action data
 * @param {'small'|'medium'|'large'} size - Size category from getAdSize()
 * @param {{width: number, height: number}} rect - Exact dimensions to fill
 * @returns {HTMLElement} - The card DOM element
 */
function renderStrikeCard(action, size, rect) {
  var width = rect.width;
  var height = rect.height;

  var card;
  if (size === 'large') {
    card = renderLargeCard(action, width, height);
  } else if (size === 'medium') {
    card = renderMediumCard(action, width, height);
  } else {
    card = renderSmallCard(action, width, height);
  }

  card.setAttribute('data-opl-injected', 'true');
  return card;
}

// Export for Node.js/Jest testing environment
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof process !== 'undefined') {
  module.exports = {
    renderStrikeCard,
    renderSmallCard,
    renderMediumCard,
    renderLargeCard,
    resolveLogoUrl,
    getActionLogoUrl,
    getActionMoreInfoUrl,
    getActionTypeLabel,
    truncateText,
    STRIKE_CARD_API_BASE
  };
}
