## REMOVED Requirements

### Requirement: Analytics Endpoint Rate Limiting (REMOVED)

The following requirements are REMOVED as the endpoints no longer exist:

#### ~~Scenario: Web vitals endpoint protected~~ (REMOVED)
- ~~WHEN requests are sent to `/api/analytics/web-vitals`~~
- ~~THEN requests MUST be rate limited (default: 100 req/min/IP)~~
- ~~AND exceeding limit MUST return HTTP 429~~

**Reason**: Endpoint removed. Web Vitals monitoring now handled by Vercel Speed Insights.

#### ~~Scenario: i18n analytics endpoint protected~~ (REMOVED)
- ~~WHEN requests are sent to `/api/analytics/i18n`~~
- ~~THEN requests MUST be rate limited (default: 100 req/min/IP)~~
- ~~AND exceeding limit MUST return HTTP 429~~

**Reason**: Endpoint removed. i18n analytics was unused scaffolding code.

---

## ADDED Requirements

### Requirement: No Self-Built Telemetry Collection Endpoints

The template SHALL NOT expose self-built telemetry collection endpoints for RUM/performance/i18n analytics.

**Note**: This requirement does not prohibit security/reporting endpoints such as `/api/csp-report`, nor operational endpoints such as `/api/health`.

#### Scenario: Monitoring dashboard endpoint removed
- **WHEN** a client sends a request to `/api/monitoring/dashboard` (any method)
- **THEN** the server MUST respond with HTTP 404
- **AND** no monitoring dashboard data MUST be returned

#### Scenario: Web vitals collection endpoint removed
- **WHEN** a client sends a request to `/api/analytics/web-vitals` (any method)
- **THEN** the server MUST respond with HTTP 404

#### Scenario: i18n analytics endpoint removed
- **WHEN** a client sends a request to `/api/analytics/i18n` (any method)
- **THEN** the server MUST respond with HTTP 404

### Requirement: Use Third-Party Monitoring Services

When monitoring/analytics are enabled, the template SHALL rely on established third-party services:

#### Scenario: Performance monitoring via Speed Insights
- **WHEN** Core Web Vitals monitoring is enabled/needed
- **THEN** Vercel Speed Insights MUST be used
- **AND** no self-built Web Vitals collection endpoints SHALL exist

#### Scenario: Traffic analytics via Vercel Analytics + GA4
- **WHEN** traffic and user behavior analytics are enabled/needed
- **THEN** Vercel Analytics and/or GA4 MUST be used
- **AND** no self-built analytics collection endpoints SHALL exist
