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

  // Wrap the card in a Shadow DOM to isolate it from the host page's CSS.
  // Without this, sites like HuffPost override our dimensions via broad CSS rules
  // (e.g., `div { width: 100% !important }`) causing the card to go full-page.
  return _wrapInShadow(card, width, height);
}

/**
 * Return the CSS styles for strike cards as a string.
 * These are injected into each Shadow DOM root so the card renders
 * correctly regardless of the host page's styles.
 *
 * @returns {string} - CSS text
 */
function _getCardStyles() {
  return [
    ':host { display: block !important; box-sizing: border-box !important; }',

    '.opl-strike-card {',
    '  box-sizing: border-box; overflow: hidden;',
    '  width: 100%; height: 100%;',
    '  font-family: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
    '  background: #faf8f5;',
    '  border: 2px solid #1a1a1a; border-right-width: 5px; border-bottom-width: 5px;',
    '  color: #1a1a1a;',
    '  line-height: 1.4; cursor: default; display: flex; align-items: stretch;',
    '  position: static;',
    '}',
    '.opl-strike-card * { box-sizing: border-box; }',

    '.opl-strike-card-inner {',
    '  display: flex; flex-direction: column; justify-content: center;',
    '  padding: 8px; width: 100%; height: 100%; overflow: hidden; min-width: 0;',
    '}',

    '/* Small */',
    '.opl-strike-card-small .opl-strike-card-inner { align-items: center; text-align: center; gap: 4px; padding: 6px; }',
    '.opl-strike-card-icon { font-size: 20px; line-height: 1; flex-shrink: 0; }',
    '.opl-strike-card-headline { font-size: 11px; font-weight: 600; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; max-width: 100%; }',
    '.opl-strike-card-link { font-size: 10px; color: #8B2C2C; text-decoration: underline; font-weight: 500; white-space: nowrap; }',
    '.opl-strike-card-link:hover { opacity: 0.7; }',

    '/* Medium */',
    '.opl-strike-card-medium .opl-strike-card-inner { gap: 6px; padding: 10px; }',
    '.opl-strike-card-top-row { display: flex; align-items: flex-start; gap: 8px; min-width: 0; }',
    '.opl-strike-card-logo { width: 32px; height: 32px; object-fit: contain; flex-shrink: 0; border-radius: 2px; background: rgb(0 0 0 / 5%); padding: 2px; }',
    '.opl-strike-card-icon-medium { font-size: 28px; width: 32px; text-align: center; }',
    '.opl-strike-card-text-col { flex: 1; min-width: 0; overflow: hidden; }',
    '.opl-strike-card-badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #8B2C2C; margin-bottom: 2px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }',
    '.opl-strike-card-employer { font-size: 13px; font-weight: 600; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
    '.opl-strike-card-location { font-size: 11px; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
    '.opl-strike-card-btn { display: inline-block; background: #8B2C2C; color: #fff; font-size: 11px; font-weight: 600; padding: 4px 12px; text-decoration: none; border: 1px solid #1a1a1a; border-right-width: 2px; border-bottom-width: 2px; text-align: center; cursor: pointer; transition: opacity 0.15s; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
    '.opl-strike-card-btn:hover { opacity: 0.85; }',
    '.opl-strike-card-footer { font-size: 9px; color: #888; text-align: right; white-space: nowrap; }',

    '/* Large */',
    '.opl-strike-card-large .opl-strike-card-inner { gap: 8px; padding: 14px; }',
    '.opl-strike-card-header { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }',
    '.opl-strike-card-logo-large { width: 48px; height: 48px; }',
    '.opl-strike-card-header-text { flex: 1; min-width: 0; overflow: hidden; }',
    '.opl-strike-card-title { font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }',
    '.opl-strike-card-subline { font-size: 12px; color: #555; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
    '.opl-strike-card-demands { font-size: 12px; color: #333; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; max-width: 100%; }',
    '.opl-strike-card-demands strong { color: #8B2C2C; }',
    '.opl-strike-card-description { font-size: 11px; color: #555; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; max-width: 100%; }',
    '.opl-strike-card-bottom-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; min-width: 0; }'
  ].join('\n');
}

/**
 * Wrap a card element inside a Shadow DOM host for CSS isolation.
 * Injects the card styles directly into the shadow root so they apply
 * without being affected by (or affecting) the host page's styles.
 *
 * @param {HTMLElement} card - The rendered card element
 * @param {number} width - Card width in pixels
 * @param {number} height - Card height in pixels
 * @returns {HTMLElement} - The shadow host element (ready to insert into the page)
 */
function _wrapInShadow(card, width, height) {
  var host = document.createElement('div');
  host.setAttribute('data-opl-injected', 'true');
  // Use 100% width so the host respects parent constraints (flex/grid/column),
  // with max-width/max-height as caps to prevent expansion.
  host.style.setProperty('width', '100%', 'important');
  host.style.setProperty('height', height + 'px', 'important');
  host.style.setProperty('max-width', width + 'px', 'important');
  host.style.setProperty('max-height', height + 'px', 'important');
  host.style.setProperty('display', 'block', 'important');
  host.style.setProperty('position', 'static', 'important');
  host.style.setProperty('box-sizing', 'border-box', 'important');
  host.style.setProperty('margin', '0', 'important');
  host.style.setProperty('padding', '0', 'important');
  host.style.setProperty('float', 'none', 'important');

  // Use Shadow DOM if available (all modern browsers), otherwise fall back to plain DOM
  if (typeof host.attachShadow === 'function') {
    var shadow = host.attachShadow({ mode: 'closed' });
    // Inject styles directly into the shadow root
    var styleEl = document.createElement('style');
    styleEl.textContent = _getCardStyles();
    shadow.appendChild(styleEl);
    shadow.appendChild(card);
  } else {
    // Fallback: no Shadow DOM (shouldn't happen in Firefox 140+)
    host.appendChild(card);
  }

  return host;
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
    _wrapInShadow,
    _getCardStyles,
    STRIKE_CARD_API_BASE
  };
}
