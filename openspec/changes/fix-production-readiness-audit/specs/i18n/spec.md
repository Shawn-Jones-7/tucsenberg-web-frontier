## ADDED Requirements

### Requirement: Complete i18n Coverage for Error Pages
All error pages and error states SHALL use translation keys from the i18n system, with no hardcoded user-facing text.

#### Scenario: Global error page in Chinese locale
- **WHEN** a global error occurs while user is browsing `/zh/...`
- **THEN** the error page SHALL display Chinese text from translation keys
- **AND** no English hardcoded text SHALL appear

#### Scenario: Product error page localization
- **WHEN** an error occurs on the products page in English locale
- **THEN** the error message and recovery actions SHALL be in English
- **AND** the same error in Chinese locale SHALL display Chinese text

#### Scenario: Contact error page localization
- **WHEN** an error occurs on the contact page
- **THEN** the error content SHALL match the current locale
- **AND** the "Try again" and "Go home" buttons SHALL be translated

### Requirement: Localized Form Feedback Messages
All form submission feedback (success, error, pending states) SHALL use translation keys.

#### Scenario: Optimistic form submission message
- **WHEN** a form is being submitted
- **THEN** the pending message SHALL be displayed in the current locale
- **AND** no hardcoded English text like "Submitting..." SHALL appear in Chinese locale

#### Scenario: Server action error messages
- **WHEN** a server action returns an error
- **THEN** the error message SHALL be localized
- **AND** the message key SHALL exist in both `en` and `zh` translation files

### Requirement: Locale 404 Page
The system SHALL provide a localized 404 Not Found page for each supported locale.

#### Scenario: 404 in English locale
- **WHEN** user navigates to a non-existent page under `/en/...`
- **THEN** a 404 page SHALL be displayed in English
- **AND** navigation options SHALL use the `Link` component from `@/i18n/routing`

#### Scenario: 404 in Chinese locale
- **WHEN** user navigates to a non-existent page under `/zh/...`
- **THEN** a 404 page SHALL be displayed in Chinese
- **AND** the page SHALL maintain consistent styling with other error pages

### Requirement: Locale-Aware Date Formatting
Date displays SHALL use locale-appropriate formatting via `Intl.DateTimeFormat`.

#### Scenario: Blog post date in English
- **WHEN** viewing a blog post in English locale
- **THEN** dates SHALL be formatted as "January 2, 2026" or similar English format

#### Scenario: Blog post date in Chinese
- **WHEN** viewing a blog post in Chinese locale
- **THEN** dates SHALL be formatted as "2026年1月2日" or similar Chinese format
