# API Documentation Sources to Check

## Primary Documentation URLs to Try:
1. https://github.com/online-picket-line/online-picketline/blob/main/API.md
2. https://github.com/online-picket-line/online-picketline/blob/main/docs/API.md  
3. https://github.com/online-picket-line/online-picketline/blob/main/api/README.md
4. https://github.com/online-picket-line/online-picketline/blob/main/README.md (check for API section)

## Instance Documentation:
- YOUR_INSTANCE_URL/api/docs
- YOUR_INSTANCE_URL/docs
- YOUR_INSTANCE_URL/swagger
- YOUR_INSTANCE_URL/api

## API Discovery Endpoints to Test:
- GET YOUR_INSTANCE_URL/api/ (may return available endpoints)
- GET YOUR_INSTANCE_URL/api/version
- GET YOUR_INSTANCE_URL/health
- GET YOUR_INSTANCE_URL/.well-known/api

## Changes to Look For:

### Authentication
- New API key requirement
- OAuth implementation  
- JWT tokens
- Rate limiting changes

### Endpoints
- Versioning added (v1, v2)
- Endpoint renames
- New query parameters
- Deprecation notices

### Response Format
- Field name changes
- Data structure modifications
- New required/optional fields
- Error response format changes

### Headers
- New required headers
- CORS policy changes
- Content-Type requirements

## Browser Plugin Update Areas:

### 1. api-service.js
```javascript
// Check these areas for updates:
- DEFAULT_API_BASE_URL 
- CACHE_DURATION
- fetch() headers
- response parsing
- error handling
```

### 2. Authentication
```javascript
// If API keys added:
- Storage for API key
- UI for API key input
- Header configuration
```

### 3. Response Handling
```javascript
// If response format changed:
- transformApiResponse() method
- Field mapping updates
- Error response parsing
```

### 4. Rate Limiting
```javascript
// If rate limits changed:
- CACHE_DURATION adjustment
- Retry logic updates
- Error handling for 429s
```