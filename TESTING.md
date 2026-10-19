# EV Lineup AI Optimization Testing Guide

This document provides instructions for testing all the AI optimization features.

## Prerequisites

The preview deployment is protected by Vercel SSO. To test:
1. Authenticate with Vercel SSO at the preview URL
2. Or wait for production deployment to test on https://www.evlineup.org

## Test Cases

### 1. Test `/llms.txt` - AI Assistant Guide

**What it is:** Comprehensive guide for AI assistants about EV Lineup's capabilities

**Test:**
```bash
curl -L https://www.evlineup.org/llms.txt
```

**Expected result:**
- Plain text file with comprehensive AI guide
- Contains: what EV Lineup is, how to use it, example queries, FAQ, API documentation
- NOT the React app shell (should be actual text content)

**Key content to verify:**
- "EV Lineup is a comprehensive, up-to-date electric vehicle comparison database"
- "87+ EV models from 37 manufacturers"
- API endpoints documentation
- Common questions and answers

### 2. Test robots.txt - AI Bot Permissions

**Test:**
```bash
curl https://www.evlineup.org/robots.txt
```

**Expected result:**
- Explicitly allows AI crawlers:
  - GPTBot
  - PerplexityBot
  - ClaudeBot / Claude-Web
  - Google-Extended
  - anthropic-ai
  - And others

### 3. Test Homepage Prerendering with FAQ

**Test:**
```bash
curl https://www.evlineup.org/ | grep -A5 "FAQ"
```

**Expected result:**
- Raw HTML should contain FAQ section in `<details>` tags
- Should include JSON-LD schema with FAQPage markup
- Meta description should say "87+ EVs" (NOT "200+ EVs")
- Should include clear description: "EV Lineup is a comprehensive database of every electric vehicle on the market"

**Verify in HTML:**
```bash
# Check for FAQ in prerendered HTML
curl -s https://www.evlineup.org/ | grep -i "frequently asked questions"

# Check for correct model count
curl -s https://www.evlineup.org/ | grep -E "87\+ EV"

# Check for FAQ JSON-LD
curl -s https://www.evlineup.org/ | grep -A20 "FAQPage"
```

### 4. Test Public API Endpoints

All API endpoints are public, require no authentication, and return JSON.

#### 4.1 List All EVs
```bash
curl https://www.evlineup.org/api/ev/all | jq '.count, .data[0]'
```

**Expected:** Returns count and array of all EVs with basic specs

#### 4.2 Search EVs
```bash
# Search by name
curl "https://www.evlineup.org/api/ev/search?q=tesla" | jq '.count'

# Filter by range
curl "https://www.evlineup.org/api/ev/search?minRange=300" | jq '.count'

# Filter by price
curl "https://www.evlineup.org/api/ev/search?maxPrice=50000" | jq '.count'

# Multiple filters
curl "https://www.evlineup.org/api/ev/search?q=electric&minRange=250&maxPrice=60000" | jq '.count'
```

**Expected:** Returns filtered list of EVs matching criteria

#### 4.3 Compare Two EVs
```bash
curl "https://www.evlineup.org/api/ev/compare?models=tesla-model-3,bmw-i4" | jq '.model1.name, .model2.name, .differences'
```

**Expected:** Returns side-by-side comparison with calculated differences

#### 4.4 Get Full Specs
```bash
curl "https://www.evlineup.org/api/ev/specs?slug=tesla-model-3" | jq '.name, .pricing, .performance'
```

**Expected:** Returns complete specifications for one model

#### 4.5 Get Best EVs Lists
```bash
# Cheapest
curl "https://www.evlineup.org/api/ev/best?criteria=cheapest-evs" | jq '.title, .count'

# Longest range
curl "https://www.evlineup.org/api/ev/best?criteria=longest-range-evs" | jq '.title, .count'

# Fastest
curl "https://www.evlineup.org/api/ev/best?criteria=fastest-evs" | jq '.title, .count'

# Electric trucks (NEW)
curl "https://www.evlineup.org/api/ev/best?criteria=electric-trucks" | jq '.title, .count'
```

