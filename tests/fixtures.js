// Mock sample extension format data for testing
const mockExtensionData = {
  "Wirecutter": {
    "moreInfoUrl": "https://twitter.com/wirecutterunion/status/123",
    "matchingUrlRegexes": [
      "wirecutter.com",
      "nytimes.com/wirecutter",
      "facebook.com/thewirecutter",
      "twitter.com/wirecutter"
    ],
    "startTime": "2023-12-09T00:00:00.000-05:00",
    "endTime": "2023-12-10T00:00:00.000-05:00",
    "actionDetails": {
      "id": "action-123",
      "organization": "Wirecutter Union",
      "actionType": "strike",
      "status": "active",
      "description": "Workers striking for fair wages and benefits",
      "demands": "15% wage increase, healthcare coverage",
      "contactInfo": "support@wirecutterunion.org",
      "logoUrl": "https://example.com/logos/wirecutter-union.png",
      "location": "New York, NY",
      "learnMoreUrl": "https://twitter.com/wirecutterunion/status/123"
    }
  },
  "Example Corp": {
    "moreInfoUrl": "https://example.com/strike-info",
    "matchingUrlRegexes": [
      "example.com",
      "www.example.com",
      "facebook.com/examplecorp"
    ],
    "actionDetails": {
      "id": "action-456",
      "organization": "Workers United Local 789",
      "actionType": "boycott",
      "status": "active",
      "description": "Consumer boycott for worker rights",
      "demands": "Union recognition, fair wages",
      "logoUrl": "https://example.com/logos/workers-united.png",
      "location": "Detroit, MI",
      "learnMoreUrl": "https://example.com/boycott"
    }
  },
  "_optimizedPatterns": {
    "Wirecutter": "(wirecutter\\.com|nytimes\\.com/wirecutter|facebook\\.com/thewirecutter|twitter\\.com/wirecutter)",
    "Example Corp": "(example\\.com|www\\.example\\.com|facebook\\.com/examplecorp)"
  }
};

const mockTransformedActions = [
  {
    id: "action-123",
    title: "Wirecutter Union",
    description: "Workers striking for fair wages and benefits",
    company: "Wirecutter",
    type: "strike",
    status: "active",
    more_info: "https://twitter.com/wirecutterunion/status/123",
    target_urls: ["wirecutter.com", "nytimes.com", "facebook.com", "twitter.com"],
    locations: ["New York, NY"],
    demands: "15% wage increase, healthcare coverage",
    logoUrl: "https://example.com/logos/wirecutter-union.png",
    divisions: [],
    _extensionData: mockExtensionData["Wirecutter"]
  },
  {
    id: "action-456",
    title: "Workers United Local 789",
    description: "Consumer boycott for worker rights",
    company: "Example Corp",
    type: "boycott",
    status: "active",
    more_info: "https://example.com/strike-info",
    target_urls: ["example.com", "www.example.com", "facebook.com"],
    locations: ["Detroit, MI"],
    demands: "Union recognition, fair wages",
    logoUrl: "https://example.com/logos/workers-united.png",
    divisions: [],
    _extensionData: mockExtensionData["Example Corp"]
  }
];

const mockApiResponse304 = {
  status: 304,
  statusText: 'Not Modified',
  ok: false,
  headers: {
    get: (name) => {
      if (name === 'X-Content-Hash') return 'abc123hash';
      return null;
    }
  }
};

const mockApiResponse200 = {
  status: 200,
  statusText: 'OK',
  ok: true,
  headers: {
    get: (name) => {
      if (name === 'X-Content-Hash') return 'def456hash';
      return null;
    }
  },
  json: () => Promise.resolve(mockExtensionData)
};

const mockApiResponse401 = {
  status: 401,
  statusText: 'Unauthorized',
  ok: false,
  headers: {
    get: () => null
  }
};

const mockApiResponse429 = {
  status: 429,
  statusText: 'Too Many Requests',
  ok: false,
  headers: {
    get: (name) => {
      if (name === 'Retry-After') return '120';
      return null;
    }
  }
};

module.exports = {
  mockExtensionData,
  mockTransformedActions,
  mockApiResponse200,
  mockApiResponse304,
  mockApiResponse401,
  mockApiResponse429
};
