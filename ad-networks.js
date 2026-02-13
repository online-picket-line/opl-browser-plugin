/**
 * Ad Network Domain List
 * 
 * Known advertising network domains used for:
 * 1. DNR rules to block ad network requests (when user enables ad blocking)
 * 2. iframe src matching in ad detection
 * 
 * Each entry has:
 * - domain: The ad network domain
 * - urlFilter: DNR urlFilter format for blocking
 * - provider: Human-readable provider name for grouping
 */

var AD_NETWORK_DOMAINS = [
  // Google Ads / AdSense / DoubleClick
  { domain: 'googlesyndication.com', urlFilter: '||googlesyndication.com^', provider: 'Google' },
  { domain: 'pagead2.googlesyndication.com', urlFilter: '||pagead2.googlesyndication.com^', provider: 'Google' },
  { domain: 'doubleclick.net', urlFilter: '||doubleclick.net^', provider: 'Google' },
  { domain: 'googleadservices.com', urlFilter: '||googleadservices.com^', provider: 'Google' },
  { domain: 'adservice.google.com', urlFilter: '||adservice.google.com^', provider: 'Google' },
  { domain: 'tpc.googlesyndication.com', urlFilter: '||tpc.googlesyndication.com^', provider: 'Google' },
  { domain: 'googletagservices.com', urlFilter: '||googletagservices.com^', provider: 'Google' },

  // Amazon Ads
  { domain: 'amazon-adsystem.com', urlFilter: '||amazon-adsystem.com^', provider: 'Amazon' },
  { domain: 'aax.amazon-adsystem.com', urlFilter: '||aax.amazon-adsystem.com^', provider: 'Amazon' },
  { domain: 'assoc-amazon.com', urlFilter: '||assoc-amazon.com^', provider: 'Amazon' },

  // Media.net
  { domain: 'media.net', urlFilter: '||media.net^', provider: 'Media.net' },
  { domain: 'contextweb.com', urlFilter: '||contextweb.com^', provider: 'Media.net' },

  // Taboola
  { domain: 'cdn.taboola.com', urlFilter: '||cdn.taboola.com^', provider: 'Taboola' },
  { domain: 'trc.taboola.com', urlFilter: '||trc.taboola.com^', provider: 'Taboola' },
  { domain: 'api.taboola.com', urlFilter: '||api.taboola.com^', provider: 'Taboola' },

  // Outbrain
  { domain: 'widgets.outbrain.com', urlFilter: '||widgets.outbrain.com^', provider: 'Outbrain' },
  { domain: 'outbrain.com', urlFilter: '||outbrain.com^', provider: 'Outbrain' },
  { domain: 'paid.outbrain.com', urlFilter: '||paid.outbrain.com^', provider: 'Outbrain' },

  // Other common ad networks
  { domain: 'serving-sys.com', urlFilter: '||serving-sys.com^', provider: 'Sizmek' },
  { domain: 'adnxs.com', urlFilter: '||adnxs.com^', provider: 'AppNexus' },
  { domain: 'criteo.com', urlFilter: '||criteo.com^', provider: 'Criteo' },
  { domain: 'criteo.net', urlFilter: '||criteo.net^', provider: 'Criteo' },
  { domain: 'rubiconproject.com', urlFilter: '||rubiconproject.com^', provider: 'Rubicon' },
  { domain: 'pubmatic.com', urlFilter: '||pubmatic.com^', provider: 'PubMatic' },
  { domain: 'openx.net', urlFilter: '||openx.net^', provider: 'OpenX' },
  { domain: 'casalemedia.com', urlFilter: '||casalemedia.com^', provider: 'Index Exchange' },
  { domain: 'adform.net', urlFilter: '||adform.net^', provider: 'Adform' },
  { domain: 'smartadserver.com', urlFilter: '||smartadserver.com^', provider: 'Smart AdServer' }
];

/**
 * Resource types to block for ad networks.
 * We block scripts, images, sub-frames (iframes), and XHR — but NOT main_frame
 * since we want pages to load normally.
 */
var AD_BLOCK_RESOURCE_TYPES = ['script', 'image', 'sub_frame', 'xmlhttprequest', 'stylesheet', 'media'];

/**
 * Get all ad network domains as a flat array of domain strings
 * @returns {string[]}
 */
function getAdNetworkDomainList() {
  return AD_NETWORK_DOMAINS.map(function(entry) { return entry.domain; });
}

// Export for Node.js/Jest testing environment
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof process !== 'undefined') {
  module.exports = { AD_NETWORK_DOMAINS, AD_BLOCK_RESOURCE_TYPES, getAdNetworkDomainList };
}