**Expected:** Returns ranked list for each criteria

### 5. Test OpenAPI Specification

**Test:**
```bash
curl https://www.evlineup.org/openapi.json | jq '.info, .paths | keys'
```

**Expected result:**
- Valid OpenAPI 3.1.0 JSON
- Contains 5 paths: /ev/all, /ev/search, /ev/compare, /ev/specs, /ev/best
- Complete schema definitions

**Validate:**
```bash
# Use online validator or:
npx @redocly/cli lint https://www.evlineup.org/openapi.json
```

### 6. Test New SEO Pages (Prerendered)

#### 6.1 Electric Trucks Page
```bash
curl https://www.evlineup.org/best/electric-trucks | grep -A10 "prerender"
```

**Expected:** 
- Prerendered HTML with list of electric trucks
- NOT just empty app shell
- Contains actual truck names in HTML

#### 6.2 300+ Mile Range Page
```bash
curl https://www.evlineup.org/best/300-mile-range-evs | grep -A10 "prerender"
```

**Expected:**
- Prerendered HTML with list of long-range EVs
- Shows actual EV names and ranges
- Not empty React div

### 7. Test MCP Server Manifest

**Test:**
```bash
curl https://www.evlineup.org/mcp.json | jq '.name, .tools | length'
```

**Expected:**
- Valid MCP server manifest
- 5 tools defined
- Name: "evlineup"

### 8. Verify CORS Headers (for public API access)

```bash
curl -I https://www.evlineup.org/api/ev/all | grep -i "access-control"
```

**Expected:**
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

### 9. Verify Prerendering vs Client-Side

**Test prerendering works:**
```bash
# This should show actual content in HTML (not empty div)
curl -s https://www.evlineup.org/ | grep -o "<div class=\"prerender\">[^<]*" | head -1

# Compare word count - prerendered should be much higher
curl -s https://www.evlineup.org/ | wc -w
```

**Expected:**
- Should see 500+ words in HTML (not just 140-240 words from app shell)
- Content should include actual EV names, specs, FAQ text

### 10. Test with AI Bot User-Agent

Simulate AI crawler:
```bash
# GPTBot
curl -A "GPTBot" https://www.evlineup.org/ | grep -c "Tesla\|BMW\|Ford"

# PerplexityBot
curl -A "PerplexityBot" https://www.evlineup.org/llms.txt | head -20
```

**Expected:** Same content as regular user-agent (no cloaking)

## Success Criteria

✅ All tests pass
✅ `/llms.txt` returns full text (not app shell)
✅ APIs return JSON data
✅ OpenAPI spec is valid
✅ Prerendered pages contain actual content
✅ Model count is consistent (87+, not 200+)
✅ FAQ appears in homepage HTML
✅ CORS headers present on all API endpoints
✅ New SEO pages are prerendered and indexed

## Performance Checks

```bash
# API response time should be < 2 seconds
time curl -s "https://www.evlineup.org/api/ev/all" > /dev/null

# Prerendered page should load fast
time curl -s "https://www.evlineup.org/best/cheapest-evs" > /dev/null

# Check caching headers
curl -I "https://www.evlineup.org/api/ev/all" | grep -i "cache-control"
```

## Screenshots Needed

For Jean-Paul's review, capture rendered browser screenshots of:

1. ✅ Homepage with FAQ section visible
2. ✅ `/llms.txt` page
3. ✅ `/openapi.json` formatted
4. ✅ `/best/electric-trucks` page
5. ✅ `/best/300-mile-range-evs` page
6. One API response example (formatted JSON in browser)

## Notes

- Preview deployment is protected by Vercel SSO
- All changes are backward-compatible
- No secrets in code (all data from public backend)
- APIs are read-only (no authentication required)
- Prerendering works server-side (bots see real content)
