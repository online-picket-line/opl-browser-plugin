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
  { domain: 'smartadserver.com', urlFilter: '||smartadserver.com^', provider: 'Smart AdServer' },

  // Programmatic / header bidding platforms
  { domain: 'adsrvr.org', urlFilter: '||adsrvr.org^', provider: 'The Trade Desk' },
  { domain: 'thetradedesk.com', urlFilter: '||thetradedesk.com^', provider: 'The Trade Desk' },
  { domain: 'bidswitch.net', urlFilter: '||bidswitch.net^', provider: 'BidSwitch' },
  { domain: 'sharethrough.com', urlFilter: '||sharethrough.com^', provider: 'Sharethrough' },
  { domain: 'triplelift.com', urlFilter: '||triplelift.com^', provider: 'TripleLift' },
  { domain: '33across.com', urlFilter: '||33across.com^', provider: '33Across' },
  { domain: 'indexexchange.com', urlFilter: '||indexexchange.com^', provider: 'Index Exchange' },
  { domain: 'liveintent.com', urlFilter: '||liveintent.com^', provider: 'LiveIntent' },
  { domain: 'yieldmo.com', urlFilter: '||yieldmo.com^', provider: 'Yieldmo' },
  { domain: 'teads.tv', urlFilter: '||teads.tv^', provider: 'Teads' },
  { domain: 'gumgum.com', urlFilter: '||gumgum.com^', provider: 'GumGum' },
  { domain: 'kargo.com', urlFilter: '||kargo.com^', provider: 'Kargo' },

  // Native ad platforms
  { domain: 'nativo.com', urlFilter: '||nativo.com^', provider: 'Nativo' },
  { domain: 'ntv.io', urlFilter: '||ntv.io^', provider: 'Nativo' },
  { domain: 'revcontent.com', urlFilter: '||revcontent.com^', provider: 'RevContent' },
  { domain: 'mgid.com', urlFilter: '||mgid.com^', provider: 'MGID' },
  { domain: 'connatix.com', urlFilter: '||connatix.com^', provider: 'Connatix' },

  // Tracking / ad measurement (often load ad creatives)
  { domain: 'moatads.com', urlFilter: '||moatads.com^', provider: 'Moat' },
  { domain: 'adsafeprotected.com', urlFilter: '||adsafeprotected.com^', provider: 'IAS' },
  { domain: 'doubleverify.com', urlFilter: '||doubleverify.com^', provider: 'DoubleVerify' },

  // Video ad networks
  { domain: 'spotxchange.com', urlFilter: '||spotxchange.com^', provider: 'SpotX' },
  { domain: 'springserve.com', urlFilter: '||springserve.com^', provider: 'SpringServe' },

  // Additional exchanges / SSPs
  { domain: 'sovrn.com', urlFilter: '||sovrn.com^', provider: 'Sovrn' },
  { domain: 'lijit.com', urlFilter: '||lijit.com^', provider: 'Sovrn' },
  { domain: 'districtm.io', urlFilter: '||districtm.io^', provider: 'District M' },
  { domain: 'conversantmedia.com', urlFilter: '||conversantmedia.com^', provider: 'Conversant' },
  { domain: 'mediavine.com', urlFilter: '||mediavine.com^', provider: 'Mediavine' },
  { domain: 'ad-delivery.net', urlFilter: '||ad-delivery.net^', provider: 'Ad Delivery' }
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
