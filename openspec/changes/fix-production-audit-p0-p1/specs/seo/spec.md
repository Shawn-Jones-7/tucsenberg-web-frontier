## ADDED Requirements

### Requirement: Apple Touch Icon
The application SHALL provide an Apple Touch Icon for iOS home screen bookmarks.

#### Scenario: Icon file present
- **WHEN** iOS user adds site to home screen
- **THEN** `apple-icon.png` (180x180) MUST be served from `/apple-icon.png`
- **AND** icon MUST be automatically included in `<head>` via Next.js metadata

#### Scenario: Icon metadata
- **WHEN** browser requests page metadata
- **THEN** `<link rel="apple-touch-icon">` MUST be present in HTML head
- **AND** icon MUST be properly sized (180x180 pixels)

### Requirement: Production Domain Configuration
SEO metadata SHALL use production domain instead of placeholder values.

#### Scenario: Canonical URL generation
- **WHEN** generating canonical URLs for pages
- **THEN** base URL MUST NOT contain `example.com`
- **AND** base URL MUST NOT contain `localhost` in production
- **AND** `metadataBase` MUST be set to actual production domain

#### Scenario: Open Graph URLs
- **WHEN** generating Open Graph metadata
- **THEN** `og:url` MUST use production domain
- **AND** `og:image` MUST use absolute URL with production domain

### Requirement: Hreflang Consistency
Alternate language links SHALL use consistent production domain across all locales.

#### Scenario: Language alternates
- **WHEN** generating `alternates.languages` metadata
- **THEN** all locale URLs MUST use same base domain
- **AND** URLs MUST NOT mix placeholder and real domains
