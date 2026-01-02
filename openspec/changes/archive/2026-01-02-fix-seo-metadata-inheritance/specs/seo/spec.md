## ADDED Requirements

### Requirement: Path-Aware Metadata Generation
The system SHALL generate page metadata with correct canonical URLs, hreflang alternates, and OpenGraph URLs based on the actual page path, not inherited from layout.

#### Scenario: Static page metadata
- **WHEN** a static page (about, contact, products, blog, faq, privacy, terms) is rendered
- **THEN** the page's `alternates.canonical` SHALL be `${baseUrl}/${locale}${pagePath}`
- **AND** the page's `alternates.languages` SHALL contain URLs for all supported locales with the correct path
- **AND** the page's `openGraph.url` SHALL match the canonical URL

#### Scenario: Dynamic page metadata
- **WHEN** a dynamic page (products/[slug], blog/[slug]) is rendered
- **THEN** the page's `alternates.canonical` SHALL be `${baseUrl}/${locale}${dynamicPath}`
- **AND** the page's `alternates.languages` SHALL contain URLs for all supported locales with the correct dynamic path
- **AND** the page's `openGraph.url` SHALL match the canonical URL

#### Scenario: Homepage metadata
- **WHEN** the homepage is rendered
- **THEN** the page's `alternates.canonical` SHALL be `${baseUrl}/${locale}`
- **AND** the page's `alternates.languages` SHALL contain URLs for all supported locales

### Requirement: Layout Metadata Isolation
The system SHALL NOT export `alternates` or `openGraph` fields from layout-level metadata to prevent inheritance pollution.

#### Scenario: Layout metadata export
- **WHEN** the locale layout generates metadata
- **THEN** the metadata SHALL NOT include `alternates` field
- **AND** the metadata SHALL NOT include `openGraph` field with URL
- **AND** the metadata MAY include base fields like `robots`, `verification`, and title template

### Requirement: Sitemap Blog Coverage
The system SHALL include all blog detail pages in the sitemap.xml with correct alternates.

#### Scenario: Blog entries in sitemap
- **WHEN** sitemap.xml is generated
- **THEN** all published blog posts SHALL be included
- **AND** each blog entry SHALL have correct `lastModified` from post metadata
- **AND** each blog entry SHALL have `alternates.languages` for all locales where the post exists

### Requirement: Detail Page Structured Data
The system SHALL include JSON-LD structured data on product and blog detail pages.

#### Scenario: Product detail JSON-LD
- **WHEN** a product detail page is rendered
- **THEN** the page SHALL include Product schema JSON-LD
- **AND** the schema SHALL include correct `url` matching the page URL

#### Scenario: Blog detail JSON-LD
- **WHEN** a blog detail page is rendered
- **THEN** the page SHALL include Article schema JSON-LD
- **AND** the schema SHALL include correct `url` matching the page URL
- **AND** the schema SHALL include `datePublished` and `dateModified`

### Requirement: Navigation Link Validity
The system SHALL NOT include navigation links to non-existent routes.

#### Scenario: Navigation configuration
- **WHEN** navigation items are configured
- **THEN** all `href` values SHALL point to implemented routes
- **AND** child navigation items SHALL only exist for implemented sub-routes

### Requirement: Conditional Asset Links
The system SHALL only display download links when the referenced asset exists.

#### Scenario: PDF download button
- **WHEN** a product detail page is rendered
- **THEN** the PDF download button SHALL only be displayed if the product has a valid `pdfUrl` field
- **OR** if the corresponding PDF file exists in the public directory

### Requirement: OG Image Configuration
The system SHALL reference existing OG image files in metadata configuration.

#### Scenario: Default OG image
- **WHEN** no custom OG image is specified
- **THEN** the default OG image SHALL be `/images/og-image.svg`
- **AND** the image file SHALL exist in the public directory
